"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CGR_ASSET, CGR_BASE, formatPhp } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";
import { createAlphaRenderer, supportsAlphaCanvas, type RenderMode } from "./heroAlpha";
import { HERO_CLIPS, HERO_SEQ, frontAt, seqFile } from "./heroSeq.manifest";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Round 7.6.1 intro (Design stamp r7.6: spec.md, frames/hero-*): a magazine
 * cover. Black stage with a faint cream tulle net and a wine bloom; the
 * masthead "Cavite Gown Rentals" in Cormorant Light across the top; Mavy (the
 * stacked-alpha cutout, heroAlpha.ts) stands in front of it; the giant
 * Pinyon Script "Gowns" and the "for your ___" line (r7.10: CSS-only word
 * loop, see WORDS) cross her skirt; the
 * h1, lead, rate and CTAs sit in the left column under the masthead and a
 * small caption column on the right. An ivory lace scallop closes it.
 *
 * r7.6.1: the text is on screen from the first paint (no reveal, no timers)
 * and Mavy is not: the clip never autoplays. Scroll alone drives it: at the
 * top the clip sits on its empty opening frame (she is off-frame), then the
 * intro scroll scrubs her walk-in from the left (0.75-3.4 s), the landing
 * (3.5 s) and the spin (3.5-6 s); the text never moves or fades. Every box is
 * laid out from the first frame: CLS 0.
 *
 * Reduced motion: one seek to the landed frame (3.5 s), shown with the text
 * at once, no scrub. If WebGL is missing, or the clip errors or never loads,
 * the poster jpg stands in (scroll fades it in; reduced motion shows it at once).
 *
 * r7.6.3 (mobile): iOS Safari ignores preload="auto" on a paused video that
 * has never played, so it stops at HAVE_METADATA: no frame is decoded, the
 * WebGL draw (readyState >= 2) never runs and, as metadata did arrive, the
 * no-metadata fallback never fired either: no Mavy on scroll. Now the src
 * carries a media fragment (#t=), the muted clip is primed with
 * play().then(pause) on load and on the first touch/scroll, a rAF loop (not
 * scroll events) reads scrollY against the trigger's start/end and seeks one
 * at a time (fastSeek while the target moves, an exact seek once it rests),
 * and the poster stands in only until the first real frame, so late
 * metadata on iOS brings her back. ?cgrdebug=1 shows the path, readyState
 * and the last seek latency.
 *
 * r7.8: the clip and the frame set are the walk-in plus the 360 spin
 * (heroSeq.manifest.ts). Each clip carries its own timings, and a clip
 * that errors (the new file not in the repo yet) hands over to the r7.6
 * clip, so the preview works before and after the binaries land.
 *
 * r7.6.4 (desktop): the same clip, two renderers (heroAlpha.ts). Desktop
 * (hover + fine pointer) paints with the 2D canvas, phones with WebGL. A
 * lost WebGL context, a draw error or a blank frame where she must be in
 * view swaps to the other renderer on a fresh canvas, then to the poster;
 * the poster also stands in while nothing has drawn after CLIP_WAIT_MS.
 * ?cgrr=gl or ?cgrr=2d forces one; ?cgrdebug=1 shows the renderer and why.
 */

/** Stacked-alpha cutouts (540x1920: colour top half, matte bottom half), in order of preference. */
const HERO_ALPHA = true;
const clipUrl = (i: number) => `${CGR_ASSET}/${HERO_CLIPS[i].file}`;
export const HERO_ALPHA_SRC = clipUrl(0);
const HERO_POSTER = `${CGR_ASSET}/mavy-poster.jpg`;
/** Image sequence (r7.6.5; r7.7 reads heroSeq.manifest.ts): colour WebP
    cutout frames (r7.8: 30 at 540x960, clip tStart..end) drawn to a 2D canvas. Default hero path on desktop; phones
    keep the stacked-alpha clip unless it fails to advance. ?cgrseq=1 forces
    the sequence, ?cgrseq=0 the clip. A missing landed frame (404) falls back
    to the clip, then the poster. */
const SEQ_COUNT = HERO_SEQ.count;
/** Landed frame wait before the sequence is given up for the clip. */
const SEQ_WAIT_MS = 5000;
/** Clip watchdog: a scroll that has not visibly moved the clip in this long switches to the sequence. */
const ADVANCE_MS = 1000;
const seqSrc = (i: number) => `${CGR_ASSET}/${HERO_SEQ.dir}/${seqFile(HERO_SEQ, i)}`;

/**
 * r7.10 (Mark): the script line under "Gowns" loops "for your debut /
 * wedding / birthday / party", then "for any event", and starts over. It is
 * CSS only (cgr.css, "r7.10 word loop"): one 11 s keyframe cycle, 2.2 s per
 * word, a soft cross-fade with a 0.16em rise. No JS timer, no layout reads,
 * nothing on the scroll/rAF path, so it never competes with Mavy's scrub;
 * an IntersectionObserver and visibilitychange only flip
 * animation-play-state. All words share one grid cell, so the line's box is
 * the longest word from the first paint (CLS 0). "for" is fixed, "your" sits
 * in its own cell and only steps aside for "any event". Reduced motion:
 * a static "for any event". Screen readers get one static sentence (sr-only).
 */
const WORDS = ["debut", "wedding", "birthday", "party"] as const;
const WORD_ANY = "any event";
const WORDS_SR = "Gowns for your debut, wedding, birthday, party or any event.";
/** --script-drift: the giant word's x travel over the intro scroll (px), to the right, away from the lead. */
const DRIFT = 48;
const ALT =
  "Sample render: Mavy in a deep red sequin gown with a sheer red veil walks in, then turns once as you scroll.";

/**
 * Clip timelines (land, tStart, length, front) live in heroSeq.manifest.ts:
 * the scrub starts on an empty frame (tStart), so she is off-frame at the top.
 * The clip runs tStart..end over 0..CLIP_END of the intro scroll.
 */
const CLIP_END = 0.92;
/** r7.9: intro-scroll window in which she fades in as the walk-in starts
    (clip 0.75 s = p 0.021 on the r7.8 clip; seq frame 1 = p 0.016). */
const ENTER: [number, number] = [0.015, 0.05];
/** Caption fade window, in intro-scroll progress: she is in frame from ~0.18
    (clip ~1.9 s, mid walk-in; the poster is at 0.6 opacity) and lands ~0.36. */
const CAP_FADE = [0.2, 0.32] as const;
/** No decoded frame by then (stalled or blocked clip): show the poster until one arrives. */
const CLIP_WAIT_MS = 8000;
/** A seek that has not reported "seeked" by then is treated as dropped. */
const SEEK_STALL_MS = 700;
const noopSubscribe = () => () => {};
const qsFlag = (k: string) => () => new URLSearchParams(window.location.search).get(k) === "1";
const qsVal = (k: string) => new URLSearchParams(window.location.search).get(k);

type Path =
  | "video-gl"
  | "video-2d"
  | "reduced-gl"
  | "reduced-2d"
  | "reduced-poster"
  | "poster-fallback"
  | "seq-2d"
  | "reduced-seq";
/** Desktop-class input: hover and a fine pointer (mouse or trackpad). */
const isDesktop = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const forcedMode = (): RenderMode | null => {
  const v = new URLSearchParams(window.location.search).get("cgrr");
  return v === "gl" || v === "2d" ? v : null;
};
type Dbg = {
  rs: number;
  t: number;
  target: number;
  lat: number | null;
  seeks: number;
  primed: string;
  draws: number;
  /** Scrub progress 0..1 and the frame shown (sequence path). */
  p: number;
  frame: number;
  loaded: number;
};

function armInline(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
}

export function Story() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const rotRef = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionReady();
  // The server can't know the motion preference or WebGL support, so the SSR
  // <video> has no <source>: nothing downloads until the client decides.
  const onClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const alphaOk = useSyncExternalStore(
    noopSubscribe,
    () => HERO_ALPHA && supportsAlphaCanvas(),
    () => false,
  );
  const debug = useSyncExternalStore(noopSubscribe, qsFlag("cgrdebug"), () => false);

  // r7.10 word loop: pause the CSS cycle while the line is off screen or the
  // tab is hidden (data-run only flips animation-play-state; no layout reads).
  useEffect(() => {
    const el = rotRef.current;
    if (!el) return;
    let onScreen = true;
    const sync = () => {
      el.dataset.run = onScreen && document.visibilityState === "visible" ? "on" : "off";
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  // Sequence first on desktop (or when forced); the clip first on phones.
  const seqFirst = useSyncExternalStore(
    noopSubscribe,
    () => {
      const f = qsVal("cgrseq");
      return f === "1" ? true : f === "0" ? false : isDesktop();
    },
    () => false,
  );
  // Preferred renderer: forced by ?cgrr, else 2D on desktop (or without WebGL), WebGL on phones.
  const firstMode = useSyncExternalStore<RenderMode | null>(
    noopSubscribe,
    () => (HERO_ALPHA ? (forcedMode() ?? (isDesktop() || !supportsAlphaCanvas() ? "2d" : "gl")) : null),
    () => null,
  );
  // Renderers that failed, with the reason (shown by ?cgrdebug=1).
  const [failed, setFailed] = useState<Partial<Record<RenderMode, string>>>({});
  const mode: RenderMode | null = (() => {
    if (!firstMode) return null;
    const order: RenderMode[] = firstMode === "gl" ? ["gl", "2d"] : ["2d", "gl"];
    return order.find((m) => !failed[m] && (m === "2d" || alphaOk)) ?? null;
  })();
  const failReason = Object.entries(failed)
    .map(([m, r]) => `${m}:${r}`)
    .join(",");
  // Clip in use (HERO_CLIPS index): an error moves to the next one.
  const [clipIdx, setClipIdx] = useState(0);
  // The last clip errored: the poster stands in for good.
  const [clipFailed, setClipFailed] = useState(false);
  // No frame yet after CLIP_WAIT_MS: the poster stands in, the clip stays
  // mounted and takes over again at its first frame (late metadata on iOS).
  const [clipLate, setClipLate] = useState(false);
  // Sequence failed (missing frame or no landed frame in SEQ_WAIT_MS).
  const [seqFailed, setSeqFailed] = useState<string | null>(null);
  // The clip did not visibly advance on a scroll (watchdog): sequence for good.
  const [clipStuck, setClipStuck] = useState<string | null>(null);
  const clipDown = clipFailed || clipStuck !== null || (firstMode !== null && mode === null);
  const seq = onClient && (seqFirst || clipDown) && !seqFailed;
  const alpha = onClient && !seq && mode !== null && !clipFailed && clipStuck === null;
  const usePoster = onClient && !seq && (!alpha || clipLate);
  // Timings: the frame set is cut from the first clip; the clip path uses its own.
  const clip = HERO_CLIPS[seq ? 0 : clipIdx];
  const { land: LAND, tStart: T_START, seconds: CLIP_SECONDS } = clip;
  const FRONT = frontAt(clip, CLIP_END);
  // Media fragment: iOS fetches and decodes that frame for a paused clip.
  const clipSrc = alpha ? `${clipUrl(clipIdx)}#t=${reduced ? LAND : T_START}` : null;
  const framed = useRef(false);
  const dbgRef = useRef<Dbg>({
    rs: 0,
    t: 0,
    target: 0,
    lat: null,
    seeks: 0,
    primed: "no",
    draws: 0,
    p: 0,
    frame: -1,
    loaded: 0,
  });
  const seqRef = useRef<HTMLCanvasElement>(null);
  const path: Path = seq
    ? reduced
      ? "reduced-seq"
      : "seq-2d"
    : usePoster || !mode
      ? reduced
        ? "reduced-poster"
        : "poster-fallback"
      : `${reduced ? "reduced" : "video"}-${mode}`;

  // Alpha: redraw the canvas whenever the hidden stacked video shows a new
  // frame. Each renderer gets its own canvas (keyed by mode) and its own
  // CLIP_WAIT_MS: no frame by then shows the poster until one arrives.
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!alpha || !mode || !video || !canvas) return;
    framed.current = false;
    const timer = window.setTimeout(() => {
      if (!framed.current) setClipLate(true);
    }, CLIP_WAIT_MS);
    const r = createAlphaRenderer(canvas, video, mode, {
      onDraw: () => {
        dbgRef.current.draws++;
        if (framed.current) return;
        framed.current = true;
        setClipLate(false);
      },
      onFail: (reason) => setFailed((f) => ({ ...f, [mode]: reason })),
    });
    if (!r) {
      window.clearTimeout(timer);
      setFailed((f) => ({ ...f, [mode]: "no-context" }));
      return;
    }
    return () => {
      window.clearTimeout(timer);
      r.destroy();
    };
  }, [alpha, clipSrc, mode]);

  // The clip never plays on its own: it is only seeked (scroll, or one
  // reduced-motion seek). A decode or network error falls back to the
  // poster; a failed <source> does not set video.error, so its error event
  // is caught on the way down (capture). No frame in CLIP_WAIT_MS shows the
  // poster until one arrives.
  //
  // Priming (iOS): a muted inline clip may play() without a gesture (not in
  // Low Power Mode); one play().then(pause) makes WebKit load and decode
  // frames. Tried on load, then again on the first touch, click or scroll
  // (touchend/click count as a gesture there) until it succeeds.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clipSrc) return;
    armInline(video);
    video.loop = false;
    video.preload = "auto";
    video.pause();
    const fail = () => {
      if (clipIdx + 1 < HERO_CLIPS.length) setClipIdx(clipIdx + 1);
      else setClipFailed(true);
    };
    video.addEventListener("error", fail, true);

    let primed = false;
    let trying = false;
    const PRIME_ON = ["touchstart", "touchend", "pointerdown", "click", "scroll", "keydown"] as const;
    const unhook = () => PRIME_ON.forEach((ev) => window.removeEventListener(ev, prime, true));
    function prime() {
      if (primed || trying || !video) return;
      trying = true;
      let p: Promise<void> | undefined;
      try {
        p = video.play();
      } catch {
        p = undefined;
      }
      const done = (ok: boolean) => {
        trying = false;
        video.pause();
        // The scrub loop / reduced land re-seek to their own target after this
        // (restoring a pre-metadata currentTime would park the clip at 0).
        video.dispatchEvent(new Event("cgr-primed"));
        if (!ok) return;
        primed = true;
        dbgRef.current.primed = "yes";
        unhook();
      };
      if (p && typeof p.then === "function") p.then(() => done(true), () => {
        dbgRef.current.primed = "blocked";
        done(false);
      });
      else done(true);
    }
    PRIME_ON.forEach((ev) => window.addEventListener(ev, prime, { capture: true, passive: true }));
    prime();
    return () => {
      unhook();
      video.removeEventListener("error", fail, true);
    };
  }, [clipSrc, clipIdx]);

  // Clip watchdog (r7.6.5): the clip is only kept once it has visibly
  // advanced. From the first wheel / scroll / touch / key input, if the page
  // has moved but no new frame was drawn within ADVANCE_MS, the sequence
  // takes over. A pass proves the clip and the watch stops.
  useEffect(() => {
    const video = videoRef.current;
    if (!alpha || reduced || !video) return;
    const d = dbgRef.current;
    let timer = 0;
    let done = false;
    // Resting scroll position before the input (a jump fires its scroll event after it moves).
    let yRest = window.scrollY;
    const ON = ["wheel", "scroll", "touchmove", "keydown"] as const;
    const off = () => ON.forEach((ev) => window.removeEventListener(ev, arm, true));
    function arm() {
      if (done || timer) return;
      const y0 = yRest;
      const draws0 = d.draws;
      const t0 = video!.currentTime;
      timer = window.setTimeout(() => {
        timer = 0;
        if (done) return;
        yRest = window.scrollY;
        if (Math.abs(yRest - y0) < 24) return; // not a real move yet: re-arm on the next input
        const advanced = d.draws > draws0 && Math.abs(video!.currentTime - t0) > 0.02;
        done = true;
        off();
        if (!advanced) setClipStuck(`no-advance:${d.draws - draws0}d`);
      }, ADVANCE_MS);
    }
    ON.forEach((ev) => window.addEventListener(ev, arm, { capture: true, passive: true }));
    return () => {
      done = true;
      off();
      window.clearTimeout(timer);
    };
  }, [alpha, reduced, mode, clipSrc]);

  // Reduced motion: one seek to the landed (front-facing) frame, no playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clipSrc || !reduced) return;
    const land = () => {
      if (!video.duration) return;
      const t = Math.min(LAND, video.duration - 0.05);
      if (Math.abs(video.currentTime - t) > 0.02) video.currentTime = t;
    };
    if (video.readyState >= 1) land();
    video.addEventListener("loadedmetadata", land);
    video.addEventListener("cgr-primed", land);
    return () => {
      video.removeEventListener("loadedmetadata", land);
      video.removeEventListener("cgr-primed", land);
    };
  }, [clipSrc, reduced, LAND]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !onClient || reduced) return;
      const video = videoRef.current;
      const poster = posterRef.current;
      const q = gsap.utils.selector(root);
      const gw = q(".cgr-gw")[0] as HTMLElement;
      const idleEl = q(".cgr-mavy-idle")[0] as HTMLElement;
      const cap = q(".cgr-capcol")[0] as HTMLElement | undefined;

      // ---- Idle breath on the wrapper once she faces front after the spin.
      const idle = gsap.to(idleEl, {
        scale: 1.008,
        y: -3,
        duration: 7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      // ---- Giant word: drifts 48px on x over the intro scroll (never fades).
      // Poster fallback: the scroll fades the poster in as she would walk in.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top+=30",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            if (self.progress >= FRONT && idle.paused()) idle.play();
            else if (self.progress < FRONT && !idle.paused()) idle.pause();
          },
        },
      });
      tl.fromTo(gw, { x: 0 }, { x: DRIFT, duration: 1 }, 0);
      // r7.9 (QA): she stays fully off-stage, at opacity 0, until the walk-in
      // actually starts (clip ~0.75 s, seq frame 1), so no stray fragment of
      // the first frames shows at 0%. Opacity only: no layout moves.
      const mavyEl = q(".cgr-mavy")[0] as HTMLElement | undefined;
      if (mavyEl) {
        tl.fromTo(mavyEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: ENTER[1] - ENTER[0] }, ENTER[0]);
      }
      if (poster) tl.fromTo(poster, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 0);
      // Caption "i. On Mavy": waits at 0 until she is in frame (clip ~2.6 s of
      // the walk-in, or the poster's fade), then fades in on the same scroll.
      // Opacity/visibility only, so no layout moves; hidden = out of the a11y
      // tree, and aria-hidden mirrors it.
      if (cap) {
        const syncAria = () => {
          const on = Number(gsap.getProperty(cap, "opacity")) > 0.05;
          if (on) cap.removeAttribute("aria-hidden");
          else cap.setAttribute("aria-hidden", "true");
        };
        tl.fromTo(
          cap,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: CAP_FADE[1] - CAP_FADE[0], onUpdate: syncAria, onComplete: syncAria, onReverseComplete: syncAria },
          CAP_FADE[0],
        );
        syncAria();
      }

      // ---- Clip: the intro scroll scrubs T_START..end (walk-in, landing,
      // spin). At the top she is off-frame; nothing plays on its own.
      // r7.6.3: a rAF loop reads scrollY against the trigger's start/end
      // every frame (no wheel/scroll events, so iOS momentum scrolling
      // counts), and only one seek is in flight: the next waits for
      // "seeked". fastSeek (keyframes, 0.25 s apart) while the target
      // moves, an exact seek once it rests.
      let cleanupVideo = () => {};
      if (video && clipSrc) {
        type FastSeek = HTMLVideoElement & { fastSeek?: (t: number) => void };
        const fv = video as FastSeek;
        const st = ScrollTrigger.create({ trigger: root, start: "top top+=30", end: "bottom bottom" });
        let raf = 0;
        let inflight = false;
        let seekAt = 0;
        let lastTarget = -1;
        let near = true;
        const d = dbgRef.current;
        const onSeeked = () => {
          if (inflight) d.lat = Math.round(performance.now() - seekAt);
          inflight = false;
        };
        const tick = () => {
          raf = near ? requestAnimationFrame(tick) : 0;
          const span = st.end - st.start;
          const p = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - st.start) / span)) : 0;
          const dur = video.duration;
          d.rs = video.readyState;
          d.t = video.currentTime;
          if (!dur || !Number.isFinite(dur)) return;
          const t = T_START + Math.min(1, p / CLIP_END) * (dur - 0.05 - T_START);
          d.target = t;
          const moving = Math.abs(t - lastTarget) > 0.004;
          lastTarget = t;
          if (inflight) {
            if (performance.now() - seekAt < SEEK_STALL_MS) return;
            inflight = false;
          }
          const gap = Math.abs(video.currentTime - t);
          if (gap <= 0.02) return;
          seekAt = performance.now();
          inflight = true;
          d.seeks++;
          if (moving && gap > 0.3 && typeof fv.fastSeek === "function") fv.fastSeek(t);
          else video.currentTime = t;
        };
        const io = new IntersectionObserver(
          ([e]) => {
            near = e.isIntersecting;
            if (near && !raf) raf = requestAnimationFrame(tick);
          },
          { rootMargin: "200px 0px" },
        );
        io.observe(root);
        video.addEventListener("seeked", onSeeked);
        raf = requestAnimationFrame(tick);
        cleanupVideo = () => {
          st.kill();
          io.disconnect();
          video.removeEventListener("seeked", onSeeked);
          if (raf) cancelAnimationFrame(raf);
        };
      }

      return () => {
        cleanupVideo();
        idle.kill();
        tl.scrollTrigger?.kill();
        tl.kill();
        if (cap) {
          gsap.set(cap, { clearProps: "opacity,visibility" });
          cap.removeAttribute("aria-hidden");
        }
      };
    },
    { scope: rootRef, dependencies: [onClient, reduced, clipSrc, usePoster, FRONT, T_START] },
  );

  // Image-sequence path: SEQ_COUNT colour WebP frames drawn to a 2D canvas.
  // The landed frame loads first (it is the reduced-motion frame and proves
  // the set is there), then the rest, four at a time. Each rAF reads scrollY
  // against the section's own box (no cached trigger positions) and draws
  // the nearest loaded frame. The landed frame failing (404) or not arriving
  // in SEQ_WAIT_MS hands over to the clip; a later missing frame does too.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = seqRef.current;
    if (!seq || !root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return setSeqFailed("no-2d");
    const d = dbgRef.current;
    let dead = false;
    let raf = 0;
    let shown = -1;
    const landIdx = Math.max(0, Math.min(SEQ_COUNT - 1, HERO_SEQ.landed));
    const imgs: (HTMLImageElement | null)[] = Array(SEQ_COUNT).fill(null);
    const ok: boolean[] = Array(SEQ_COUNT).fill(false);
    d.loaded = 0;
    const fail = (why: string) => {
      if (dead) return;
      dead = true;
      setSeqFailed(why);
    };
    const load = (i: number) =>
      new Promise<void>((res) => {
        const im = new Image();
        im.decoding = "async";
        im.onload = () => {
          const fin = () => {
            ok[i] = true;
            d.loaded++;
            res();
          };
          if (typeof im.decode === "function") im.decode().then(fin, fin);
          else fin();
        };
        im.onerror = () => {
          fail(`404:${i}`);
          res();
        };
        imgs[i] = im;
        im.src = seqSrc(i);
      });
    const wait = window.setTimeout(() => {
      if (!ok[landIdx]) fail("landed-timeout");
    }, SEQ_WAIT_MS);
    load(landIdx).then(async () => {
      if (dead || reduced) return;
      const rest = [...Array(SEQ_COUNT).keys()].filter((i) => i !== landIdx);
      for (let k = 0; k < rest.length && !dead; k += 4) await Promise.all(rest.slice(k, k + 4).map(load));
    });
    const nearest = (i: number) => {
      for (let r = 0; r < SEQ_COUNT; r++) {
        if (i - r >= 0 && ok[i - r]) return i - r;
        if (i + r < SEQ_COUNT && ok[i + r]) return i + r;
      }
      return -1;
    };
    const tick = () => {
      if (dead) return;
      raf = requestAnimationFrame(tick);
      const r = root.getBoundingClientRect();
      const start = window.scrollY + r.top - 30;
      const end = window.scrollY + r.bottom - window.innerHeight;
      const span = end - start;
      const p = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - start) / span)) : 0;
      d.p = p;
      const want = reduced ? landIdx : Math.round(Math.min(1, p / CLIP_END) * (SEQ_COUNT - 1));
      const i = nearest(want);
      if (i < 0 || i === shown) return;
      const im = imgs[i]!;
      if (canvas.width !== im.naturalWidth) {
        canvas.width = im.naturalWidth || HERO_SEQ.width;
        canvas.height = im.naturalHeight || HERO_SEQ.height;
      }
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(im, 0, 0);
      } catch {
        return fail("draw");
      }
      shown = i;
      d.frame = i;
      d.draws++;
      // Reduced motion: the landed frame is final; stop the loop.
      if (reduced && i === landIdx) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      dead = true;
      window.clearTimeout(wait);
      cancelAnimationFrame(raf);
    };
  }, [seq, reduced]);

  // ?cgrdebug=1: a wheel tally for the overlay (count, last deltaY and deltaMode).
  const wheelRef = useRef({ n: 0, dy: 0, mode: 0 });
  useEffect(() => {
    if (!debug) return;
    const w = wheelRef.current;
    const on = (e: WheelEvent) => {
      w.n++;
      w.dy = e.deltaY;
      w.mode = e.deltaMode;
    };
    window.addEventListener("wheel", on, { capture: true, passive: true });
    return () => window.removeEventListener("wheel", on, true);
  }, [debug]);

  // ?cgrdebug=1: an overlay big enough to read in a phone photo of a screen.
  const dbgEl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!debug) return;
    const id = window.setInterval(() => {
      const el = dbgEl.current;
      const v = videoRef.current;
      const d = dbgRef.current;
      if (!el) return;
      const w = wheelRef.current;
      const why = [failReason, seqFailed && `seq:${seqFailed}`, clipStuck && `clip:${clipStuck}`].filter(Boolean).join(",");
      const media = seq
        ? `frame ${d.frame}/${SEQ_COUNT - 1} | loaded ${d.loaded}/${SEQ_COUNT}`
        : `t ${(v ? v.currentTime : d.t).toFixed(2)}/${d.target.toFixed(2)} | rs ${v ? v.readyState : d.rs} | seek ${d.lat ?? "-"}ms x${d.seeks} | primed ${d.primed}`;
      el.textContent =
        `path ${path} | draws ${d.draws}${seq ? "" : ` | clip ${clipIdx}`}\n` +
        `scrollY ${Math.round(window.scrollY)} | p ${(seq ? d.p : Math.min(1, Math.max(0, (d.target - T_START) / (CLIP_SECONDS - 0.05 - T_START)))).toFixed(3)}\n` +
        `${media}\n` +
        `wheel ${w.n} | dy ${Math.round(w.dy * 100) / 100} | dm ${w.mode} | dpr ${window.devicePixelRatio} | rm ${reduced ? 1 : 0}` +
        (why ? `\nfailed ${why}` : "");
    }, 200);
    return () => window.clearInterval(id);
  }, [debug, path, reduced, failReason, seq, seqFailed, clipStuck, T_START, CLIP_SECONDS, clipIdx]);

  return (
    <section
      ref={rootRef}
      className="cgr-intro"
      aria-labelledby="cgr-hero-title"
      data-motion={reduced ? "static" : "on"}
      data-alpha={alpha ? "on" : "off"}
      data-path={onClient ? path : undefined}
    >
      <div className="cgr-intro-stage">
        <span className="cgr-intro-bloom" aria-hidden="true" />

        <a className="cgr-mast" href={CGR_BASE} aria-label="Cavite Gown Rentals, home">
          <span className="l1">
            Cavite <em>Gown</em>
          </span>{" "}
          <span className="l2">Rentals</span>
        </a>

        {/* The figure box is the landed cutout's bbox (112,134 to 492,906 of
            540x960); the full frame overflows it at the stamp's offsets. */}
        <div className="cgr-mavy">
          <div className="cgr-mavy-idle">
            {usePoster ? (
              <img
                ref={posterRef}
                className="cgr-mavy-poster"
                src={HERO_POSTER}
                alt="Mavy faces front in a deep red sequin gown with a sheer red veil."
                width={720}
                height={1280}
                decoding="async"
              />
            ) : null}
            {seq ? (
              <canvas ref={seqRef} className="cgr-intro-canvas" role="img" aria-label={ALT} />
            ) : null}
            {!seq && (!onClient || alpha) ? (
              <>
                <video
                  key={clipIdx}
                  ref={videoRef}
                  className="cgr-intro-alphasrc"
                  muted
                  playsInline
                  webkit-playsinline="true"
                  preload="auto"
                  aria-hidden={true}
                >
                  {clipSrc ? <source src={clipSrc} type="video/mp4" /> : null}
                </video>
                <canvas
                  key={mode ?? "none"}
                  ref={canvasRef}
                  className="cgr-intro-canvas"
                  role={usePoster ? undefined : "img"}
                  aria-label={usePoster ? undefined : ALT}
                  aria-hidden={usePoster ? true : undefined}
                />
              </>
            ) : null}
          </div>
        </div>

        <p className="cgr-gw" aria-hidden="true">
          Gowns
        </p>
        <p className="cgr-rot hand cgr-intro-hand" aria-hidden="true">
          {/* r7.10: "for" stays put; "your" and the words stack in one grid
              cell each, so the box is the longest word and nothing moves. */}
          <span className="cgr-rot-for">for</span>{" "}
          <span ref={rotRef} className="cgr-rot-loop" data-run="on">
            <span className="cgr-rot-your">your</span>
            {WORDS.map((w, i) => (
              <span key={w} className="cgr-rot-w" style={{ "--i": i } as React.CSSProperties}>
                {w}
              </span>
            ))}
            <span className="cgr-rot-w cgr-rot-any" style={{ "--i": WORDS.length } as React.CSSProperties}>
              {WORD_ANY}
            </span>
          </span>
        </p>

        <div className="cgr-intro-copy">
          <h1 className="cgr-intro-h disp" id="cgr-hero-title">
            Gown and suit rentals in <em>Dasmariñas,</em> Cavite.
          </h1>
          <div className="cgr-intro-bottom">
            <p className="cgr-intro-lead">
              Gowns and suits for your debut, wedding, or prom.
            </p>
            <p className="cgr-intro-rate">From {formatPhp(2200)} a day, example rate</p>
            <div className="cgr-intro-cta">
              <a className="btn btn-wine" href="#gowns">
                See the gowns <span className="arrow" aria-hidden="true" />
              </a>
              <a className="cgr-intro-txt" href="#rail">
                <span>Reserve your gown</span>
              </a>
            </div>
          </div>
        </div>

        <aside className="cgr-capcol" aria-label="On Mavy">
          <span className="num" aria-hidden="true">
            i.
          </span>
          <b>On Mavy</b>A deep red beaded gown with a sheer veil. Example styling.
        </aside>

        <p className="sr-only">
          {WORDS_SR}
        </p>
        <span className="cgr-scallop" aria-hidden="true" />
      </div>
      {debug ? (
        <div
          ref={dbgEl}
          className="cgr-debug"
          aria-hidden="true"
          style={{
            position: "fixed",
            left: 8,
            bottom: 8,
            zIndex: 99,
            maxWidth: "calc(100vw - 16px)",
            padding: "8px 12px",
            font: "600 18px/1.4 ui-monospace, Menlo, Consolas, monospace",
            whiteSpace: "pre-wrap",
            color: "#fff",
            background: "rgba(0,0,0,.86)",
            borderRadius: 4,
            pointerEvents: "none",
          }}
        >
          path {path}
        </div>
      ) : null}
    </section>
  );
}
