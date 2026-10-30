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
 */

/** Stacked-alpha cutout (540x1920: colour top half, matte bottom half). */
const HERO_ALPHA = true;
export const HERO_ALPHA_SRC = `${CGR_ASSET}/mavy-side-spin-alpha.mp4`;
const HERO_POSTER = `${CGR_ASSET}/mavy-poster.jpg`;

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
/** No metadata by then (stalled or blocked clip): use the poster. */
const CLIP_WAIT_MS = 8000;
/** The rotator's first swap waits this long after the page opens. */
const ROT_DELAY_MS = 1200;
const noopSubscribe = () => () => {};

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
  // The clip errored, or never loaded its metadata: the poster stands in.
  const [clipFailed, setClipFailed] = useState(false);
  const alpha = onClient && alphaOk && !clipFailed;
  const usePoster = onClient && !alpha;
  const clipSrc = alpha ? HERO_ALPHA_SRC : null;

  // Alpha: redraw the canvas whenever the hidden stacked video shows a new frame.
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!alpha || !video || !canvas) return;
    const r = createAlphaRenderer(canvas, video);
    if (!r) {
      setClipFailed(true);
      return;
    }
    return () => r.destroy();
  }, [alpha, clipSrc]);

  // The clip never plays: it is only seeked (scroll, or one reduced-motion
  // seek). A decode or network error, or no metadata in CLIP_WAIT_MS, falls
  // back to the poster. A failed <source> does not set video.error, so its
  // error event is caught on the way down (capture).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clipSrc) return;
    armInline(video);
    video.loop = false;
    video.pause();
    const fail = () => setClipFailed(true);
    const timer = window.setTimeout(() => {
      if (video.readyState < 1) fail();
    }, CLIP_WAIT_MS);
    const ok = () => window.clearTimeout(timer);
    video.addEventListener("error", fail, true);
    video.addEventListener("loadedmetadata", ok);
    if (video.readyState >= 1) ok();
    return () => {
      window.clearTimeout(timer);
      video.removeEventListener("error", fail, true);
      video.removeEventListener("loadedmetadata", ok);
    };
  }, [clipSrc]);

  // Reduced motion: one seek to the landed (front-facing) frame, no playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clipSrc || !reduced) return;
    const land = () => {
      if (!video.duration) return;
      video.currentTime = Math.min(LAND, video.duration - 0.05);
    };
    if (video.readyState >= 1) land();
    video.addEventListener("loadedmetadata", land);
    return () => video.removeEventListener("loadedmetadata", land);
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
      let cleanupVideo = () => {};
      if (video && clipSrc) {
        let target = 0;
        let raf = 0;
        let seekAt = 0;
        const apply = () => {
          raf = 0;
          if (!video.duration) return;
          if (video.seeking && performance.now() - seekAt < 250) return;
          const t = T_START + target * (video.duration - 0.05 - T_START);
          if (Math.abs(video.currentTime - t) > 0.02) {
            seekAt = performance.now();
            video.currentTime = t;
          }
        };
        const kick = () => {
          if (!raf) raf = requestAnimationFrame(apply);
        };
        video.addEventListener("loadedmetadata", kick);
        video.addEventListener("seeked", kick);
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top+=30",
          end: "bottom bottom",
          onUpdate: (self) => {
            target = Math.min(1, self.progress / CLIP_END);
            kick();
          },
        });
        target = Math.min(1, st.progress / CLIP_END);
        kick();
        cleanupVideo = () => {
          st.kill();
          video.removeEventListener("loadedmetadata", kick);
          video.removeEventListener("seeked", kick);
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

  return (
    <section
      ref={rootRef}
      className="cgr-intro"
      aria-labelledby="cgr-hero-title"
      data-motion={reduced ? "static" : "on"}
      data-alpha={alpha ? "on" : "off"}
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
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="cgr-intro-alphasrc"
                  muted
                  playsInline
                  preload={reduced ? "metadata" : "auto"}
                  aria-hidden={true}
                >
                  {clipSrc ? <source src={clipSrc} type="video/mp4" /> : null}
                </video>
                <canvas ref={canvasRef} className="cgr-intro-canvas" role="img" aria-label={ALT} />
              </>
            )}
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
    </section>
  );
}
