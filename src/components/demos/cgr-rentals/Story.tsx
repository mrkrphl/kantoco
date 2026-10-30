"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { CGR_ASSET, formatPhp } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";
import { createAlphaRenderer, supportsAlphaCanvas } from "./heroAlpha";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);
/** r7.5 tokens: --ease-veil (rotator crossfade) and --ease-silk (long ease-out). */
const VEIL = CustomEase.create("cgrVeil", "0.45,0.05,0.35,0.95");
const SILK = CustomEase.create("cgrSilk", "0.16,0.84,0.3,1");

/**
 * Round 7.5 intro (Design stamp r7.5: spec.md, frames/hero-*). Black stage
 * with a faint cream tulle net, a wine bloom behind Mavy and a ghost "gowns"
 * in Cormorant italic at 7% cream; an ivory lace scallop closes it.
 * The settled composition is on screen from the first frame: the h1 (four
 * lines on desktop, two on phones), the script rotator beside "Cavite.", the
 * lead, the example rate and the two CTAs on the left; Mavy on the right.
 * The r7.1 story stays: the stacked-alpha cutout (heroAlpha.ts, transparent
 * WebGL canvas) scrubs with scroll inside her own column, so she walks in,
 * turns once and faces front without ever crossing the text. Only the ghost
 * word moves with the scroll (24px parallax).
 *
 * Reduced motion: the same composition as a still, with the script showing
 * "for your debut". The alpha clip is loaded with preload="metadata" and
 * seeked once to the landed frame, so the cutout stays a cutout; without
 * WebGL the poster jpg is used.
 */

/** Stacked-alpha cutout (540x1920: colour top half, matte bottom half). */
const HERO_ALPHA = true;
export const HERO_ALPHA_SRC = `${CGR_ASSET}/mavy-side-spin-alpha.mp4`;
/** Plain clip on black: the no-WebGL fallback only. */
const HERO_PLAIN_SRC = `${CGR_ASSET}/mavy-side-spin-web.mp4`;
const HERO_POSTER = `${CGR_ASSET}/mavy-poster.jpg`;

const WORD = "gowns";
/** Rotator nouns (stamp r7.5/spec.md), in order; one pass ends back on debut. */
const NOUNS = ["debut", "pageant", "wedding", "prom", "JS prom", "ball", "photoshoot", "graduation ball"];
/** Hold, crossfade (s) and blur for each swap (--rot-hold, --rot-fade, --rot-blur). */
const ROT_HOLD = 2.2;
const ROT_FADE = 1.2;
const ROT_BLUR = 2;
/** --parallax: the ghost word's travel over the intro scroll (px). */
const PARALLAX = 24;
const ALT =
  "Sample render: Mavy walks in from the left in a deep red sequin gown with a sheer red veil, turns once and faces front.";

/**
 * Clip timeline (8 s) over 0..CLIP_END of the intro scroll: 0-1 s black,
 * 1-3 s she walks in, 3-5 s she spins, 6 s+ facing front.
 */
