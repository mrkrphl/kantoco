"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
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
 * Round 7.6 intro (Design stamp r7.6: spec.md, frames/hero-*): a magazine
 * cover. Black stage with a faint cream tulle net and a wine bloom; the
 * masthead "Cavite Gown Rentals" in Cormorant Light across the top; Mavy (the
 * stacked-alpha cutout, heroAlpha.ts) stands in front of it; the giant
 * Pinyon Script "Gowns" and the "for your ___" rotator cross her skirt; the
 * h1, lead, rate and CTAs sit in the left column under the masthead and a
 * small caption column on the right. An ivory lace scallop closes it.
 *
 * Load timeline (time-based, not scroll): black at 0 s; the clip plays from
 * 0 s at 1x (her real walk-in, 0.75-3.4 s) and holds at 3.5 s, the first
 * frame with her whole figure in frame, facing front. From 3.2 s the
 * masthead, h1, lead block, giant word, rotator and caption fade in by
 * opacity only (600 ms each, 140 ms stagger, done about 4.1 s). A 5 s cap
 * shows everything if the clip is slow or fails (and a CSS failsafe at 6 s
 * if the script never runs). After she lands, scroll drives the spin
 * (3.5 s to the end of the clip). Every box is laid out from the first
 * frame, so nothing moves: CLS 0.
 *
 * Reduced motion: one seek to the landed frame (3.5 s) and the content is
 * shown at once; without WebGL the poster jpg is used.
 */

/** Stacked-alpha cutout (540x1920: colour top half, matte bottom half). */
const HERO_ALPHA = true;
export const HERO_ALPHA_SRC = `${CGR_ASSET}/mavy-side-spin-alpha.mp4`;
/** Plain clip on black: the no-WebGL fallback only. */
const HERO_PLAIN_SRC = `${CGR_ASSET}/mavy-side-spin-web.mp4`;
const HERO_POSTER = `${CGR_ASSET}/mavy-poster.jpg`;

/** Rotator nouns (kept from r7.5), in order; one pass ends back on debut. */
const NOUNS = ["debut", "pageant", "wedding", "prom", "JS prom", "ball", "photoshoot", "graduation ball"];
/** Hold, crossfade (s) and blur for each swap (--rot-hold, --rot-fade, --rot-blur). */
const ROT_HOLD = 2.2;
const ROT_FADE = 1.2;
const ROT_BLUR = 2;
/** --script-drift: the giant word's x travel over the intro scroll (px). */
const DRIFT = 48;
const ALT =
  "Sample render: Mavy in a deep red sequin gown with a sheer red veil walks in, then turns once as you scroll.";

/**
 * Clip timeline (8 s): 0-0.7 s empty, 0.75-3.4 s she walks in from the left
 * edge, 3.5 s whole figure in frame facing front, 3.5-6 s she spins, 6 s+
 * facing front.
 */
const LAND = 3.5;
/** Content starts to fade in a little before she stops, so it is done ~4.1 s. */
const REVEAL_AT = 3.2;
/** --intro-cap: everything is on screen by then whatever the clip does. */
const CAP_MS = 5000;
const CLIP_SECONDS = 8;
/** The spin runs LAND..end over 0..CLIP_END of the intro scroll. */
const CLIP_END = 0.92;
const FRONT = ((6 - LAND) / (CLIP_SECONDS - LAND)) * CLIP_END;
const noopSubscribe = () => () => {};

function armInline(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
}

type FrameVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number;
  cancelVideoFrameCallback?: (h: number) => void;
};

