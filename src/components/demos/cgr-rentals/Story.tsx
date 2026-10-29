"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CGR_ASSET, CGR_BASE, cgr, formatPhp, getGown } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Intro clip (round 4): Mavy, shot on black. 8 s, 720x1280, GOP 6, faststart.
 * HERO_CLIP = false falls back to the webp poster (no <video>, no mp4 request):
 * the poster walks in from the side inside the arch and spins.
 * - mode "scrub": the clip follows scroll (one seek in flight, 250 ms
 *   stuck-seek replacement). mode "loop": muted, playsinline autoplay loop.
 * - poster: shown while the clip loads and as the reduced-motion still
 *   (mavy-poster.jpg is the 6.5 s frame, facing front).
 * Reduced motion: a static black hero (arch + word + cards), then the bento.
 */
const HERO_CLIP = true;

export const HERO_VIDEO: {
  src: string | null;
  poster: string;
  mode: "scrub" | "loop";
  fit: "cover" | "contain";
} = {
  src: HERO_CLIP ? `${CGR_ASSET}/mavy-side-spin-web.mp4` : null,
  poster: HERO_CLIP ? `${CGR_ASSET}/mavy-poster.jpg` : `${CGR_ASSET}/gown-red-full.webp`,
  mode: "scrub",
  fit: "cover",
};

/** The huge serif word behind the arch. */
const WORD = "GOWNS";

/**
 * Intro beats as a share of the intro scroll.
 * black → walk: she walks in; walk → front: she spins while the word, cards
 * and copy arrive; front → shrinkEnd: the arch shrinks into its bento cell
 * and the other cells scale in.
 */
type Beats = { black: number; walk: number; contentIn: number; front: number; shrinkEnd: number; clipEnd: number };
const POSTER_BEATS: Beats = { black: 0.04, walk: 0.24, contentIn: 0.22, front: 0.5, shrinkEnd: 0.8, clipEnd: 0.5 };
/**
 * Clip timeline (8 s) over 0..clipEnd of the scroll: 0-1 s black stage with a
 * spotlight, 1-3 s walk in from the left, 3-5 s spin, 6 s+ facing front.
 * The reveal starts at 5 s and the bento is done by 8 s.
 */
const CLIP_SECONDS = 8;
const CLIP_END = 0.92;
const at = (sec: number) => (sec / CLIP_SECONDS) * CLIP_END;
const CLIP_BEATS: Beats = {
  black: at(0.6),
  walk: at(3),
  contentIn: at(5),
  front: at(6),
  shrinkEnd: at(7.4),
  clipEnd: CLIP_END,
};