const CLIP_SECONDS = 8;
const CLIP_END = 0.92;
const at = (sec: number) => (sec / CLIP_SECONDS) * CLIP_END;
const CLIP_BEATS = {
  front: at(6),
  clipEnd: CLIP_END,
};
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
  const { ready, reduced } = useMotionReady();
  // The server can't know the motion preference or WebGL support, so the SSR
  // <video> has no <source>: nothing downloads until the client decides.
  const onClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const alphaOk = useSyncExternalStore(
    noopSubscribe,
    () => HERO_ALPHA && supportsAlphaCanvas(),
    () => false,
  );
  const alpha = onClient && alphaOk;
  // Reduced motion without WebGL: the poster jpg only (no mp4 request).
  const usePoster = onClient && reduced && !alpha;
  const clipSrc = !onClient || usePoster ? null : alpha ? HERO_ALPHA_SRC : HERO_PLAIN_SRC;

  // Alpha: redraw the canvas whenever the hidden stacked video shows a new frame.
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!alpha || !video || !canvas) return;
    const r = createAlphaRenderer(canvas, video);
    if (!r) return;
    return () => r.destroy();
  }, [alpha, clipSrc]);

  // Reduced motion: one seek to the landed (front-facing) frame, no scrub.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clipSrc || !reduced) return;
    armInline(video);
    video.pause();
    const land = () => {
      if (!video.duration) return;
      video.currentTime = Math.max(0, video.duration * CLIP_END - 0.05);
    };
    if (video.readyState >= 1) land();
    video.addEventListener("loadedmetadata", land);
    return () => video.removeEventListener("loadedmetadata", land);
  }, [clipSrc, reduced]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const video = videoRef.current;
      if (!root || !ready || reduced) return;
      const q = gsap.utils.selector(root);
      const stage = q(".cgr-intro-stage")[0] as HTMLElement;
      const word = q(".cgr-intro-word")[0] as HTMLElement;
      const idleEl = q(".cgr-mavy-idle")[0] as HTMLElement;
      const nouns = q(".cgr-hand-stack > span") as HTMLElement[];
      const rise = q(".cgr-intro-h .l, .cgr-intro-hand, .cgr-intro-bottom > *") as HTMLElement[];

      // Load (time-based): the h1 lines, the script and the lead block fade
      // up 14px on the long silk ease-out (--dur-reveal 1.4s, --stagger 140ms).
      const intro = gsap.timeline({ delay: 0.25 });
      intro.fromTo(
        rise,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 1.4, ease: SILK, stagger: 0.14 },
        0,
      );

      // Rotator (spec.md): one pass from ~1.7 s, back to debut at ~28.9 s.
      // Each swap holds 2.2 s, then the outgoing and incoming nouns crossfade
      // over the same 1.2 s with a 2 px blur on the veil ease. No travel.
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

      // The first scroll, key or pointer input ends it: a 1.2 s fade to debut.
      let stopped = false;
      const stop = () => {
        if (stopped) return;
        stopped = true;
        detach();
        const live = rot.isActive() || rot.progress() < 1;
        rot.pause();
        if (!live) return;
        const showing = nouns.filter((n, i) => i !== 0 && Number(gsap.getProperty(n, "autoAlpha")) > 0);
        gsap.to(showing, { autoAlpha: 0, filter: `blur(${ROT_BLUR}px)`, duration: ROT_FADE, ease: VEIL });
        gsap.to(nouns[0], { autoAlpha: 1, filter: "blur(0px)", duration: ROT_FADE, ease: VEIL });
      };
      const STOP_ON = ["wheel", "touchstart", "keydown", "pointerdown", "scroll"] as const;
      // Pause while the hero is off screen or the tab is hidden; resume after.
      let onScreen = true;
      let started = false;
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
      const detach = () => {
        STOP_ON.forEach((ev) => window.removeEventListener(ev, stop, true));
        document.removeEventListener("visibilitychange", sync);
        io.disconnect();
      };
      document.addEventListener("visibilitychange", sync);
      intro.add(() => {
        if (stopped) return;
        started = true;
        STOP_ON.forEach((ev) => window.addEventListener(ev, stop, { capture: true, passive: true }));
        sync();
      }, 1.45);

      // Idle on the wrapper, never the canvas: a slow breath once she has
      // landed (front-facing), paused again if the reader scrolls back up.
      const idle = gsap.to(idleEl, {
        scale: 1.008,
        y: -3,
        duration: 7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      // The ghost word drifts up 24px over the intro scroll (never fades).
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top+=30",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            if (self.progress >= CLIP_BEATS.front && idle.paused()) idle.play();
            else if (self.progress < CLIP_BEATS.front && !idle.paused()) idle.pause();
          },
        },
      });
      tl.fromTo(word, { y: 0 }, { y: -PARALLAX, duration: 1 }, 0);

      // Clip scrub: the whole clip maps to 0..CLIP_END of the intro scroll.
      // rAF-throttled, one seek in flight, 250 ms stuck-seek replacement.
      let cleanupVideo = () => {};
      if (video && clipSrc) {
        armInline(video);
        video.loop = false;
        video.pause();
        let target = 0;
        let raf = 0;
        let seekAt = 0;
        const apply = () => {
          raf = 0;
          if (!video.duration) return;
          if (video.seeking && performance.now() - seekAt < 250) return;
          const t = target * (video.duration - 0.05);
          if (Math.abs(video.currentTime - t) > 0.02) {
            seekAt = performance.now();
            video.currentTime = t;
          }
        };
        const onSeeked = () => {
          if (!raf) raf = requestAnimationFrame(apply);
        };
        video.addEventListener("seeked", onSeeked);
        video.addEventListener("loadedmetadata", onSeeked);
        // iOS needs a play() unlock before seeks paint.
        void video.play().then(() => video.pause()).catch(() => {});
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top+=30",
          end: "bottom bottom",
          onUpdate: (self) => {
            target = Math.min(1, self.progress / CLIP_BEATS.clipEnd);
            if (!raf) raf = requestAnimationFrame(apply);
          },
        });
        cleanupVideo = () => {
          st.kill();
          video.removeEventListener("seeked", onSeeked);
          video.removeEventListener("loadedmetadata", onSeeked);
          if (raf) cancelAnimationFrame(raf);
        };
      }

      return () => {
        cleanupVideo();
        detach();
        rot.kill();
        intro.kill();
        idle.kill();
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [ready, reduced, clipSrc] },
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
        <p className="cgr-intro-word" aria-hidden="true">
          {WORD}
        </p>

        <div className="cgr-mavy">
          <div className="cgr-mavy-idle">
            {usePoster ? (
              <img
                className="cgr-mavy-poster"
                src={HERO_POSTER}
                alt="Mavy faces front in a deep red sequin gown with a sheer red veil."
                width={720}
                height={1280}
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  key={alpha ? "alpha" : "plain"}
                  className={alpha ? "cgr-intro-alphasrc" : "cgr-intro-video"}
                  muted
                  playsInline
                  preload={reduced ? "metadata" : "auto"}
                  aria-hidden={alpha ? true : undefined}
                  aria-label={alpha ? undefined : ALT}
                >
                  {clipSrc ? <source src={clipSrc} type="video/mp4" /> : null}
                </video>
                {alpha ? <canvas ref={canvasRef} className="cgr-intro-canvas" role="img" aria-label={ALT} /> : null}
              </>
            )}
          </div>
        </div>

        <div className="cgr-intro-copy">
          <div className="cgr-intro-top">
            <h1 className="cgr-intro-h disp" id="cgr-hero-title">
              <span className="l">Gown and suit </span>
              <span className="l">rentals in </span>
              <span className="l">
                <em>Dasmariñas,</em>{" "}
              </span>
              <span className="l">Cavite.</span>
            </h1>
            <p className="hand cgr-intro-hand" aria-hidden="true">
              <span className="cgr-hand-fix">for your</span>{" "}
              <span className="cgr-hand-stack">
                {NOUNS.map((n, i) => (
                  <span key={n} data-i={i}>
                    {n}
                  </span>
                ))}
              </span>
            </p>
          </div>
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
        <p className="sr-only">
          Gowns for your debut, pageant, wedding, prom, JS prom, ball, photoshoot or graduation ball.
        </p>
        <span className="cgr-scallop" aria-hidden="true" />
      </div>
    </section>
  );
}
