"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MaxiconBanner } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon } from "@/lib/maxicon";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BAY_SRC = "/demos/maxicon-car-aircon/bay-work.mp4";
const BAY_POSTER = "/demos/maxicon-car-aircon/bay-work-poster.jpg";

const SERVICES = [
  {
    n: "01",
    name: "Parts",
    line: "Compressors, condensers, fans, valves — OEM and replacement, on the same floor as the cars.",
    src: "/demos/maxicon-car-aircon/compressor.jpg",
    alt: "A Panasonic Mazda 3 compressor on the shop’s parts board.",
  },
  {
    n: "02",
    name: "Repair",
    line: "They pull the dash when a recharge would just hide the leak. Evaluation first.",
    src: "/demos/maxicon-car-aircon/dash-work.jpg",
    alt: "Dashboard pulled for evaporator work on a Toyota.",
  },
  {
    n: "03",
    name: "The bay",
    line: "President’s Avenue, BF Homes. The sign says aircon. The work is cold air.",
    src: "/demos/maxicon-car-aircon/shop-front.jpg",
    alt: "Maxicon’s open bay and sign on President’s Avenue.",
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

function ChapterBreak({
  tone,
  word,
}: {
  tone: "ice" | "bone";
  word: string;
}) {
  return (
    <section
      className={`maxicon-break maxicon-break--${tone}`}
      aria-hidden
    >
      <p className="maxicon-mono">{word}</p>
    </section>
  );
}

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLElement>(null);
  const bayRef = useRef<HTMLVideoElement>(null);
  const { ready, reduced } = useMotionReady();
  const [booted, setBooted] = useState(false);
  const [bayFailed, setBayFailed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setBooted(true), 900);
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

  useEffect(() => {
    const video = bayRef.current;
    if (!video || reduced || bayFailed) return;

    armInlinePlayback(video);
    const tryPlay = () => {
      void video.play().catch(() => {
        /* Poster stays. */
      });
    };
    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => video.removeEventListener("canplay", tryPlay);
  }, [reduced, bayFailed]);

  useGSAP(
    () => {
      const pin = pinRef.current;
      if (!pin || !ready || reduced) return;

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
        gsap.to(photos[last], { autoAlpha: 0, duration: 0.2, overwrite: true });
        gsap.to(photos[index], { autoAlpha: 1, duration: 0.2, overwrite: true });
        nums[last]?.classList.remove("is-on");
        labels[last]?.classList.remove("is-on");
        nums[index]?.classList.add("is-on");
        labels[index]?.classList.add("is-on");
        last = index;
      };

      ScrollTrigger.create({
        trigger: pin,
        start: "top top",
        end: "+=320%",
        pin: true,
        scrub: 0.35,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(
            photos.length - 1,
            Math.floor(self.progress * 0.999 * photos.length),
          );
          show(next);
        },
      });

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("resize", refresh);
      return () => window.removeEventListener("resize", refresh);
    },
    { scope: rootRef, dependencies: [ready, reduced] },
  );

  const motion = reduced ? "static" : ready ? "ready" : "pending";
  const staticBay = reduced || bayFailed;

  return (
    <div
      ref={rootRef}
      className="maxicon"
      data-motion={motion}
      data-booted={booted ? "true" : "false"}
    >
      {reduced ? null : (
        <div className="maxicon-preloader" aria-hidden>
          <p className="maxicon-preloader-name">Maxicon</p>
          <span className="maxicon-preloader-bar" />
        </div>
      )}

      <MaxiconBanner />
      <main>
        <section className="maxicon-hero" aria-label="Maxicon car aircon">
          <Image
            src="/demos/maxicon-car-aircon/cold-vent-poster.jpg"
            alt=""
            fill
            className="maxicon-hero-media"
            sizes="100vw"
            preload
          />
          <div className="maxicon-hero-veil" aria-hidden />
          <div className="maxicon-hero-copy">
            <p className="maxicon-hero-kicker">
              Car aircon · BF Homes, Parañaque
            </p>
            <h1 className="maxicon-hero-name">{maxicon.name}</h1>
            <p className="maxicon-hero-line">{maxicon.heroLine}</p>
          </div>
        </section>

        <ChapterBreak tone="ice" word="Work" />

        <section className="maxicon-rows" aria-label="What they do">
          {SERVICES.map((row) => (
            <article
              key={row.n}
              className="maxicon-row"
              data-draw
            >
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

        <ChapterBreak tone="bone" word="Process" />

        <section
          ref={pinRef}
          className="maxicon-process"
          aria-label="How a job moves"
        >
          <div className="maxicon-process-frame">
            <p className="maxicon-process-num" aria-hidden={!reduced}>
              {STEPS.map((step, i) => (
                <span key={step.n} data-step className={i === 0 ? "is-on" : undefined}>
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
                <span key={step.n} data-step className={i === 0 ? "is-on" : undefined}>
                  {step.name}
                </span>
              ))}
            </p>
          </div>
        </section>

        <ChapterBreak tone="ice" word="Cold" />

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

        <section id="visit" className="maxicon-cta" aria-label="Visit">
          <a
            href={maxicon.kantocoMessenger}
            target="_blank"
            rel="noopener noreferrer"
            className="maxicon-hero-call"
          >
            Message KantoCo
          </a>
          <a href={maxicon.phoneMobileHref} className="maxicon-cta-phone">
            {maxicon.phoneMobileDisplay}
          </a>
          <p className="maxicon-mono maxicon-cta-meta">
            45 President’s Avenue · Mon–Sat 8–5
          </p>
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