export function Story() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced } = useMotionReady();
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

  // Reduced motion: one seek to the landed (front-facing) frame, no playback.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clipSrc || !reduced) return;
    armInline(video);
    video.pause();
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
      const video = videoRef.current as FrameVideo | null;
      const q = gsap.utils.selector(root);
      const stage = q(".cgr-intro-stage")[0] as HTMLElement;
      const gw = q(".cgr-gw")[0] as HTMLElement;
      const idleEl = q(".cgr-mavy-idle")[0] as HTMLElement;
      const nouns = q(".cgr-hand-stack > span") as HTMLElement[];

      // ---- Rotator (spec.md): starts once the content is in. Each swap
      // holds 2.2 s, then the nouns crossfade over 1.2 s with a 2 px blur.
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

      // ---- Reveal: one attribute flip; cgr.css fades each [data-intro]
      // node in by opacity (600 ms, 140 ms stagger). Nothing is re-laid out.
      let revealed = false;
      let rotTimer = 0;
      const reveal = () => {
        if (revealed) return;
        revealed = true;
        root.dataset.reveal = "on";
        rotTimer = window.setTimeout(() => {
          if (stopped) return;
          started = true;
          STOP_ON.forEach((ev) => window.addEventListener(ev, stop, { capture: true, passive: true }));
          sync();
        }, 900);
      };
      const capTimer = window.setTimeout(reveal, Math.max(0, CAP_MS - performance.now()));
      // A reader who scrolls, taps or presses a key during the walk-in gets the page at once.
      const early = () => reveal();
      const EARLY_ON = ["wheel", "touchstart", "keydown"] as const;
      EARLY_ON.forEach((ev) => window.addEventListener(ev, early, { capture: true, passive: true, once: true }));

      let landed = false;
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
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top+=30",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (self) => {
            if (!landed) return;
            if (self.progress >= FRONT && idle.paused()) idle.play();
            else if (self.progress < FRONT && !idle.paused()) idle.pause();
          },
        },
      });
      tl.fromTo(gw, { x: 0 }, { x: -DRIFT, duration: 1 }, 0);

      // ---- Clip: play 0..LAND on load, then scroll scrubs LAND..end.
      let cleanupVideo = () => {};
      if (video && clipSrc) {
        armInline(video);
        video.loop = false;
        let target = 0;
        let raf = 0;
        let seekAt = 0;
        let vfc = 0;
        let poll = 0;
        const apply = () => {
          raf = 0;
          if (!landed || !video.duration) return;
          if (video.seeking && performance.now() - seekAt < 250) return;
          const from = Math.min(LAND, video.duration * 0.5);
          const t = from + target * (video.duration - 0.05 - from);
          if (Math.abs(video.currentTime - t) > 0.02) {
            seekAt = performance.now();
            video.currentTime = t;
          }
        };
        const land = () => {
          if (landed) return;
          landed = true;
          video.pause();
          if (Math.abs(video.currentTime - LAND) > 0.01) video.currentTime = LAND;
          reveal();
          root.dataset.landed = "on";
          if (!raf) raf = requestAnimationFrame(apply);
        };
        const check = (t: number) => {
          if (t >= REVEAL_AT) reveal();
          if (t >= LAND - 1 / 48) land();
        };
        const onFrame = (_now: number, meta: { mediaTime: number }) => {
          vfc = 0;
          check(meta.mediaTime);
          if (!landed && video.requestVideoFrameCallback) vfc = video.requestVideoFrameCallback(onFrame);
        };
        const tick = () => {
          poll = 0;
          check(video.currentTime);
          if (!landed) poll = requestAnimationFrame(tick);
        };
        if (video.requestVideoFrameCallback) vfc = video.requestVideoFrameCallback(onFrame);
        else poll = requestAnimationFrame(tick);
        const onEnded = () => land();
        video.addEventListener("ended", onEnded);
        const onSeeked = () => {
          if (landed && !raf) raf = requestAnimationFrame(apply);
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = 0;
        void video.play().catch(() => {
          // Autoplay refused: show the landed frame and the content.
          land();
        });
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top+=30",
          end: "bottom bottom",
          onUpdate: (self) => {
            target = Math.min(1, self.progress / CLIP_END);
            if (landed && !raf) raf = requestAnimationFrame(apply);
          },
        });
        cleanupVideo = () => {
          st.kill();
          video.removeEventListener("seeked", onSeeked);
          video.removeEventListener("ended", onEnded);
          if (vfc && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(vfc);
          if (poll) cancelAnimationFrame(poll);
          if (raf) cancelAnimationFrame(raf);
        };
      } else {
        landed = true;
      }

      return () => {
        cleanupVideo();
        detach();
        window.clearTimeout(capTimer);
        window.clearTimeout(rotTimer);
        EARLY_ON.forEach((ev) => window.removeEventListener(ev, early, true));
        rot.kill();
        idle.kill();
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [onClient, reduced, clipSrc] },
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

        <a className="cgr-mast" href={CGR_BASE} aria-label="Cavite Gown Rentals, home" data-intro="0">
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

        <p className="cgr-gw" aria-hidden="true" data-intro="1">
          Gowns
        </p>
        <p className="cgr-rot hand cgr-intro-hand" aria-hidden="true" data-intro="2">
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
          <h1 className="cgr-intro-h disp" id="cgr-hero-title" data-intro="0">
            Gown and suit rentals in <em>Dasmariñas,</em> Cavite.
          </h1>
          <div className="cgr-intro-bottom" data-intro="1">
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

        <aside className="cgr-capcol" aria-label="On Mavy" data-intro="2">
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
