"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WEAR_ASSETS } from "@/lib/cgr-gowns";
import { toStage, type NormLandmark } from "@/lib/cgr-tiara-pose";
import {
  FL,
  PointSmoother,
  armsInFront,
  autoMode,
  bodyFromPose,
  braceletPlacements,
  chokerPlacement,
  dist,
  earringPlacements,
  gownGrid,
  gridRows,
  type Body,
  type BodyKey,
  type Placement,
  type PoseLandmark,
  type Pt,
  type WearMode,
} from "@/lib/cgr-wear-pose";
import { createFaceTracker, createPoseTracker, type FaceTracker, type PoseTracker } from "./landmarkers";
import { createWearScene } from "./wear-scene";
import type { WearDraw } from "./wear-types";

/** Copy from the r6 brief, exactly. */
export const WEAR_TIP = "Step back ~2 m, phone at chest height, face the camera.";
export const WEAR_HONEST = "It works face-on. Side turns or crossed arms will break it.";

type Status = "starting" | "loading" | "live" | "denied" | "nocamera" | "busy" | "unsupported" | "error";
type Choice = "auto" | WearMode;

const MESSAGES: Record<Exclude<Status, "live">, { title: string; body: string }> = {
  starting: { title: "Opening your camera…", body: "Your browser will ask for camera access. Tap Allow." },
  loading: { title: "Getting the gown ready…", body: `Loading the body tracker. ${WEAR_TIP}` },
  denied: {
    title: "Camera access is off",
    body: "To wear the gown live, allow camera access for this page in your browser settings, then tap Try again.",
  },
  nocamera: { title: "No camera found", body: "Open this page on your phone to wear the gown with the front camera." },
  busy: { title: "Camera is busy", body: "Another app is using the camera. Close it, then tap Try again." },
  unsupported: {
    title: "This browser can’t open the camera here",
    body: "Open this page in Chrome or Safari on your phone to wear the gown live.",
  },
  error: { title: "The gown couldn’t load", body: "Check your connection, then tap Try again." },
};

function classifyCameraError(err: unknown): Status {
  const name = (err as { name?: string } | null)?.name ?? "";
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "nocamera";
  if (name === "NotReadableError" || name === "AbortError") return "busy";
  return "error";
}

const BODY_KEYS: BodyKey[] = [
  "shL", "shR", "elL", "elR", "wrL", "wrR", "hipL", "hipR", "knL", "knR", "anL", "anR", "nose", "mouth",
];
const FACE_KEYS = [FL.noseTip, FL.foreheadTop, FL.chin, FL.cheekR, FL.cheekL, FL.earR, FL.earL] as const;
/** Mode must hold this many frames before auto switches (no flicker). */
const MODE_HOLD = 8;
const LOST_MS = 350;

/** Test/measurement hooks, only with ?cgwear-test or ?cgwear-stats in the URL. In memory only. */
type Hooks = {
  override?: { pose?: PoseLandmark[] | null; face?: NormLandmark[] | null };
  stats?: { frames: number; poseMs: number; faceMs: number; renderMs: number; faceFrames: number; mode: string | null };
};
const hooks = (): Hooks | null => {
  if (typeof window === "undefined") return null;
  const q = window.location.search;
  if (!q.includes("cgwear-test") && !q.includes("cgwear-stats")) return null;
  const w = window as unknown as { __cgWear?: Hooks };
  w.__cgWear ??= {};
  return w.__cgWear;
};

