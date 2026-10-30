"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { CGR_ASSET, formatPhp } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";
import { createAlphaRenderer, supportsAlphaCanvas } from "./heroAlpha";
import { Magnet } from "./Kinetic";

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);
/** rotator.md §3: cubic-bezier(.45,0,.55,1), the --ease-drift token. */
const DRIFT = CustomEase.create("cgrDrift", "0.45,0,0.55,1");

/**
 * Round 7 intro (Design stamp r7/direction.md §4 Intro, §6 motion).
 * Black stage. GOWNS (r7.2: Anton, 570px @1440 / 164px @390) bleeds off both
 * edges behind Mavy; the stacked-alpha cutout is drawn to a transparent
 * WebGL canvas in front of it (heroAlpha.ts). The clip scrubs with scroll.
 * Over the last 20% of the intro an oxblood S-curve rises from the bottom
 * edge and her hem and veil fall over it (canvas z 6, curve z 3), then the
 * landed headline "Gown rentals in Dasmariñas, Cavite." reveals on the curve.
 * r7.2: the script accent is a one-pass rotator, "for your" + a noun
 * (stamp r7.2/rotator.md); screen readers get one sr-only sentence instead.
 *
 * Reduced motion: the landed composition (d02) as a still, with the hand
 * showing "for your / debut". The alpha clip is
 * loaded with preload="metadata" and seeked once to the landed frame, so the
 * cutout stays a cutout; without WebGL the poster jpg is used.
 */

/** Stacked-alpha cutout (540x1920: colour top half, matte bottom half). */
const HERO_ALPHA = true;
export const HERO_ALPHA_SRC = `${CGR_ASSET}/mavy-side-spin-alpha.mp4`;
/** Plain clip on black: the no-WebGL fallback only. */
const HERO_PLAIN_SRC = `${CGR_ASSET}/mavy-side-spin-web.mp4`;
const HERO_POSTER = `${CGR_ASSET}/mavy-poster.jpg`;

const WORD = "GOWNS";
/** Rotator nouns (stamp r7.2/rotator.md §1), in order; it ends back on debut. */
const NOUNS = ["debut", "pageant", "filipiniana", "sagala", "gala night", "wedding", "prom", "formal night"];
/** Hold, crossfade (s) and blur for each swap (rotator.md §3). */
const ROT_HOLD = 1.9;
const ROT_FADE = 0.6;
const ROT_BLUR = 4;
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
  black: at(0.6),
  walk: at(3),
  contentIn: at(5),
  front: at(6),
  clipEnd: CLIP_END,
};
/** Breakout: the curve morphs over the last 20% of the intro scroll. */
const CURVE_FROM = 0.8;

