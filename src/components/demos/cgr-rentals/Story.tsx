"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { CGR_ASSET, CGR_BASE, formatPhp } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";
import { createAlphaRenderer, supportsAlphaCanvas } from "./heroAlpha";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);
/** r7.6 tokens: --ease-veil (rotator crossfade). */
const VEIL = CustomEase.create("cgrVeil", "0.45,0.05,0.35,0.95");

/**
 * Round 7.6.1 intro (Design stamp r7.6: spec.md, frames/hero-*): a magazine
 * cover. Black stage with a faint cream tulle net and a wine bloom; the
 * masthead "Cavite Gown Rentals" in Cormorant Light across the top; Mavy (the
 * stacked-alpha cutout, heroAlpha.ts) stands in front of it; the giant
 * Pinyon Script "Gowns" and the "for your ___" rotator cross her skirt; the
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
 */

/** Stacked-alpha cutout (540x1920: colour top half, matte bottom half). */
const HERO_ALPHA = true;
export const HERO_ALPHA_SRC = `${CGR_ASSET}/mavy-side-spin-alpha.mp4`;
const HERO_POSTER = `${CGR_ASSET}/mavy-poster.jpg`;
/** Optional image-sequence path (r7.6.3, off by default; ?cgrseq=1 to try).
    Frames are not shipped yet: if any fails to load, the poster stands in. */
const HERO_SEQ = false;
const SEQ_COUNT = 36;
const seqSrc = (i: number) => `${CGR_ASSET}/seq/mavy-${String(i).padStart(2, "0")}.webp`;

/** Rotator nouns (kept from r7.5), in order; one pass ends back on debut. */
const NOUNS = ["debut", "pageant", "wedding", "prom", "JS prom", "ball", "photoshoot", "graduation ball"];
/** Hold, crossfade (s) and blur for each swap (--rot-hold, --rot-fade, --rot-blur). */
const ROT_HOLD = 2.2;
const ROT_FADE = 1.2;
const ROT_BLUR = 2;
/** --script-drift: the giant word's x travel over the intro scroll (px), to the right, away from the lead. */
const DRIFT = 48;
const ALT =
  "Sample render: Mavy in a deep red sequin gown with a sheer red veil walks in, then turns once as you scroll.";

/**
 * Clip timeline (8 s): 0-0.7 s empty, 0.75-3.4 s she walks in from the left
 * edge, 3.5 s whole figure in frame facing front, 3.5-6 s she spins, 6 s+
 * facing front.
 */
const LAND = 3.5;
/** The scrub starts on this empty frame, so she is off-frame at the top. */
const T_START = 0.6;
const CLIP_SECONDS = 8;
/** The clip runs T_START..end over 0..CLIP_END of the intro scroll. */
const CLIP_END = 0.92;
/** Caption fade window, in intro-scroll progress: she is in frame from ~0.18
    (clip ~1.9 s, mid walk-in; the poster is at 0.6 opacity) and lands ~0.36. */
const CAP_FADE = [0.2, 0.32] as const;
const FRONT = ((6 - T_START) / (CLIP_SECONDS - T_START)) * CLIP_END;
/** No decoded frame by then (stalled or blocked clip): show the poster until one arrives. */
const CLIP_WAIT_MS = 8000;
/** A seek that has not reported "seeked" by then is treated as dropped. */
const SEEK_STALL_MS = 700;
/** The rotator's first swap waits this long after the page opens. */
const ROT_DELAY_MS = 1200;
const noopSubscribe = () => () => {};
const qsFlag = (k: string) => () => new URLSearchParams(window.location.search).get(k) === "1";

