"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { maxicon } from "@/lib/maxicon";
import { DEMO_BADGE } from "@/lib/demos";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const VENT_SRC = "/demos/maxicon-car-aircon/cold-vent.mp4";
const VENT_POSTER = "/demos/maxicon-car-aircon/cold-vent-poster.jpg";
const BAY_SRC = "/demos/maxicon-car-aircon/bay-work.mp4";
const BAY_POSTER = "/demos/maxicon-car-aircon/bay-work-poster.jpg";

const SERVICES = [
  {
    n: "01",
    name: "Repair",
    line: "They pull the dash when a recharge would just hide the leak. Evaluation first.",
    src: "/demos/maxicon-car-aircon/dash-work.jpg",
    alt: "Dashboard pulled for evaporator work on a Toyota.",
  },
  {
    n: "02",
    name: "Cleaning",
    line: "System evaluation, cleaning, and maintenance — the bay work, not a spray and a hope.",
    src: "/demos/maxicon-car-aircon/maxicon-bay.jpg",
    alt: "A technician in a Maxicon shirt working under the open hood of a Toyota.",
  },
  {
    n: "03",
    name: "Parts",
    line: "Compressors, condensers, fans, valves — OEM and replacement, on the same floor as the cars.",
    src: "/demos/maxicon-car-aircon/compressor.jpg",
    alt: "A Panasonic Mazda 3 compressor on the shop’s parts board.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    name: "Diagnose",
    src: "/demos/maxicon-car-aircon/dash-work.jpg",
    alt: "Cabin opened so the system can be read before anyone charges it.",
  },
  {
    n: "02",
    name: "Evacuate & leak-test",
    src: "/demos/maxicon-car-aircon/frosted-condenser.jpg",
    alt: "A frosted condenser — the system has to hold before it gets filled.",
  },
  {
    n: "03",
    name: "Repair",
    src: "/demos/maxicon-car-aircon/maxicon-bay.jpg",
    alt: "A technician in a Maxicon shirt working under an open hood.",
  },
  {
    n: "04",
    name: "Recharge",
    src: "/demos/maxicon-car-aircon/cold-vent-poster.jpg",
    alt: "Cold vapor at a cabin vent after the system is closed.",
  },
] as const;

function armInlinePlayback(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
}

function useLoopingVideo(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    armInlinePlayback(video);
    const tryPlay = () => {
      void video.play().catch(() => {
        /* Poster stays. Do not fight autoplay. */
      });
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => video.removeEventListener("canplay", tryPlay);
  }, [enabled, videoRef]);
}

