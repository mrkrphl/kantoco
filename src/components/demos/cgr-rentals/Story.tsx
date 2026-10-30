"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CGR_ASSET, CGR_BASE, cgr, formatPhp, getGown } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";
import { createAlphaRenderer, supportsAlphaCanvas } from "./heroAlpha";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Intro clip (round 4): Mavy, shot on black. 8 s, 720x1280, GOP 6, faststart.
 * (Used when HERO_ALPHA is off or WebGL is missing.)
 * HERO_CLIP = false falls back to the webp poster (no <video>, no mp4 request):
 * the poster walks in from the side inside the arch and spins.
 * - mode "scrub": the clip follows scroll (one seek in flight, 250 ms
 *   stuck-seek replacement). mode "loop": muted, playsinline autoplay loop.
 * - poster: shown while the clip loads and as the reduced-motion still
 *   (mavy-poster.jpg is the 6.5 s frame, facing front).
 * Reduced motion: the landed hero only (poster in the arch frame), no clip.
 */
const HERO_CLIP = true;

/**
 * Stacked-alpha hero (round 6, ON: Mark approved the cutout). The mp4 carries
 * colour in the top half (premultiplied on black) and a greyscale matte in
 * the bottom half (white = opaque); heroAlpha.ts draws it to a transparent
 * WebGL canvas so GOWNS sits behind her, scrubbed with the same seek logic.
 * The canvas is sized from the file's real videoWidth x videoHeight / 2
 * (the repo file is 540x1920, two 540x960 halves; the matte already fades
 * over its bottom 80px, so no second hem fade is applied here). Without
 * WebGL, or with this false, the plain clip below is used and no alpha file
 * is requested.
 */