/** Equal-command paths so GSAP can tween attr d (flat -> S-curve). */
const CURVE = {
  desk: {
    box: "0 0 1440 900",
    flat: "M0 900 C 420 900 560 900 940 900 C 1180 900 1320 900 1440 900 V900 H0 Z",
    s: "M0 560 C 420 560 560 700 940 700 C 1180 700 1320 630 1440 610 V900 H0 Z",
  },
  phone: {
    box: "0 0 390 844",
    flat: "M0 844 C 120 844 180 844 300 844 C 340 844 370 844 390 844 V844 H0 Z",
    s: "M0 520 C 120 520 180 600 300 600 C 340 600 370 590 390 580 V844 H0 Z",
  },
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
      const mavy = q(".cgr-mavy")[0] as HTMLElement;
      const idleEl = q(".cgr-mavy-idle")[0] as HTMLElement;
      const hand = q(".cgr-intro-hand")[0] as HTMLElement;
      const handFix = q(".cgr-hand-fix")[0] as HTMLElement;
      const nouns = q(".cgr-hand-stack > span") as HTMLElement[];
      const copyItems = q(".cgr-intro-copy > *") as HTMLElement[];
      const fadeOut = q(".cgr-intro-copy, .cgr-intro-cue, .cgr-intro-hand") as HTMLElement[];
      const lines = q(".cgr-intro-h .ln > span") as HTMLElement[];
      const after = q(".cgr-intro-sub") as HTMLElement[];

      // Load (time-based): the copy fades up, the hand accent writes on.
      const intro = gsap.timeline({ delay: 0.25 });
      intro.fromTo(
        copyItems,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 },
        0,
      );
      // The wipe box is padded past the glyphs (negative inset) so the soft
      // text-shadow is never cut into a hard-edged plate. When the write-on
      // lands, the clip is set to an inline "none", which also beats the CSS
      // pre-hide rule (r7.2.1).
      const WIPE_FROM = "inset(-40% 100% -40% -20%)";
      const WIPE_TO = "inset(-40% -20% -40% -20%)";
      function unclip(this: gsap.core.Tween) {
        gsap.set(this.targets(), { clipPath: "none" });
      }
      intro.fromTo(
        handFix,
        { clipPath: WIPE_FROM },
        { clipPath: WIPE_TO, duration: 1.1, ease: "power2.out", onComplete: unclip },
        0.35,
      );
      intro.fromTo(
        nouns[0],
        { clipPath: WIPE_FROM },
        { clipPath: WIPE_TO, duration: 1.1, ease: "power2.out", onComplete: unclip },
        0.6,
      );

      // Rotator (rotator.md §3): once through the list from ~1.7 s, back to
      // debut. Each swap holds 1.9 s, then the outgoing and incoming nouns
      // crossfade over the same 0.6 s with a 4 px blur and a 0.05 em rise.
      const em = () => parseFloat(getComputedStyle(hand).fontSize) * 0.05;
      const rot = gsap.timeline({ paused: true });
      const order = [...NOUNS.keys(), 0];
      for (let k = 1; k < order.length; k++) {
        const out = nouns[order[k - 1]];
        const inn = nouns[order[k]];
        const t = (k - 1) * (ROT_HOLD + ROT_FADE) + ROT_HOLD;
        rot.to(
          out,
          { autoAlpha: 0, y: () => -em(), filter: `blur(${ROT_BLUR}px)`, duration: ROT_FADE, ease: DRIFT },
          t,
        );
        rot.fromTo(
          inn,
          { autoAlpha: 0, y: () => em(), filter: `blur(${ROT_BLUR}px)` },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: ROT_FADE, ease: DRIFT, immediateRender: false },
          t,
        );
      }
      rot.eventCallback("onComplete", () => detach());

      // Any scroll or input ends it: crossfade to debut, no more swaps.
      let stopped = false;
      const stop = () => {
        if (stopped) return;
        stopped = true;
        detach();
        const live = rot.isActive() || rot.progress() < 1;
        rot.pause();
        if (!live) return;
        const showing = nouns.filter((n, i) => i !== 0 && Number(gsap.getProperty(n, "autoAlpha")) > 0);
        gsap.to(showing, { autoAlpha: 0, y: () => -em(), filter: `blur(${ROT_BLUR}px)`, duration: ROT_FADE, ease: DRIFT });
        gsap.to(nouns[0], { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: ROT_FADE, ease: DRIFT });
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

      // Idle on the wrapper, never the canvas: plays once she has landed.
      const idle = gsap.to(idleEl, {
        scale: 1.012,
        y: -4,
        rotation: 0.4,
        duration: 7,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      const mm = gsap.matchMedia();
      mm.add(
        { desk: "(min-width: 900px)", phone: "(max-width: 899px)" },
        (ctx) => {
          const desk = Boolean(ctx.conditions?.desk);
          const P = desk ? CURVE.desk : CURVE.phone;
          const path = q(desk ? ".cgr-curve-desk path" : ".cgr-curve-phone path")[0] as unknown as SVGPathElement;
          const svg = path.ownerSVGElement as SVGSVGElement;
          const H = () => stage.clientHeight;
          const W = () => stage.clientWidth;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "top top+=30",
              end: "bottom bottom",
              scrub: 0.5,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                if (self.progress > 0.995 && idle.paused()) idle.play();
              },
              onLeave: () => idle.play(),
              onEnterBack: () => idle.pause(),
            },
          });
          // GOWNS drifts and crops (never fades).
          tl.fromTo(word, { x: 0 }, { x: () => -0.08 * W(), duration: 1 }, 0);
          tl.fromTo(
            word,
            { y: 0 },
            // r7.2: Anton GOWNS sits higher, so it lifts less (stamp d2/m2; phone lifts half as far because the 28px sample bar pushes the wordmark down).
            { y: () => -(desk ? 0.075 : 0.035) * H(), duration: 0.4, ease: "power1.inOut" },
            0.6,
          );
          // The right-hand copy and the hand accent clear before she crosses.
          tl.fromTo(fadeOut, { autoAlpha: 1 }, { autoAlpha: 0, duration: at(0.8), ease: "power2.in" }, at(desk ? 2.6 : 1.9));
          // She glides from the left 60% to the right 40% while she turns.
          tl.fromTo(
            mavy,
            { x: 0, y: 0, scale: 1 },
            {
              x: () => (desk ? 0.41 : 0.13) * W(),
              y: () => (desk ? 0 : -0.2 * H()),
              scale: desk ? 0.943 : 0.85,
              duration: CLIP_BEATS.front - CLIP_BEATS.walk,
              ease: "power2.inOut",
            },
            CLIP_BEATS.walk,
          );
          // Breakout: flat -> S-curve, rising 30vh -> 0 (last 20%).
          tl.fromTo(path, { attr: { d: P.flat } }, { attr: { d: P.s }, duration: 1 - CURVE_FROM, ease: "power2.out" }, CURVE_FROM);
          tl.fromTo(svg, { y: () => 0.3 * H() }, { y: 0, duration: 1 - CURVE_FROM, ease: "power2.out" }, CURVE_FROM);
          // Landed headline: line reveals on the curve.
          tl.fromTo(
            lines,
            { clipPath: "inset(100% 0% 0% 0%)", yPercent: 30 },
            { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 0.07, stagger: 0.02, ease: "power3.out" },
            0.88,
          );
          tl.fromTo(after, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: "power3.out" }, 0.93);
          tl.to({}, { duration: 0 }, 1);
          return () => {
            gsap.set([path], { attr: { d: P.flat } });
          };
        },
      );

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
        mm.revert();
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
      <div className="cgr-intro-stage grain dark">
        <p className="cgr-intro-word ext" aria-hidden="true">
          {WORD}
        </p>

        <svg className="cgr-curve cgr-curve-desk" viewBox={CURVE.desk.box} preserveAspectRatio="none" aria-hidden="true">
          <path d={reduced ? CURVE.desk.s : CURVE.desk.flat} />
        </svg>
        <svg className="cgr-curve cgr-curve-phone" viewBox={CURVE.phone.box} preserveAspectRatio="none" aria-hidden="true">
          <path d={reduced ? CURVE.phone.s : CURVE.phone.flat} />
        </svg>

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

        <p className="hand cgr-intro-hand" aria-hidden="true">
          <span className="cgr-hand-fix">for your</span>
          <span className="cgr-hand-stack">
            {NOUNS.map((n, i) => (
              <span key={n} data-i={i}>
                {n}
              </span>
            ))}
          </span>
        </p>

        <div className="cgr-intro-copy">
          <div className="cgr-intro-text">
            <p className="cgr-intro-lead">
              Cavite Gown Rentals rents gowns and suits for any formal occasion in Dasmariñas, Cavite. Every gown shows its open dates
              <span className="cgr-intro-lead-more">, and a hold is a request, not a payment</span>.
            </p>
            <p className="mono cgr-intro-rate">
              from {formatPhp(2200)} a day · example rates · sample site by kantoco
            </p>
          </div>
          <Magnet href="#gowns">
            see the
            <br />
            gowns
          </Magnet>
        </div>
        <p className="sr-only">
          Gowns for your debut, pageant, filipiniana, sagala, gala night, wedding, prom or formal night.
        </p>

        <p className="cgr-intro-cue mono" aria-hidden="true">
          scroll to watch her turn
        </p>

        <div className="cgr-intro-end">
          <h1 className="cgr-intro-h ext" id="cgr-hero-title">
            <span className="ln">
              <span>Gown rentals in</span>
            </span>{" "}
            <span className="ln ln-2">
              <span>
                <em>Dasmariñas,</em>
              </span>
            </span>{" "}
            <span className="ln ln-3">
              <span>Cavite.</span>
            </span>
          </h1>
          <p className="cgr-intro-sub">
            Each gown has its own calendar. A hold request gets you a CGR reference code, and the shop confirms the
            date before you pay.
          </p>
        </div>
      </div>
    </section>
  );
}