type Path = "video-scrub" | "poster-fallback" | "reduced" | "canvas-seq";
type Dbg = { rs: number; t: number; target: number; lat: number | null; seeks: number; primed: string };

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
  const seqOn = useSyncExternalStore(noopSubscribe, () => HERO_SEQ || qsFlag("cgrseq")(), () => false);
  // The clip errored (or WebGL failed): the poster stands in for good.
  const [clipFailed, setClipFailed] = useState(false);
  // No frame yet after CLIP_WAIT_MS: the poster stands in, the clip stays
  // mounted and takes over again at its first frame (late metadata on iOS).
  const [clipLate, setClipLate] = useState(false);
  const [seqFailed, setSeqFailed] = useState(false);
  const seq = onClient && seqOn && !seqFailed;
  const alpha = onClient && !seq && alphaOk && !clipFailed;
  const usePoster = onClient && !seq && (!alpha || clipLate);
  // Media fragment: iOS fetches and decodes that frame for a paused clip.
  const clipSrc = alpha ? `${HERO_ALPHA_SRC}#t=${reduced ? LAND : T_START}` : null;
  const framed = useRef(false);
  const dbgRef = useRef<Dbg>({ rs: 0, t: 0, target: 0, lat: null, seeks: 0, primed: "no" });
  const seqRef = useRef<HTMLCanvasElement>(null);
  const path: Path = seq ? "canvas-seq" : reduced ? "reduced" : usePoster ? "poster-fallback" : "video-scrub";

  // Alpha: redraw the canvas whenever the hidden stacked video shows a new frame.
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!alpha || !video || !canvas) return;
    const r = createAlphaRenderer(canvas, video, () => {
      if (framed.current) return;
      framed.current = true;
      setClipLate(false);
    });
    if (!r) {
      setClipFailed(true);
      return;
    }
    return () => r.destroy();
  }, [alpha, clipSrc]);

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
    const fail = () => setClipFailed(true);
    const timer = window.setTimeout(() => {
      if (!framed.current) setClipLate(true);
    }, CLIP_WAIT_MS);
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
      window.clearTimeout(timer);
      unhook();
      video.removeEventListener("error", fail, true);
    };
  }, [clipSrc]);

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
  }, [clipSrc, reduced]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !onClient || reduced) return;
      const video = videoRef.current;
      const poster = posterRef.current;
      const q = gsap.utils.selector(root);
      const stage = q(".cgr-intro-stage")[0] as HTMLElement;
      const gw = q(".cgr-gw")[0] as HTMLElement;
      const idleEl = q(".cgr-mavy-idle")[0] as HTMLElement;
      const cap = q(".cgr-capcol")[0] as HTMLElement | undefined;
      const nouns = q(".cgr-hand-stack > span") as HTMLElement[];

      // ---- Rotator (spec.md): each swap holds 2.2 s, then the nouns
      // crossfade over 1.2 s with a 2 px blur. Text only; any input stops it.
      const rot = gsap.timeline({ paused: true });
      const order = [...NOUNS.keys(), 0];
      for (let k = 1; k < order.length; k++) {
        const out = nouns[order[k - 1]];
        const inn = nouns[order[k]];
        const t = (k - 1) * (ROT_HOLD + ROT_FADE) + ROT_HOLD;
        rot.to(out, { autoAlpha: 0, filter: `blur(${ROT_BLUR}px)`, duration: ROT_FADE, ease: VEIL }, t);
        rot.fromTo(
          inn,
          { autoAlpha: 0, filter: `blur(${ROT_BLUR}px)` },
          { autoAlpha: 1, filter: "blur(0px)", duration: ROT_FADE, ease: VEIL, immediateRender: false },
          t,
        );
      }
      rot.eventCallback("onComplete", () => detach());
      let stopped = false;
      let started = false;
      let onScreen = true;
      const sync = () => {
        if (stopped || !started) return;
        if (onScreen && document.visibilityState === "visible") rot.resume();
        else rot.pause();
      };
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        sync();
      });
      io.observe(stage);
      const STOP_ON = ["wheel", "touchstart", "keydown", "pointerdown", "scroll"] as const;
      const stop = () => {
        if (stopped) return;
        stopped = true;
        detach();
        const live = rot.progress() > 0 && rot.progress() < 1;
        rot.pause();
        if (!live) return;
        const showing = nouns.filter((n, i) => i !== 0 && Number(gsap.getProperty(n, "autoAlpha")) > 0);
        gsap.to(showing, { autoAlpha: 0, filter: `blur(${ROT_BLUR}px)`, duration: ROT_FADE, ease: VEIL });
        gsap.to(nouns[0], { autoAlpha: 1, filter: "blur(0px)", duration: ROT_FADE, ease: VEIL });
      };
      const detach = () => {
        STOP_ON.forEach((ev) => window.removeEventListener(ev, stop, true));
        document.removeEventListener("visibilitychange", sync);
        io.disconnect();
      };
      document.addEventListener("visibilitychange", sync);
      STOP_ON.forEach((ev) => window.addEventListener(ev, stop, { capture: true, passive: true }));
      const rotTimer = window.setTimeout(() => {
        if (stopped) return;
        started = true;
        sync();
      }, ROT_DELAY_MS);

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
        detach();
        window.clearTimeout(rotTimer);
        rot.kill();
        idle.kill();
        tl.scrollTrigger?.kill();
        tl.kill();
        if (cap) {
          gsap.set(cap, { clearProps: "opacity,visibility" });
          cap.removeAttribute("aria-hidden");
        }
      };
    },
    { scope: rootRef, dependencies: [onClient, reduced, clipSrc, usePoster] },
  );

  // Image-sequence path (flag, off by default): SEQ_COUNT alpha WebP frames
  // drawn to a 2D canvas from the same rAF/scrollY mapping. Any missing frame
  // falls back to the poster.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = seqRef.current;
    if (!seq || !root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return setSeqFailed(true);
    let dead = false;
    let raf = 0;
    let shown = -1;
    const imgs = Array.from({ length: SEQ_COUNT }, (_, i) => {
      const im = new Image();
      im.decoding = "async";
      im.src = seqSrc(i);
      im.onerror = () => !dead && setSeqFailed(true);
      return im;
    });
    const st = ScrollTrigger.create({ trigger: root, start: "top top+=30", end: "bottom bottom" });
    const landIdx = Math.round(((LAND - T_START) / (CLIP_SECONDS - 0.05 - T_START)) * (SEQ_COUNT - 1));
    const tick = () => {
      if (dead) return;
      raf = reduced ? 0 : requestAnimationFrame(tick);
      const span = st.end - st.start;
      const p = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - st.start) / span)) : 0;
      const i = reduced ? landIdx : Math.round(Math.min(1, p / CLIP_END) * (SEQ_COUNT - 1));
      const im = imgs[i];
      if (i === shown || !im.complete || !im.naturalWidth) {
        if (reduced && !raf) raf = requestAnimationFrame(tick);
        return;
      }
      if (canvas.width !== im.naturalWidth) {
        canvas.width = im.naturalWidth;
        canvas.height = im.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(im, 0, 0);
      shown = i;
      dbgRef.current.t = i;
      if (reduced) raf = 0;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      dead = true;
      st.kill();
      cancelAnimationFrame(raf);
    };
  }, [seq, reduced]);

  // ?cgrdebug=1: a small overlay with the path, readyState and last seek latency.
  const dbgEl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!debug) return;
    const id = window.setInterval(() => {
      const el = dbgEl.current;
      const v = videoRef.current;
      const d = dbgRef.current;
      if (!el) return;
      const rs = v ? v.readyState : d.rs;
      el.textContent =
        `path ${path} | rs ${rs} | t ${(v ? v.currentTime : d.t).toFixed(2)}/${d.target.toFixed(2)}` +
        ` | seek ${d.lat ?? "-"}ms x${d.seeks} | primed ${d.primed} | rm ${reduced ? 1 : 0}`;
    }, 200);
    return () => window.clearInterval(id);
  }, [debug, path, reduced]);

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
          {/* Each line carries the whole phrase, right-aligned in one grid
              cell, so "for your" sits beside every noun and nothing moves. */}
          <span className="cgr-hand-stack">
            {NOUNS.map((n, i) => (
              <span key={n} data-i={i}>
                for your {n}
              </span>
            ))}
          </span>
        </p>

        <div className="cgr-intro-copy">
          <h1 className="cgr-intro-h disp" id="cgr-hero-title">
            Gown and suit rentals in <em>Dasmariñas,</em> Cavite.
          </h1>
          <div className="cgr-intro-bottom">
            <p className="cgr-intro-lead">
              Each gown keeps its own calendar. When you ask to hold a date, you receive a CGR reference code, and the
              shop confirms with you before any payment.
            </p>
            <p className="cgr-intro-rate">From {formatPhp(2200)} a day, example rate</p>
            <div className="cgr-intro-cta">
              <a className="btn btn-wine" href="#gowns">
                See the gowns <span className="arrow" aria-hidden="true" />
              </a>
              <a className="cgr-intro-txt" href="#rail">
                <span>Hold a gown</span>
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
          Gowns for your debut, pageant, wedding, prom, JS prom, ball, photoshoot or graduation ball.
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
            padding: "4px 6px",
            font: "11px/1.3 ui-monospace, monospace",
            color: "#fff",
            background: "rgba(0,0,0,.72)",
            pointerEvents: "none",
          }}
        >
          path {path}
        </div>
      ) : null}
    </section>
  );
}