/** Floating cards around the arch during the spin. speed = parallax factor. */
const FLOATS = [
  { k: "sequin", speed: 1.5 },
  { k: "tiara", speed: 0.7 },
  { k: "price", speed: 1.1 },
  { k: "rent", speed: 1.9 },
] as const;

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
  const { ready, reduced } = useMotionReady();
  const src = HERO_VIDEO.src;
  const mode = HERO_VIDEO.mode;
  const useVideo = Boolean(src) && !reduced;
  // The server can't know the motion preference, so the SSR <video> has no
  // <source>: nothing downloads until the client has ruled out reduced motion
  // (reduced motion then shows mavy-poster.jpg only, with no mp4 request).
  const onClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  // The "Sample render" label shows only once a clip has a decoded frame.
  const [hasFrames, setHasFrames] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !useVideo) return;
    armInline(video);
    const onData = () => setHasFrames(true);
    video.addEventListener("loadeddata", onData);
    if (video.readyState >= 2) onData();
    let tryPlay: (() => void) | null = null;
    if (mode === "loop") {
      video.loop = true;
      tryPlay = () => void video.play().catch(() => {});
      tryPlay();
      video.addEventListener("canplay", tryPlay);
    } else {
      video.loop = false;
      video.pause();
    }
    return () => {
      video.removeEventListener("loadeddata", onData);
      if (tryPlay) video.removeEventListener("canplay", tryPlay);
    };
  }, [useVideo, mode, onClient]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;
      const q = gsap.utils.selector(root);
      const stage = q(".cgr-intro-stage")[0] as HTMLElement;
      const arch = q(".cgr-intro-arch")[0] as HTMLElement;
      const frame = q(".cgr-intro-frame")[0] as HTMLElement;
      const media = q(".cgr-intro-media")[0] as HTMLElement;
      const cell = q(".cgr-bento-arch")[0] as HTMLElement;
      const word = q(".cgr-intro-word")[0] as HTMLElement;
      const floats = q(".cgr-float") as HTMLElement[];
      const col = q(".cgr-intro-col")[0] as HTMLElement | undefined;
      const cue = q(".cgr-intro-cue")[0] as HTMLElement;
      const overIn = q(".cgr-intro-over > *") as HTMLElement[];
      const cells = q(".cgr-bento-cell:not(.cgr-bento-arch)") as HTMLElement[];
      const copy = q(".cgr-bento-copy > *") as HTMLElement[];

      // Arch -> bento cell. Uniform scale + inset clip so the media never
      // stretches; the arch radius eases into the cell's corner radius.
      const geo = { tx: 0, ty: 0, s: 1, ix: 0, iy: 0, aw: 1 };
      const shrink = { k: 0 };
      const measure = () => {
        const a = arch.getBoundingClientRect();
        const c = cell.getBoundingClientRect();
        if (!a.width || !c.width) return;
        const s = Math.max(c.width / a.width, c.height / a.height);
        geo.s = s;
        geo.aw = a.width;
        geo.ix = Math.max(0, (a.width - c.width / s) / 2);
        geo.iy = Math.max(0, (a.height - c.height / s) / 2);
        geo.tx = c.left + c.width / 2 - (a.left + a.width / 2);
        geo.ty = c.top + c.height / 2 - (a.top + a.height / 2);
      };
      const paint = () => {
        const k = shrink.k;
        const sc = 1 + (geo.s - 1) * k;
        const rTop = geo.aw / 2 + (20 / geo.s - geo.aw / 2) * k;
        const rBot = 22 + (20 / geo.s - 22) * k;
        frame.style.transform =
          k > 0.0005 ? `translate3d(${geo.tx * k}px, ${geo.ty * k}px, 0) scale(${sc})` : "";
        frame.style.clipPath = `inset(${geo.iy * k}px ${geo.ix * k}px round ${rTop}px ${rTop}px ${rBot}px ${rBot}px)`;
      };
      const onRefreshInit = () => {
        frame.style.transform = "";
      };
      const onRefresh = () => {
        measure();
        paint();
      };
      measure();
      paint();
      ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.addEventListener("refresh", onRefresh);

      gsap.set(cells, { autoAlpha: 0, scale: 0.84 });
      gsap.set(copy, { autoAlpha: 0, y: 26 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top+=36",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      const B = useVideo ? CLIP_BEATS : POSTER_BEATS;
      const win = B.front - B.contentIn;
      const span = B.shrinkEnd - B.front;
      // Start all black: nothing but a small scroll cue.
      gsap.set([word, ...floats, ...overIn], { autoAlpha: 0 });
      gsap.set(media, { autoAlpha: 1 });
      if (!useVideo) {
        // Poster only: she walks in from the side inside the arch, then spins.
        tl.fromTo(
          media,
          { xPercent: -125, x: 0 },
          { xPercent: 0, x: 0, duration: B.walk - B.black, ease: "power1.out" },
          B.black,
        );
        tl.to(
          media,
          { keyframes: { y: [0, -10, 0, -10, 0, -8, 0] }, duration: B.walk - B.black, ease: "none" },
          B.black,
        );
        if (col) {
          tl.fromTo(
            col,
            { rotationY: 0, transformPerspective: 900 },
            { rotationY: 360, duration: B.front - B.walk - 0.04, ease: "power1.inOut" },
            B.walk,
          );
        }
      }
      // (The clip carries its own walk and spin; only the content moves.)
      tl.to(cue, { autoAlpha: 0, duration: 0.05 }, B.black);
      // Content arrives around her while she turns, complete when she faces front.
      tl.fromTo(
        word,
        { autoAlpha: 0, scale: 1.25, xPercent: 8 },
        { autoAlpha: 1, scale: 1, xPercent: 0, duration: 0.7 * win, ease: "power2.out" },
        B.contentIn,
      );
      floats.forEach((f, i) => {
        const sp = FLOATS[i]?.speed ?? 1;
        tl.fromTo(
          f,
          { yPercent: 90 * sp },
          { yPercent: -60 * sp, rotation: (i % 2 ? 1 : -1) * 6 * sp, duration: win + 0.5 * span },
          B.contentIn,
        );
        tl.fromTo(f, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 * win }, B.contentIn + 0.1 * win + i * 0.14 * win);
      });
      tl.fromTo(
        overIn,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.28 * win, stagger: 0.1 * win, ease: "power2.out" },
        B.front - 0.5 * win,
      );
      tl.to(overIn, { autoAlpha: 0, duration: 0.2 * span }, B.front + 0.07 * span);
      // Facing front -> the arch shrinks into its bento cell.
      tl.to(shrink, { k: 1, duration: span, ease: "power2.inOut", onUpdate: paint }, B.front);
      tl.to(word, { autoAlpha: 0, scale: 0.9, duration: 0.6 * span }, B.front);
      tl.to(
        floats,
        { autoAlpha: 0, scale: 0.6, duration: 0.47 * span, stagger: 0.07 * span, ease: "power1.in" },
        B.front + 0.07 * span,
      );
      // The other bento cells scale in around it.
      tl.to(
        cells,
        { autoAlpha: 1, scale: 1, duration: 0.47 * span, stagger: 0.12 * span, ease: "back.out(1.6)" },
        B.front + 0.53 * span,
      );
      tl.to(
        copy,
        { autoAlpha: 1, y: 0, duration: 0.33 * span, stagger: 0.07 * span, ease: "power2.out" },
        B.front + 0.67 * span,
      );
      tl.to({}, { duration: 0.08 }, 0.92);

      // Floats: pointer repels them and they spring back (fine pointers);
      // tap/click pops one (works on touch too).
      const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const bodies = floats.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
      let mx = -1e4;
      let my = -1e4;
      let popRaf = 0;
      const step = () => {
        popRaf = 0;
        let moving = false;
        floats.forEach((p, i) => {
          const b = bodies[i];
          const r = p.getBoundingClientRect();
          const dx = r.left + r.width / 2 - mx;
          const dy = r.top + r.height / 2 - my;
          const d = Math.hypot(dx, dy) || 1;
          let fx = -b.x * 0.09;
          let fy = -b.y * 0.09;
          if (d < 150) {
            const f = ((150 - d) / 150) * 4;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
          }
          b.vx = (b.vx + fx) * 0.8;
          b.vy = (b.vy + fy) * 0.8;
          b.x += b.vx;
          b.y += b.vy;
          p.style.translate = `${b.x.toFixed(1)}px ${b.y.toFixed(1)}px`;
          if (Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.x) + Math.abs(b.y) > 0.3) moving = true;
        });
        if (moving) popRaf = requestAnimationFrame(step);
      };
      const kick = () => {
        if (!popRaf) popRaf = requestAnimationFrame(step);
      };
      const onMove = (e: PointerEvent) => {
        mx = e.clientX;
        my = e.clientY;
        kick();
      };
      const onLeave = () => {
        mx = -1e4;
        my = -1e4;
        kick();
      };
      const onPop = (e: Event) => {
        const el = (e.currentTarget as HTMLElement).firstElementChild as HTMLElement | null;
        if (!el) return;
        gsap.fromTo(
          el,
          { scale: 1.3, rotate: gsap.utils.random(-12, 12) },
          { scale: 1, rotate: 0, duration: 0.6, ease: "elastic.out(1.1, 0.35)", overwrite: true },
        );
      };
      if (fine) {
        stage.addEventListener("pointermove", onMove);
        stage.addEventListener("pointerleave", onLeave);
      }
      floats.forEach((p) => p.addEventListener("pointerdown", onPop));

      // Clip scrub: the whole clip maps to 0..clipEnd of the intro scroll.
      // Same seek pacing as r3: rAF-throttled, one seek in flight, 250 ms stuck-seek replacement.
      const video = videoRef.current;
      let cleanupVideo = () => {};
      if (video && useVideo && mode === "scrub") {
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
          start: "top top+=36",
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
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
        floats.forEach((p) => p.removeEventListener("pointerdown", onPop));
        if (popRaf) cancelAnimationFrame(popRaf);
        frame.style.transform = "";
        frame.style.clipPath = "";
      };
    },
    { scope: rootRef, dependencies: [ready, reduced, mode, useVideo, onClient] },
  );

  const hours = cgr.hours[0];
  const red = getGown("red-sequin-evening");
  const topA = getGown("blue-ball-gown");
  const topB = getGown("red-lace-corset");
  const tiara = getGown("ruby-pageant-crown");
  const strip = [
    { d: "Thu", n: 12, booked: true },
    { d: "Fri", n: 13, booked: false },
    { d: "Sat", n: 14, booked: false },
    { d: "Sun", n: 15, booked: false },
    { d: "Mon", n: 16, booked: false },
  ];

  return (
    <section
      ref={rootRef}
      className="cgr-intro"
      aria-labelledby="cgr-hero-title"
      data-motion={reduced ? "static" : "on"}
      data-media={useVideo ? "video" : "poster"}
      data-clip={HERO_CLIP ? "on" : "off"}
    >
      <div className="cgr-intro-stage">
        <p className="cgr-intro-word" aria-hidden="true">
          {WORD}
        </p>

        {/* Bento end state. The arch lands in .cgr-bento-arch. */}
        <div className="cgr-bento">
          <div className="cgr-bento-cell cgr-bento-copy">
            <p className="cgr-intro-kicker">
              <span>Cavite Gown Rentals</span> · sample
            </p>
            <h1 className="cgr-intro-title" id="cgr-hero-title">
              Rent the look. Hold the date.
            </h1>
            <p className="cgr-intro-lead">{cgr.tagline}</p>
            <div className="cgr-intro-actions">
              <a className="cgr-btn cgr-btn-gold" href="#gowns">
                Browse gowns
              </a>
              <a className="cgr-btn cgr-btn-onDark" href="#accessories">
                Accessories
              </a>
            </div>
            <dl className="cgr-intro-facts">
              <div>
                <dt>Hours</dt>
                <dd>
                  {hours.day} · {hours.time}
                </dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>Salawag, Dasmariñas</dd>
              </div>
              <div>
                <dt>Holds</dt>
                <dd>Pick a date, get a CGR code</dd>
              </div>
            </dl>
          </div>

          <div className="cgr-bento-cell cgr-bento-arch" aria-hidden="true" />

          <div className="cgr-bento-cell cgr-bento-gowns">
            <p className="cgr-bento-h">Top gowns</p>
            <div className="cgr-bento-pair">
              {[topA, topB].map((g) =>
                g ? (
                  <Link key={g.slug} href={`${CGR_BASE}/gown/${g.slug}`} className="cgr-bento-thumb" data-cursor="rent">
                    <span className="cgr-bento-thumb-img">
                      <img
                        src={`${CGR_ASSET}/${g.images[0].file}.webp`}
                        alt=""
                        width={g.images[0].w}
                        height={g.images[0].h}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="cgr-bento-thumb-t">{g.name}</span>
                    <span className="cgr-bento-thumb-p">{formatPhp(g.pricePerDay)}/day</span>
                  </Link>
                ) : null,
              )}
            </div>
          </div>

          <div className="cgr-bento-cell cgr-bento-date">
            <p className="cgr-bento-h">Check a date</p>
            <ol className="cgr-bento-strip" aria-label="Sample dates for the red sequin gown, November">
              {strip.map((s) => (
                <li key={s.n} className={s.booked ? "is-booked" : undefined}>
                  <span>{s.d}</span>
                  <b>{s.n}</b>
                  <span className="cgr-sr">{s.booked ? "booked" : "open"}</span>
                </li>
              ))}
            </ol>
            {red ? (
              <Link className="cgr-bento-link" href={`${CGR_BASE}/gown/${red.slug}`}>
                See open dates →
              </Link>
            ) : null}
          </div>

          <div className="cgr-bento-cell cgr-bento-acc">
            {tiara ? (
              <span className="cgr-bento-acc-img">
                <img
                  src={`${CGR_ASSET}/${tiara.images[0].file}.webp`}
                  alt=""
                  width={tiara.images[0].w}
                  height={tiara.images[0].h}
                  loading="lazy"
                  decoding="async"
                />
              </span>
            ) : null}
            <p className="cgr-bento-h">Accessories</p>
            <a className="cgr-bento-link" href="#accessories">
              Tiaras &amp; crowns →
            </a>
          </div>
        </div>

        <div className="cgr-intro-arch">
          <div className="cgr-intro-frame">
            <div className="cgr-intro-media" data-fit={HERO_VIDEO.fit}>
              {useVideo && src ? (
                <video
                  ref={videoRef}
                  className="cgr-intro-video"
                  poster={HERO_VIDEO.poster}
                  muted
                  playsInline
                  preload="auto"
                  aria-label="Sample render: Mavy walks in from the left in a red sequin gown, turns once and faces front."
                >
                  {onClient ? <source src={src} type="video/mp4" /> : null}
                </video>
              ) : HERO_CLIP ? (
                <img
                  className="cgr-intro-still"
                  src={HERO_VIDEO.poster}
                  alt="Mavy faces front in a deep red sequin gown with a sheer red veil."
                  width={720}
                  height={1280}
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <>
                  <img
                    className="cgr-intro-back"
                    src={HERO_VIDEO.poster}
                    alt=""
                    width={1024}
                    height={2048}
                    decoding="async"
                    aria-hidden="true"
                  />
                  <div className="cgr-intro-col">
                    <img
                      src={HERO_VIDEO.poster}
                      alt="Deep red sequin evening gown, close on the beaded bodice and sequin skirt."
                      width={1024}
                      height={2048}
                      fetchPriority="high"
                      decoding="async"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="cgr-intro-shade" aria-hidden="true" />
            {useVideo && hasFrames ? <p className="cgr-intro-render">Sample render</p> : null}
          </div>

          <div className="cgr-floats" aria-hidden="true">
            <span className="cgr-float cgr-float-sequin">
              <span className="cgr-float-in">
                <img src={`${CGR_ASSET}/gown-red-skirt.webp`} alt="" width={300} height={910} decoding="async" />
              </span>
            </span>
            <span className="cgr-float cgr-float-tiara">
              <span className="cgr-float-in">
                <img src={`${CGR_ASSET}/accessory-tiara-rose.webp`} alt="" width={248} height={230} decoding="async" />
              </span>
            </span>
            <span className="cgr-float cgr-float-price">
              <span className="cgr-float-in">
                <small>from</small> ₱2,200<small>/day</small>
              </span>
            </span>
            <span className="cgr-float cgr-float-rent">
              <span className="cgr-float-in">Rent now ↗</span>
            </span>
          </div>
        </div>

        <p className="cgr-intro-cue" aria-hidden="true">
          Scroll
        </p>

        <div className="cgr-intro-over">
          <p className="cgr-intro-tag" aria-hidden="true">
            Rent the look. <em>Hold the date.</em>
          </p>
          <a className="cgr-btn cgr-btn-gold" href="#gowns">
            Browse gowns
          </a>
        </div>
      </div>
    </section>
  );
}