function ChapterWipe({
  tone,
  word,
}: {
  tone: "ice" | "bone" | "dark";
  word: string;
}) {
  return (
    <section
      className={`maxicon-wipe maxicon-wipe--${tone}`}
      data-wipe
      aria-hidden
    >
      <p className="maxicon-mono">{word}</p>
    </section>
  );
}

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);
  const ventRef = useRef<HTMLVideoElement>(null);
  const bayRef = useRef<HTMLVideoElement>(null);
  const { ready, reduced } = useMotionReady();
  const [booted, setBooted] = useState(false);
  const [ventFailed, setVentFailed] = useState(false);
  const [bayFailed, setBayFailed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setBooted(true), 780);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-draw]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.28, rootMargin: "0px 0px -8% 0px" },
    );

    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [reduced, booted]);

  const staticVent = reduced || ventFailed;
  const staticBay = reduced || bayFailed;

  useLoopingVideo(ventRef, !staticVent);
  useLoopingVideo(bayRef, !staticBay);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = pinRef.current;
      const motionOn = ready || booted;
      if (!root || !motionOn || reduced) return;

      gsap.utils.toArray<HTMLElement>("[data-wipe]", root).forEach((wipe) => {
        gsap.fromTo(
          wipe,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: wipe,
              start: "top bottom",
              end: "top top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      if (!pin) return;

      const photos = gsap.utils.toArray<HTMLElement>(
        ".maxicon-process-photo",
        pin,
      );
      const nums = gsap.utils.toArray<HTMLElement>(
        ".maxicon-process-num [data-step]",
        pin,
      );
      const labels = gsap.utils.toArray<HTMLElement>(
        ".maxicon-process-copy [data-step]",
        pin,
      );
      if (photos.length < 2) return;

      gsap.set(photos, { autoAlpha: 0 });
      gsap.set(photos[0], { autoAlpha: 1 });
      nums[0]?.classList.add("is-on");
      labels[0]?.classList.add("is-on");

      let last = 0;
      const show = (index: number) => {
        if (index === last) return;
        gsap.to(photos[last], { autoAlpha: 0, duration: 0.18, overwrite: true });
        gsap.to(photos[index], { autoAlpha: 1, duration: 0.18, overwrite: true });
        nums[last]?.classList.remove("is-on");
        labels[last]?.classList.remove("is-on");
        nums[index]?.classList.add("is-on");
        labels[index]?.classList.add("is-on");
        pin.setAttribute("data-active-step", String(index + 1).padStart(2, "0"));
        last = index;
      };

      const stick = (active: boolean) => {
        pin.classList.toggle("is-pinned", active);
        if (active) gsap.set(pin, { x: 0, y: 0 });
      };

      ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: "+=300%",
        pin: true,
        pinSpacing: true,
        pinType: "fixed",
        pinReparent: true,
        invalidateOnRefresh: true,
        onToggle: (self) => stick(self.isActive),
        onUpdate: (self) => {
          stick(self.isActive);
          const next = Math.min(
            photos.length - 1,
            Math.floor(self.progress * 0.999 * photos.length),
          );
          show(next);
        },
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("resize", refresh);
      window.addEventListener("load", refresh);
      return () => {
        window.removeEventListener("resize", refresh);
        window.removeEventListener("load", refresh);
      };
    },
    { scope: rootRef, dependencies: [ready, reduced, booted] },
  );

  useEffect(() => {
    if (!booted || reduced) return;
    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(id);
  }, [booted, reduced]);

  const motion = reduced ? "static" : ready ? "ready" : "pending";

  return (
    <div
      ref={rootRef}
      className="maxicon"
      data-motion={motion}
      data-booted={reduced || booted ? "true" : "false"}
    >
      {reduced ? null : (
        <div className="maxicon-preloader" aria-hidden>
          <p className="maxicon-preloader-name">Maxicon</p>
          <span className="maxicon-preloader-bar" />
        </div>
      )}

      <main>
        <section className="maxicon-hero" aria-label="Maxicon car aircon">
          {staticVent ? (
            <Image
              src={VENT_POSTER}
              alt=""
              fill
              className="maxicon-hero-media"
              sizes="100vw"
              preload
            />
          ) : (
            <video
              ref={ventRef}
              className="maxicon-hero-media"
              muted
              playsInline
              loop
              autoPlay
              preload="auto"
              poster={VENT_POSTER}
              disablePictureInPicture
              controls={false}
              tabIndex={-1}
              aria-hidden
              onError={() => setVentFailed(true)}
              {...{ "webkit-playsinline": "true" }}
            >
              <source src={VENT_SRC} type="video/mp4" />
            </video>
          )}
          <div className="maxicon-hero-veil" aria-hidden />
          <div className="maxicon-hero-copy">
            <p className="maxicon-hero-eye">
              {DEMO_BADGE} · Car aircon specialist
            </p>
            <h1 className="maxicon-hero-name">{maxicon.name}</h1>
            <p className="maxicon-hero-line">Hina na sa traffic? Weak A/C.</p>
            <a
              href={maxicon.kantocoMessenger}
              target="_blank"
              rel="noopener noreferrer"
              className="maxicon-hero-cta"
            >
              Message KantoCo
            </a>
            <a href={maxicon.phoneMobileHref} className="maxicon-hero-phone">
              {maxicon.phoneMobileDisplay}
            </a>
            <p className="maxicon-hero-meta">
              45 President’s Avenue · Mon–Sat 8–5
            </p>
          </div>
        </section>

        <ChapterWipe tone="ice" word="Work" />

        <section className="maxicon-rows" aria-label="What they do">
          {SERVICES.map((row) => (
            <article key={row.n} className="maxicon-row" data-draw>
              <div className="maxicon-row-photo">
                <Image
                  src={row.src}
                  alt={row.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 900px) 52vw, 100vw"
                />
              </div>
              <div className="maxicon-row-copy">
                <p className="maxicon-row-name">
                  <span className="maxicon-mono">{row.n}</span>
                  <span aria-hidden> — </span>
                  {row.name}
                </p>
                <p className="maxicon-lede">{row.line}</p>
              </div>
            </article>
          ))}
        </section>

        <ChapterWipe tone="bone" word="Process" />

        <section
          ref={pinRef}
          className="maxicon-process"
          aria-label="How a job moves"
          data-active-step="01"
        >
          <div className="maxicon-process-frame">
            <p className="maxicon-process-num" aria-hidden={!reduced}>
                {STEPS.map((step, i) => (
                  <span
                    key={step.n}
                    data-step
                    className={i === 0 ? "is-on" : undefined}
                  >
                    {step.n}
                  </span>
                ))}
              </p>
              <div className="maxicon-process-stage">
                {STEPS.map((step) => (
                  <div key={step.n} className="maxicon-process-photo">
                    <Image
                      src={step.src}
                      alt={step.alt}
                      fill
                      className="object-cover"
                      sizes="(min-width: 900px) 46vw, 100vw"
                    />
                  </div>
                ))}
              </div>
              <p className="maxicon-process-copy" aria-live="polite">
                {STEPS.map((step, i) => (
                  <span
                    key={step.n}
                    data-step
                    className={i === 0 ? "is-on" : undefined}
                  >
                    {step.name}
                  </span>
                ))}
              </p>
            </div>
        </section>

        <ChapterWipe tone="ice" word="Cold" />

        <section className="maxicon-statement" aria-label="The product">
          <p>
            The product is <em>cold</em>.
          </p>
        </section>

        <section className="maxicon-proof" aria-label="Bay clip">
          <figure className="maxicon-reel">
            <div className="maxicon-reel-frame">
              {staticBay ? (
                <Image
                  src={BAY_POSTER}
                  alt="Generated sample of bay work. Not shop footage."
                  fill
                  className="object-cover"
                  sizes="(min-width: 900px) 56rem, 100vw"
                />
              ) : (
                <video
                  ref={bayRef}
                  className="maxicon-reel-video"
                  muted
                  playsInline
                  loop
                  autoPlay
                  preload="metadata"
                  poster={BAY_POSTER}
                  disablePictureInPicture
                  controls={false}
                  onError={() => setBayFailed(true)}
                  {...{ "webkit-playsinline": "true" }}
                >
                  <source src={BAY_SRC} type="video/mp4" />
                </video>
              )}
            </div>
            <figcaption>
              Bay work as a contained clip — generated sample, not shop
              footage, and not scrubbed by scroll.
            </figcaption>
          </figure>
        </section>

        <p className="maxicon-note maxicon-foot">
          {maxicon.sampleNote}{" "}
          <a
            href={maxicon.kantocoMessenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message KantoCo
          </a>
          .
          <span className="maxicon-foot-back">
            <Link href="/">Back to the agency</Link>
          </span>
        </p>
      </main>
    </div>
  );
}