const HERO_ALPHA = true;
export const HERO_ALPHA_SRC = `${CGR_ASSET}/mavy-side-spin-alpha.mp4`;

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
 * black → walk: she walks in; walk → front: she spins; at front the word
 * and tagline leave; front → shrinkEnd: the framed arch settles into the
 * centre column of the landed grid and the ruled cells fade up (two groups).
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
  // Alpha canvas path: only with the switch on, on the client, with WebGL.
  const alphaOk = useSyncExternalStore(
    noopSubscribe,
    () => HERO_ALPHA && supportsAlphaCanvas(),
    () => false,
  );
  const alpha = useVideo && alphaOk;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clipSrc = alpha ? HERO_ALPHA_SRC : src;

  // Alpha: redraw the canvas whenever the hidden stacked video shows a new frame.
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!alpha || !video || !canvas) return;
    const r = createAlphaRenderer(canvas, video);
    if (!r) return;
    return () => r.destroy();
  }, [alpha, onClient]);

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
  }, [useVideo, mode, onClient, alpha]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;
      const q = gsap.utils.selector(root);
      const arch = q(".cgr-intro-arch")[0] as HTMLElement;
      const frame = q(".cgr-intro-frame")[0] as HTMLElement;
      const media = q(".cgr-intro-media")[0] as HTMLElement;
      const box = q(".cgr-bento-archbox")[0] as HTMLElement;
      const word = q(".cgr-intro-word")[0] as HTMLElement;
      const wordIn = q(".cgr-intro-word-in")[0] as HTMLElement;
      const over = q(".cgr-intro-over, .cgr-intro-cta") as HTMLElement[];
      const overItems = q(".cgr-intro-over > *, .cgr-intro-cta > *") as HTMLElement[];
      const hair = q(".cgr-intro-hair")[0] as HTMLElement | undefined;
      const groupA = q(".cgr-bento-copy") as HTMLElement[];
      const groupB = q(".cgr-bento-cap, .cgr-bento-side") as HTMLElement[];

      // Load (time-based, not scroll): GOWNS unmasks top to bottom, then the
      // tagline block fades up and its hairline draws.
      const intro = gsap.timeline({ delay: 0.2 });
      intro.fromTo(
        wordIn,
        { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
        { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power2.out" },
        0,
      );
      intro.fromTo(
        overItems,
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: (i: number) => Math.min(i, 2) * 0.12 },
        0.6,
      );
      if (hair) {
        intro.fromTo(hair, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.out" }, 0.75);
      }

      // Arch -> centre column. The landing box has the arch's aspect, so the
      // move is one uniform scale + translate on the frame (transform only;
      // the arch radius and hairline frame are kept).
      const geo = { tx: 0, ty: 0, s: 1 };
      const shrink = { k: 0 };
      const measure = () => {
        const a = arch.getBoundingClientRect();
        const c = box.getBoundingClientRect();
        if (!a.width || !c.width) return;
        geo.s = Math.min(c.width / a.width, c.height / a.height);
        geo.tx = c.left + c.width / 2 - (a.left + a.width / 2);
        geo.ty = c.top + c.height / 2 - (a.top + a.height / 2);
      };
      const paint = () => {
        const k = shrink.k;
        const sc = 1 + (geo.s - 1) * k;
        frame.style.transform =
          k > 0.0005 ? `translate3d(${(geo.tx * k).toFixed(2)}px, ${(geo.ty * k).toFixed(2)}px, 0) scale(${sc.toFixed(4)})` : "";
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

      gsap.set([...groupA, ...groupB], { autoAlpha: 0, y: 16 });
      gsap.set(media, { autoAlpha: 1 });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top+=30",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
      const B = useVideo ? CLIP_BEATS : POSTER_BEATS;
      const span = B.shrinkEnd - B.front;
      if (!useVideo) {
        // Poster only: she walks in from the side inside the arch.
        tl.fromTo(
          media,
          { xPercent: -125, x: 0 },
          { xPercent: 0, x: 0, duration: B.walk - B.black, ease: "power2.out" },
          B.black,
        );
      }
      // (The clip carries its own walk and spin; only the content moves.)
      // At the front beat GOWNS and the tagline fade out (~600ms of scroll).
      tl.fromTo(word, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3 * span, ease: "power3.inOut" }, B.front - 0.15 * span);
      tl.fromTo(over, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25 * span, ease: "power3.inOut" }, B.front - 0.15 * span);
      // The framed arch settles into the landed grid.
      tl.to(shrink, { k: 1, duration: span, ease: "power3.inOut", onUpdate: paint }, B.front);
      // Landed cells: fade + y 16 -> 0, two groups (0 / 180ms feel).
      tl.to(groupA, { autoAlpha: 1, y: 0, duration: 0.45 * span, ease: "power3.out" }, B.front + 0.45 * span);
      tl.to(groupB, { autoAlpha: 1, y: 0, duration: 0.45 * span, ease: "power3.out" }, B.front + 0.6 * span);
      tl.to({}, { duration: 0.08 }, 0.92);

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
        intro.kill();
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
        frame.style.transform = "";
      };
    },
    { scope: rootRef, dependencies: [ready, reduced, mode, useVideo, onClient, alpha] },
  );

  const hours = cgr.hours[0];

  return (
    <>
      <section
        ref={rootRef}
        className="cgr-intro"
        aria-labelledby="cgr-hero-title"
        data-motion={reduced ? "static" : "on"}
        data-media={useVideo ? "video" : "poster"}
        data-clip={HERO_CLIP ? "on" : "off"}
        data-alpha={alpha ? "on" : "off"}
      >
        <div className="cgr-intro-stage">
          <p className="cgr-intro-word" aria-hidden="true">
            <span className="cgr-intro-word-in">{WORD}</span>
          </p>

          {/* Landed hero: three ruled columns. The arch lands in .cgr-bento-archbox. */}
          <div className="cgr-bento">
            <div className="cgr-bento-cell cgr-bento-copy">
              <p className="cgr-micro cgr-overline">Cavite Gown Rentals · A KantoCo sample</p>
              <h1 className="cgr-intro-title" id="cgr-hero-title">
                Rent the look. <em>Hold the date.</em>
              </h1>
              <p className="cgr-intro-lead">
                Debut, pageant and formal gowns with tiaras to match. Pick a gown, check your date and
                hold it with a reference code.
              </p>
              <p className="cgr-price">
                from {formatPhp(2200)} a day <span className="cgr-micro">Example rate</span>
              </p>
              <div className="cgr-actions">
                <a className="cgr-btn" href="#gowns">
                  Browse gowns
                </a>
                <a className="cgr-link" href="#holds">
                  How holds work
                </a>
              </div>
              <Facts className="cgr-facts cgr-facts--stage" hours={`${hours.day} · ${hours.time}`} />
            </div>

            <div className="cgr-bento-cell cgr-bento-arch">
              <div className="cgr-bento-archbox">
                {reduced && HERO_CLIP ? (
                  <span className="cgr-arch-still">
                    <img
                      className="cgr-intro-still"
                      src={HERO_VIDEO.poster}
                      alt="Mavy faces front in a deep red sequin gown with a sheer red veil."
                      width={720}
                      height={1280}
                      fetchPriority="high"
                      decoding="async"
                    />
                  </span>
                ) : null}
              </div>
              <p className="cgr-bento-cap cgr-micro" aria-hidden="true">
                <span>Intro clip, last frame</span>
                <span>Sample render</span>
              </p>
            </div>

            <div className="cgr-bento-cell cgr-bento-side">
              <LandedSide />
            </div>
          </div>

          <div className="cgr-intro-arch" aria-hidden={reduced || undefined}>
            <div className="cgr-intro-frame">
              <div className="cgr-intro-media" data-fit={HERO_VIDEO.fit}>
                {reduced ? null : useVideo && clipSrc ? (
                  <>
                    <video
                      ref={videoRef}
                      key={alpha ? "alpha" : "clip"}
                      className={alpha ? "cgr-intro-alphasrc" : "cgr-intro-video"}
                      poster={alpha ? undefined : HERO_VIDEO.poster}
                      muted
                      playsInline
                      preload="auto"
                      aria-hidden={alpha ? true : undefined}
                      aria-label={
                        alpha
                          ? undefined
                          : "Sample render: Mavy walks in from the left in a red sequin gown, turns once and faces front."
                      }
                    >
                      {onClient ? <source src={clipSrc} type="video/mp4" /> : null}
                    </video>
                    {alpha ? (
                      <canvas
                        ref={canvasRef}
                        className="cgr-intro-canvas"
                        role="img"
                        aria-label="Sample render: Mavy walks in from the left in a red sequin gown, turns once and faces front."
                      />
                    ) : null}
                  </>
                ) : (
                  <img
                    className="cgr-intro-still"
                    src={HERO_VIDEO.poster}
                    alt="Deep red sequin gown, sample render."
                    width={720}
                    height={1280}
                    fetchPriority="high"
                    decoding="async"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="cgr-intro-over">
            <p className="cgr-micro cgr-intro-render" data-ready={hasFrames ? "on" : "off"}>
              The intro clip · Sample render
            </p>
            <p className="cgr-intro-tag" aria-hidden="true">
              Rent the look. <em>Hold the date.</em>
            </p>
            <span className="cgr-intro-hair" aria-hidden="true" />
            <p className="cgr-micro cgr-intro-place">Example gowns · Dasmariñas, Cavite</p>
          </div>

          <div className="cgr-intro-cta">
            <a className="cgr-link" href="#gowns">
              Browse gowns
            </a>
            <p className="cgr-intro-cue cgr-micro" aria-hidden="true">
              Scroll
            </p>
          </div>
        </div>
      </section>

      {/* Phone: the rest of the landed hero follows the sticky stage. */}
      <section className="cgr-wrap cgr-landed-more" aria-label="At a glance">
        <Facts className="cgr-facts" hours={`${hours.day} · ${hours.time}`} />
        <LandedSide />
      </section>
    </>
  );
}

function Facts({ className, hours }: { className: string; hours: string }) {
  return (
    <dl className={className}>
      <div>
        <dt className="cgr-micro">Hours</dt>
        <dd>{hours}</dd>
      </div>
      <div>
        <dt className="cgr-micro">Where</dt>
        <dd>Salawag, Dasmariñas</dd>
      </div>
      <div>
        <dt className="cgr-micro">Holds</dt>
        <dd>Pick a date, get a CGR code</dd>
      </div>
    </dl>
  );
}

const STRIP = [
  { d: "Thu", n: 12, booked: true },
  { d: "Fri", n: 13, booked: false },
  { d: "Sat", n: 14, booked: false },
  { d: "Sun", n: 15, booked: false },
  { d: "Mon", n: 16, booked: false },
];

function LandedSide() {
  const red = getGown("red-sequin-evening");
  const topA = getGown("blue-ball-gown");
  const topB = getGown("red-lace-corset");
  const tiara = getGown("ruby-pageant-crown");
  return (
    <div className="cgr-side">
      <div className="cgr-side-row">
        <p className="cgr-micro cgr-side-h">
          Most held this month <span>Example</span>
        </p>
        <div className="cgr-side-pair">
          {[topA, topB].map((g, i) =>
            g ? (
              <Link key={g.slug} href={`${CGR_BASE}/gown/${g.slug}`} className="cgr-side-thumb" data-cursor="link">
                <span className="ff">
                  <span className="ff-img">
                    <img
                      src={`${CGR_ASSET}/${g.images[0].file}.webp`}
                      alt=""
                      width={g.images[0].w}
                      height={g.images[0].h}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </span>
                <span className="cgr-micro">No. {String(i + 1).padStart(2, "0")}</span>
                <span className="cgr-side-name">{g.name}</span>
                <span className="cgr-price">{formatPhp(g.pricePerDay)} a day</span>
              </Link>
            ) : null,
          )}
        </div>
      </div>

      <div className="cgr-side-row">
        <p className="cgr-micro cgr-side-h">
          Next open dates <span>Example</span>
        </p>
        <ol className="cgr-strip" aria-label="Example dates for the red sequin gown, November">
          {STRIP.map((s) => (
            <li key={s.n} className={s.booked ? "is-booked" : s.n === 13 ? "is-pick" : undefined}>
              <span className="cgr-micro">{s.d}</span>
              <b>{s.n}</b>
              <span className="cgr-sr">{s.booked ? "held" : "open"}</span>
            </li>
          ))}
        </ol>
        {red ? (
          <Link className="cgr-link" href={`${CGR_BASE}/gown/${red.slug}`}>
            See open dates
          </Link>
        ) : null}
      </div>

      <div className="cgr-side-row cgr-side-acc">
        {tiara ? (
          <span className="ff ff-sq">
            <span className="ff-img">
              <img
                src={`${CGR_ASSET}/${tiara.images[0].file}.webp`}
                alt=""
                width={tiara.images[0].w}
                height={tiara.images[0].h}
                loading="lazy"
                decoding="async"
              />
            </span>
          </span>
        ) : null}
        <div>
          <p className="cgr-micro cgr-side-h">Accessories</p>
          <p className="cgr-side-name">Tiaras, crowns and crystals</p>
          <a className="cgr-link" href="#accessories">
            See accessories
          </a>
        </div>
      </div>
    </div>
  );
}
