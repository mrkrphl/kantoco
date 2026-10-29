"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CGR_ASSET, cgr } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Hero turntable slot. Poster-only while `src` is null.
 * To swap a clip in: re-encode it (recipe in PR #33), put it at
 * public/demos/cgr-rentals/<name>.mp4 and set `src` to "/demos/cgr-rentals/<name>.mp4".
 * mode "scrub" ties one full turn to the scroll story (rAF-throttled seeks);
 * mode "loop" is a muted, playsinline autoplay loop. Reduced motion: poster only.
 */
export const HERO_VIDEO: { src: string | null; mode: "scrub" | "loop" } = {
  src: `${CGR_ASSET}/cgr-gown-360-web.mp4`,
  mode: "scrub",
};

const TURN_POSTER = `${CGR_ASSET}/gown-red-full.webp`;

type Piece = {
  file: string;
  w: number;
  h: number;
  alt: string;
  cls: string;
  depth: number;
};

const RED: Piece[] = [
  { file: "gown-red-bodice", w: 1024, h: 1024, alt: "Red gown corset bodice with gold beading.", cls: "p-r1", depth: 0.9 },
  { file: "gown-red-detail", w: 570, h: 1280, alt: "Beaded lace close-up on the red gown.", cls: "p-r2", depth: 1.5 },
  { file: "gown-red-skirt", w: 300, h: 910, alt: "Sequin skirt of the red gown.", cls: "p-r3", depth: 1.2 },
];
const BLUE: Piece[] = [
  { file: "gown-blue-1", w: 896, h: 912, alt: "Icy blue ball gown on a headless mannequin.", cls: "p-b1", depth: 0.8 },
  { file: "gown-blue-2", w: 896, h: 912, alt: "Blue debut gown with ruffled skirt.", cls: "p-b2", depth: 1.4 },
  { file: "gown-blue-3", w: 896, h: 912, alt: "Blue gown with a cotillion sash.", cls: "p-b3", depth: 1.1 },
];
const ACC: Piece[] = [
  { file: "accessories-tiaras", w: 490, h: 332, alt: "Gold crystal tiaras on a display rack.", cls: "p-a1", depth: 1.0 },
  { file: "accessory-tiara-ruby", w: 445, h: 250, alt: "Ruby-stone pageant crown.", cls: "p-a2", depth: 1.5 },
  { file: "accessory-tiara-rose", w: 248, h: 230, alt: "Rose-stone tiara close-up.", cls: "p-a3", depth: 1.2 },
];

const STEPS = [
  { n: "01", kicker: "Cavite Gown Rentals · sample", title: "Rent the look. Hold the date." },
  { n: "02", kicker: "Pageant red", title: "Beaded lace, a corset bodice, a sequin train." },
  { n: "03", kicker: "Debut blue", title: "Ball gowns that turn the whole room." },
  { n: "04", kicker: "Finish it", title: "Crowns and tiaras, rented with the gown." },
] as const;

function armInline(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
}

function Layer({ name, pieces }: { name: string; pieces: Piece[] }) {
  return (
    <div className={`cgr-story-layer cgr-story-layer--${name}`} data-layer={name}>
      {pieces.map((p) => (
        <figure key={p.file} className={`cgr-story-piece ${p.cls}`} data-depth={p.depth}>
          <img
            src={`${CGR_ASSET}/${p.file}.webp`}
            alt={p.alt}
            width={p.w}
            height={p.h}
            loading="lazy"
            decoding="async"
          />
        </figure>
      ))}
    </div>
  );
}

export function Story() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ready, reduced } = useMotionReady();
  const src = HERO_VIDEO.src;
  const mode = HERO_VIDEO.mode;
  const useVideo = Boolean(src) && !reduced;

  // Video: loop mode autoplays; scrub mode is driven from the ScrollTrigger below.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !useVideo) return;
    armInline(video);
    if (mode === "loop") {
      video.loop = true;
      const tryPlay = () => void video.play().catch(() => {});
      tryPlay();
      video.addEventListener("canplay", tryPlay);
      return () => video.removeEventListener("canplay", tryPlay);
    }
    video.loop = false;
    video.pause();
  }, [useVideo, mode]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;
      const q = gsap.utils.selector(root);
      const steps = q("[data-step]") as HTMLElement[];
      const dots = q("[data-dot]") as HTMLElement[];
      const layers = {
        red: q("[data-layer=red] .cgr-story-piece") as HTMLElement[],
        blue: q("[data-layer=blue] .cgr-story-piece") as HTMLElement[],
        acc: q("[data-layer=acc] .cgr-story-piece") as HTMLElement[],
      };
      const turn = q(".cgr-story-turn")[0] as HTMLElement;

      gsap.set(steps.slice(1), { autoAlpha: 0, y: 28 });
      gsap.set([...layers.red, ...layers.blue, ...layers.acc], { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top+=36",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(3, Math.floor(self.progress * 0.999 * 4));
            dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
          },
        },
      });

      // Slow zoom on the turntable across the whole story.
      tl.fromTo(turn, { scale: 1 }, { scale: 1.14, duration: 4 }, 0);

      const stepOut = (el: HTMLElement, at: number) =>
        tl.to(el, { autoAlpha: 0, y: -28, duration: 0.25 }, at);
      const stepIn = (el: HTMLElement, at: number) =>
        tl.to(el, { autoAlpha: 1, y: 0, duration: 0.25 }, at);

      const reveal = (pieces: HTMLElement[], at: number, hold: number, out: boolean) => {
        pieces.forEach((p, k) => {
          const d = Number(p.dataset.depth || 1);
          tl.fromTo(
            p,
            { autoAlpha: 0, y: 120 * d, scale: 0.9 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out" },
            at + k * 0.08,
          );
          // Parallax drift while the step is held.
          tl.to(p, { y: -60 * d, duration: hold }, at + 0.45 + k * 0.08);
          if (out) tl.to(p, { autoAlpha: 0, duration: 0.25 }, at + 0.45 + hold + k * 0.04);
        });
      };

      stepOut(steps[0], 0.75);
      stepIn(steps[1], 0.95);
      reveal(layers.red, 0.8, 0.7, true);
      stepOut(steps[1], 1.9);
      tl.to(turn, { autoAlpha: 0.35, duration: 0.3 }, 1.9);
      stepIn(steps[2], 2.1);
      reveal(layers.blue, 2.0, 0.6, true);
      stepOut(steps[2], 2.95);
      tl.to(turn, { autoAlpha: 1, duration: 0.3 }, 2.95);
      stepIn(steps[3], 3.15);
      reveal(layers.acc, 3.05, 0.5, false);

      // Video scrub: one full turn over the story, rAF-throttled, one seek in flight.
      const video = videoRef.current;
      if (video && useVideo && mode === "scrub") {
        let target = 0;
        let raf = 0;
        let seekAt = 0;
        const apply = () => {
          raf = 0;
          if (!video.duration) return;
          // One seek in flight; if a seek has hung for 250ms, supersede it.
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
        // iOS needs a play() gesture-free unlock before seeks paint.
        void video.play().then(() => video.pause()).catch(() => {});
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top+=36",
          end: "bottom bottom",
          onUpdate: (self) => {
            target = self.progress;
            if (!raf) raf = requestAnimationFrame(apply);
          },
        });
        return () => {
          st.kill();
          video.removeEventListener("seeked", onSeeked);
          video.removeEventListener("loadedmetadata", onSeeked);
          if (raf) cancelAnimationFrame(raf);
        };
      }
    },
    { scope: rootRef, dependencies: [ready, reduced, mode, useVideo] },
  );

  return (
    <section
      ref={rootRef}
      className="cgr-story"
      aria-labelledby="cgr-hero-title"
      data-motion={reduced ? "static" : "on"}
      data-video={useVideo ? mode : "poster"}
    >
      <div className="cgr-story-stage">
        <div className="cgr-story-turnbox">
          <div className="cgr-story-turn">
            {useVideo && src ? (
              <video
                ref={videoRef}
                className="cgr-story-video"
                poster={TURN_POSTER}
                muted
                playsInline
                preload="auto"
                width={540}
                height={960}
                aria-label="Sample render: the red sequin evening gown turning 360° on a faceless mannequin."
              >
                <source src={src} type="video/mp4" />
              </video>
            ) : (
              <img
                className="cgr-story-video"
                src={TURN_POSTER}
                alt="Deep red sequin evening gown, full length. Face-free cutout."
                width={1024}
                height={2048}
                fetchPriority="high"
                decoding="async"
              />
            )}
          </div>
          {useVideo ? <p className="cgr-story-render">Sample render</p> : null}
        </div>

        <Layer name="red" pieces={RED} />
        <Layer name="blue" pieces={BLUE} />
        <Layer name="acc" pieces={ACC} />

        <div className="cgr-story-copy">
          {STEPS.map((s, i) => (
            <div key={s.n} className="cgr-story-step" data-step={s.n}>
              <p className="cgr-story-kicker">
                <span aria-hidden>{s.n}</span> {s.kicker}
              </p>
              {i === 0 ? (
                <h1 className="cgr-story-title" id="cgr-hero-title">
                  {s.title}
                </h1>
              ) : (
                <h2 className="cgr-story-title">{s.title}</h2>
              )}
              {i === 0 ? <p className="cgr-story-lead">{cgr.tagline}</p> : null}
              {i === 0 || i === 3 ? (
                <div className="cgr-story-actions">
                  <a className="cgr-btn cgr-btn-primary" href="#gowns">
                    Browse gowns
                  </a>
                  <a className="cgr-btn cgr-btn-onDark" href="#accessories">
                    Accessories
                  </a>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <ol className="cgr-story-dots" aria-hidden>
          {STEPS.map((s, i) => (
            <li key={s.n} data-dot className={i === 0 ? "is-on" : undefined} />
          ))}
        </ol>
      </div>
    </section>
  );
}