export function WearLive({ onClose }: { onClose: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<Status>("starting");
  const [attempt, setAttempt] = useState(0);
  const [choice, setChoice] = useState<Choice>("auto");
  const choiceRef = useRef<Choice>("auto");
  const [shown, setShown] = useState<WearMode | null>(null);
  const [needFeet, setNeedFeet] = useState(false);

  const pick = useCallback((c: Choice) => {
    choiceRef.current = c;
    setChoice(c);
  }, []);
  const retry = useCallback(() => {
    setStatus("starting");
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let pose: PoseTracker | null = null;
    let face: FaceTracker | null = null;
    let raf = 0;
    let disposeGl: (() => void) | null = null;

    const stop = () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      const v = videoRef.current;
      if (v) v.srcObject = null;
      for (const t of [pose, face]) {
        try {
          t?.close();
        } catch {
          /* already closed */
        }
      }
      pose = null;
      face = null;
      disposeGl?.();
    };

    (async () => {
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
        setStatus("unsupported");
        return;
      }
      try {
        // Ask for a frame the same way up as the screen: a portrait phone needs
        // a tall frame to fit head to feet.
        const portrait = window.innerHeight > window.innerWidth;
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: portrait ? 720 : 1280 },
            height: { ideal: portrait ? 1280 : 720 },
          },
        });
      } catch (err) {
        if (!cancelled) setStatus(classifyCameraError(err));
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!video || !canvas || !stage) return;
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        /* muted inline stream */
      }

      setStatus("loading");
      let overlay: Awaited<ReturnType<typeof createWearScene>>;
      // Tracker (model + wasm) and the gown art load in parallel.
      const sceneP = import("three").then((THREE) => createWearScene(THREE, canvas));
      try {
        const [tracker, scene] = await Promise.all([createPoseTracker(), sceneP]);
        pose = tracker;
        overlay = scene;
        if (cancelled) {
          tracker.close();
          scene.dispose();
          return;
        }
      } catch {
        sceneP.then((sc) => sc.dispose()).catch(() => {});
        if (!cancelled) setStatus("error");
        return;
      }
      const resize = () => {
        const r = stage.getBoundingClientRect();
        overlay.setSize(r.width, r.height);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(stage);
      disposeGl = () => {
        ro.disconnect();
        overlay.dispose();
      };
      setStatus("live");

      // Jewellery on the face loads after the gown is up (doesn't hold up ready).
      createFaceTracker()
        .then((t) => {
          if (cancelled) t.close();
          else face = t;
        })
        .catch(() => {});

      const A = WEAR_ASSETS;
      const rowsFull = gridRows(A.gownFull);
      const rowsBodice = gridRows(A.gownBodice);
      const bodyS = new PointSmoother<BodyKey>(1.2, 0.02);
      const faceS = new PointSmoother<string>(1.5, 0.02);
      const seenAt = new Map<string, number>();
      let body: Body | null = null;
      let facePts: Pt[] | null = null;
      let lastBody = -1e9;
      let lastFace = -1e9;
      let lastVideoTime = -1;
      let frame = 0;
      let mode: WearMode = "half";
      let cand: WearMode = "half";
      let candN = 0;
      let shownNow: WearMode | null = null;
      let feetNow = false;
      const h = hooks();
      if (h) h.stats = { frames: 0, poseMs: 0, faceMs: 0, renderMs: 0, faceFrames: 0, mode: null };

      const smooth = <K extends string>(s: PointSmoother<K>, key: K, p: Pt | null, now: number): Pt | null => {
        if (!p) return null;
        const k = "k" + key;
        if (now - (seenAt.get(k) ?? -1e9) > 400) s.resetKey(key);
        seenAt.set(k, now);
        return s.point(key, p, now / 1000);
      };

      const loop = () => {
        if (cancelled || !pose) return;
        raf = requestAnimationFrame(loop);
        const now = performance.now();
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          frame++;
          const vp = {
            videoW: video.videoWidth || 1280,
            videoH: video.videoHeight || 720,
            stageW: overlay.size.W,
            stageH: overlay.size.H,
            mirrored: true,
          };
          // Frames go straight from <video> into the on-device trackers.
          // Nothing is drawn to a 2D canvas, stored or sent.
          let poseLm: PoseLandmark[] | undefined;
          let faceLm: NormLandmark[] | undefined | null;
          const ov = h?.override;
          try {
            const t0 = performance.now();
            poseLm = ov && "pose" in ov ? (ov.pose ?? undefined) : pose.detectForVideo(video, now).landmarks?.[0];
            const t1 = performance.now();
            if (h?.stats) h.stats.poseMs += t1 - t0;
            if (ov && "face" in ov) faceLm = ov.face;
            else if (face && frame % 2 === 0) {
              faceLm = face.detectForVideo(video, now).faceLandmarks?.[0] ?? null;
              if (h?.stats) {
                h.stats.faceMs += performance.now() - t1;
                h.stats.faceFrames++;
              }
            }
          } catch {
            cancelAnimationFrame(raf);
            setStatus("error");
            return;
          }
          const raw = bodyFromPose(poseLm, vp);
          if (raw) {
            const b = {} as Body;
            for (const k of BODY_KEYS) b[k] = smooth(bodyS, k, raw[k], now);
            body = b;
            lastBody = now;
          }
          if (faceLm !== undefined) {
            if (faceLm && faceLm.length > 454) {
              const pts: Pt[] = [];
              for (const i of FACE_KEYS) pts[i] = smooth(faceS, String(i), toStage(faceLm[i], vp), now)!;
              facePts = pts;
              lastFace = now;
            } else if (faceLm === null) {
              facePts = null;
            }
          }
        }

        const bodyOk = body !== null && now - lastBody < LOST_MS;
        const faceOk = facePts !== null && now - lastFace < LOST_MS;
        const b = bodyOk ? body : null;
        const auto = autoMode(b);
        if (auto) {
          if (auto === cand) candN++;
          else {
            cand = auto;
            candN = 1;
          }
          if (cand !== mode && candN >= MODE_HOLD) mode = cand;
        }
        const c = choiceRef.current;
        const canFull = !!(b && b.hipL && b.hipR && b.anL && b.anR);
        const m: WearMode | null = !b ? null : c === "auto" ? mode : c === "full" && !canFull ? "half" : c;
        const feet = c === "full" && !!b && !canFull;
        const art = m === "full" ? A.gownFull : A.gownBodice;
        const grid = b && m ? gownGrid(b, m, art, m === "full" ? rowsFull : rowsBodice) : null;

        let tiara: Placement | null = null;
        const fp = faceOk ? facePts : null;
        if (fp) {
          const top = fp[FL.foreheadTop];
          const chin = fp[FL.chin];
          const faceH = dist(top, chin) || 1;
          const ux = (top.x - chin.x) / faceH;
          const uy = (top.y - chin.y) / faceH;
          tiara = {
            x: top.x + ux * faceH * 0.04,
            y: top.y + uy * faceH * 0.04,
            w: dist(fp[FL.cheekR], fp[FL.cheekL]) * 1.02,
            rot: Math.atan2(ux, -uy),
            show: true,
          };
        }
        const draw: WearDraw = {
          mode: m,
          grid,
          arms: b && m ? armsInFront(b, m) : [],
          choker: b ? chokerPlacement(b, fp) : null,
          bracelets: b ? braceletPlacements(b) : [null, null],
          earrings: fp ? earringPlacements(fp) : [null, null],
          tiara,
        };
        const r0 = performance.now();
        overlay.update(draw);
        overlay.render();
        if (h?.stats) {
          h.stats.renderMs += performance.now() - r0;
          h.stats.frames++;
          h.stats.mode = m;
        }
        if (m !== shownNow) {
          shownNow = m;
          setShown(m);
        }
        if (feet !== feetNow) {
          feetNow = feet;
          setNeedFeet(feet);
        }
      };
      loop();
    })();

    return stop;
  }, [attempt]);

  const message = status === "live" ? null : MESSAGES[status];
  const canRetry = status === "denied" || status === "busy" || status === "error";
  const choices: { id: Choice; label: string }[] = [
    { id: "auto", label: "Auto" },
    { id: "full", label: "Full gown" },
    { id: "half", label: "Bodice" },
  ];

  return (
    <div className="cg-tryon cg-wear-live" role="dialog" aria-modal="true" aria-labelledby="cg-wear-title">
      <div className="cg-tryon-top">
        <h2 id="cg-wear-title" className="cg-tryon-title">
          Wear it live
        </h2>
        <button ref={closeRef} type="button" className="cg-btn cg-btn-ghost cg-tryon-close" onClick={onClose}>
          Close
        </button>
      </div>

      <div
        ref={stageRef}
        className="cg-stage"
        data-status={status}
        data-wear-mode={shown ?? "none"}
      >
        <video ref={videoRef} className="cg-video" playsInline muted autoPlay aria-hidden="true" />
        <canvas ref={canvasRef} className="cg-overlay" aria-hidden="true" />

        {message ? (
          <div className="cg-stage-msg" role="status" aria-live="polite">
            <p className="cg-stage-msg-title">{message.title}</p>
            <p className="cg-stage-msg-body">{message.body}</p>
            {canRetry ? (
              <button type="button" className="cg-btn" onClick={retry}>
                Try again
              </button>
            ) : null}
          </div>
        ) : !shown ? (
          <p className="cg-hint cg-hint-tip" role="status" aria-live="polite">
            {WEAR_TIP}
          </p>
        ) : needFeet ? (
          <p className="cg-hint" role="status" aria-live="polite">
            Step back so your feet are in view for the full gown
          </p>
        ) : null}

        {status === "live" ? (
          <div className="cg-wear-modes" role="group" aria-label="What to show">
            {choices.map((c) => (
              <button
                key={c.id}
                type="button"
                className="cg-wear-mode"
                aria-pressed={choice === c.id}
                onClick={() => pick(c.id)}
              >
                {c.label}
                {c.id === "auto" && choice === "auto" && shown ? (
                  <span className="cg-visually-hidden">, showing {shown === "full" ? "full gown" : "bodice"}</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <p className="cg-privacy">
        {WEAR_HONEST} Your camera stays on your phone: a body tracker in your browser places the gown, choker,
        bracelets and tiara. No video or photo is recorded, saved or sent anywhere.
      </p>
    </div>
  );
}
