"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIAPIPE_WASM_BASE } from "@/lib/cgr-gowns";
import { TIARA_IMAGE_SIZE, TIARA_IMAGE_SRC } from "@/lib/cgr-tiara-image";
import { getModelBytes } from "./mediapipe-warm";
import { createTiaraScene } from "./tiara-scene";
import { smoothPose, tiaraPose, type TiaraPose } from "@/lib/cgr-tiara-pose";

/** Show the framing tip after this long with no face found. */
export const NO_FACE_TIP_MS = 5000;

type Status =
  | "starting"
  | "loading"
  | "live"
  | "denied"
  | "nocamera"
  | "busy"
  | "unsupported"
  | "error";

const MESSAGES: Record<Exclude<Status, "live">, { title: string; body: string }> = {
  starting: {
    title: "Opening your camera…",
    body: "Your browser will ask for camera access. Tap Allow.",
  },
  loading: {
    title: "Getting the tiara ready…",
    body: "Loading the face tracker. This takes a few seconds the first time.",
  },
  denied: {
    title: "Camera access is off",
    body: "To try the tiara, allow camera access for this page in your browser settings, then tap Try again.",
  },
  nocamera: {
    title: "No camera found",
    body: "Open this page on your phone to try the tiara with the front camera.",
  },
  busy: {
    title: "Camera is busy",
    body: "Another app is using the camera. Close it, then tap Try again.",
  },
  unsupported: {
    title: "This browser can’t open the camera here",
    body: "Open this page in Chrome or Safari on your phone to try the tiara.",
  },
  error: {
    title: "The tiara couldn’t load",
    body: "Check your connection, then tap Try again.",
  },
};

function classifyCameraError(err: unknown): Status {
  const name = (err as { name?: string } | null)?.name ?? "";
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "nocamera";
  if (name === "NotReadableError" || name === "AbortError") return "busy";
  return "error";
}

type Landmarker = {
  detectForVideo: (
    v: HTMLVideoElement,
    t: number,
  ) => { faceLandmarks: { x: number; y: number; z: number }[][] };
  close: () => void;
};

async function createLandmarker(): Promise<Landmarker> {
  const [{ FaceLandmarker, FilesetResolver }, model] = await Promise.all([
    import("@mediapipe/tasks-vision"),
    getModelBytes(),
  ]);
  const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_BASE);
  const make = (delegate: "GPU" | "CPU") =>
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetBuffer: model, delegate },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });
  try {
    return (await make("GPU")) as unknown as Landmarker;
  } catch {
    return (await make("CPU")) as unknown as Landmarker;
  }
}

export function TiaraTryOn({ onClose }: { onClose: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<Status>("starting");
  const [faceSeen, setFaceSeen] = useState(true);
  /** No face for 5 s since going live (or since last seen): show a tip. */
  const [needTip, setNeedTip] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setStatus("starting");
    setNeedTip(false);
    setAttempt((n) => n + 1);
  }, []);

  // Esc closes; focus the close button on open; lock page scroll.
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
    let landmarker: Landmarker | null = null;
    let raf = 0;
    let disposeGl: (() => void) | null = null;

    const stop = () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      const v = videoRef.current;
      if (v) v.srcObject = null;
      try {
        landmarker?.close();
      } catch {
        /* already closed */
      }
      landmarker = null;
      disposeGl?.();
    };

    (async () => {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia ||
        !window.isSecureContext
      ) {
        setStatus("unsupported");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
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
        /* autoplay of a muted inline stream normally succeeds */
      }

      setStatus("loading");
      let THREE: typeof import("three");
      try {
        const [three, lmk] = await Promise.all([
          import("three"),
          createLandmarker(),
        ]);
        THREE = three;
        if (cancelled) {
          // Closed while loading: release the tracker right away.
          lmk.close();
          return;
        }
        landmarker = lmk;
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }

      let overlay: Awaited<ReturnType<typeof createTiaraScene>>;
      try {
        overlay = await createTiaraScene(THREE, canvas);
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled) {
        overlay.dispose();
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
      let lastVideoTime = -1;
      let pose: TiaraPose | null = null;
      let lastSeen = performance.now();
      let seen = true;
      let tip = false;

      const loop = () => {
        if (cancelled || !landmarker) return;
        raf = requestAnimationFrame(loop);
        const now = performance.now();
        if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          // Frames go straight from the <video> element into the on-device
          // tracker. Nothing is drawn to a 2D canvas, stored or sent.
          let face: { x: number; y: number; z: number }[] | undefined;
          try {
            face = landmarker.detectForVideo(video, now).faceLandmarks?.[0];
          } catch {
            cancelAnimationFrame(raf);
            setStatus("error");
            return;
          }
          const { W, H } = overlay.size;
          const next = face
            ? tiaraPose(face, {
                videoW: video.videoWidth,
                videoH: video.videoHeight,
                stageW: W,
                stageH: H,
                mirrored: true,
              })
            : null;
          if (next) {
            pose = smoothPose(pose, next, 0.55);
            lastSeen = now;
          }
        }
        const visible = pose !== null && now - lastSeen < 350;
        if (visible !== seen) {
          seen = visible;
          setFaceSeen(visible);
        }
        const wantTip = !visible && now - lastSeen > NO_FACE_TIP_MS;
        if (wantTip !== tip) {
          tip = wantTip;
          setNeedTip(wantTip);
        }
        overlay.update(pose, visible);
        overlay.render();
      };
      loop();
    })();

    return stop;
  }, [attempt]);

  const message = status === "live" ? null : MESSAGES[status];
  const canRetry =
    status === "denied" || status === "busy" || status === "error";

  return (
    <div
      className="cg-tryon"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cg-tryon-title"
    >
      <div className="cg-tryon-top">
        <h2 id="cg-tryon-title" className="cg-tryon-title">
          Try the tiara
        </h2>
        <button
          ref={closeRef}
          type="button"
          className="cg-btn cg-btn-ghost cg-tryon-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div ref={stageRef} className="cg-stage" data-status={status}>
        <video
          ref={videoRef}
          className="cg-video"
          playsInline
          muted
          autoPlay
          aria-hidden="true"
        />
        <canvas ref={canvasRef} className="cg-overlay" aria-hidden="true" />

        {message ? (
          <div className="cg-stage-msg" role="status" aria-live="polite">
            <p className="cg-stage-msg-title">{message.title}</p>
            <p className="cg-stage-msg-body">{message.body}</p>
            {status === "nocamera" || status === "unsupported" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="cg-stage-tiara"
                src={TIARA_IMAGE_SRC}
                alt="The teal tiara you’d try on"
                width={TIARA_IMAGE_SIZE.width}
                height={TIARA_IMAGE_SIZE.height}
              />
            ) : null}
            {canRetry ? (
              <button type="button" className="cg-btn" onClick={retry}>
                Try again
              </button>
            ) : null}
          </div>
        ) : !faceSeen ? (
          <p
            className={needTip ? "cg-hint cg-hint-tip" : "cg-hint"}
            role="status"
            aria-live="polite"
          >
            {needTip
              ? "Hold the phone at arm’s length, face the light"
              : "Look straight at the camera"}
          </p>
        ) : null}
      </div>

      <p className="cg-privacy">
        Your camera stays on your phone. The tiara is placed by a face tracker
        that runs in your browser. No video or photo is recorded, saved or
        sent anywhere.
      </p>
    </div>
  );
}
