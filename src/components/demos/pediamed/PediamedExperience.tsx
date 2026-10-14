"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waitForOpenerAutoplay } from "@/lib/motion";
import { PEDIAMED_HERO, PEDIAMED_SHOTS, pediamed } from "@/lib/pediamed";

gsap.registerPlugin(ScrollTrigger);

const HERO_SIZES =
  "(min-width: 1312px) 1120px, calc(100vw - 2 * clamp(24px, 6vw, 96px))";

function Buttons() {
  return (
    <>
      <a
        className="pm-btn pm-btn-primary"
        href={pediamed.messenger}
        target="_blank"
        rel="noopener noreferrer"
      >
        {pediamed.messageLabel}
      </a>
      <a
        className="pm-btn pm-btn-secondary"
        href={pediamed.directions}
        target="_blank"
        rel="noopener noreferrer"
      >
        {pediamed.directionsLabel}
      </a>
    </>
  );
}

function Hero() {
  const base = `${pediamed.asset}/${PEDIAMED_HERO.file}`;
  const oneX = `${pediamed.asset}/${PEDIAMED_HERO.file1x}`;
  return (
    <figure className="pm-hero">
      <div className="pm-hero-frame">
        <picture>
          <source
            type="image/webp"
            srcSet={`${oneX}.webp 800w, ${base}.webp 1600w`}
            sizes={HERO_SIZES}
          />
          <img
            src={`${oneX}.jpg`}
            srcSet={`${oneX}.jpg 800w, ${base}.jpg 1600w`}
            sizes={HERO_SIZES}
            width={PEDIAMED_HERO.width}
            height={PEDIAMED_HERO.height}
            alt={PEDIAMED_HERO.alt}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </div>
      <figcaption className="pm-cap">{PEDIAMED_HERO.caption}</figcaption>
    </figure>
  );
}

function Interior({
  item,
}: {
  item: (typeof PEDIAMED_SHOTS)[number];
}) {
  const base = `${pediamed.asset}/${item.file}`;
  const oneX = `${pediamed.asset}/${item.file1x}`;
  const max = item.displayMax;
  return (
    <figure className="pm-shot">
      <div className="pm-shot-frame" style={{ maxWidth: max }}>
        <picture>
          {item.webp ? (
            <source
              type="image/webp"
              srcSet={`${oneX}.webp 640w, ${base}.webp 1280w`}
              sizes={`${max}px`}
            />
          ) : null}
          <img
            src={`${oneX}.jpg`}
            srcSet={`${oneX}.jpg 640w, ${base}.jpg 1280w`}
            sizes={`${max}px`}
            width={item.width}
            height={item.height}
            alt={item.alt}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <figcaption className="pm-cap">{item.caption}</figcaption>
    </figure>
  );
}

export function PediamedExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.setAttribute("data-pm-live", "");
    const animate = document.documentElement.classList.contains("js-anim");
    let cancelled = false;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      if (!animate) return;

      const playOpener = () => {
        if (cancelled) return;
        ctx.add(() => {
          const fill = root.querySelector<HTMLElement>(".pm-name-fill");
          const rise = gsap.utils.toArray<HTMLElement>(
            ".pm-opener-eyebrow, .pm-opener-copy, .pm-opener-btns a, .pm-hero-frame",
            root,
          );
          if (!fill) return;

          gsap.set(fill, { clipPath: "inset(100% 0 0 0)" });
          gsap.set(rise, { opacity: 0, y: 12 });

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            onComplete: () => {
              document.documentElement.classList.remove("js-anim");
            },
          });
          tl.to(
            fill,
            { clipPath: "inset(0% 0 0 0)", duration: 0.9 },
            0,
          );
          tl.to(
            rise,
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
            0.35,
          );
        });
      };

      void waitForOpenerAutoplay(120).then(playOpener);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const heroImg = root.querySelector<HTMLElement>(".pm-hero-frame img");
        if (heroImg) {
          gsap.fromTo(
            heroImg,
            { scale: 1.04 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: heroImg.closest(".pm-hero-frame") ?? heroImg,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            },
          );
        }

        gsap.utils.toArray<HTMLElement>(".pm-reveal").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 88%" },
            },
          );
        });
      });
    }, root);

    return () => {
      cancelled = true;
      document.documentElement.removeAttribute("data-pm-live");
      ctx.revert();
    };
  }, []);

  return (
    <div className="pm" ref={rootRef}>
      <p className="pm-bar">
        <span className="pm-bar-inner pm-wrap">
          <span className="pm-bar-desk">
            SAMPLE | NOT LIVE · A KantoCo sample for PediaMED. Not the
            clinic&apos;s official site.
          </span>
          <span className="pm-bar-mob">SAMPLE | NOT LIVE · KantoCo sample</span>
        </span>
      </p>

      <main>
        <section className="pm-wrap pm-opener" aria-label={pediamed.fullName}>
          <p className="pm-eyebrow pm-opener-eyebrow">
            <span className="pm-eyebrow-desk">{pediamed.kicker}</span>
            <span className="pm-eyebrow-mob">{pediamed.kickerMob}</span>
          </p>
          <h1 className="pm-name" aria-label={pediamed.fullName}>
            <span className="pm-name-ghost" aria-hidden="true">
              {pediamed.name}
            </span>
            <span className="pm-name-fill" aria-hidden="true">
              {pediamed.name}
            </span>
          </h1>
          <div className="pm-opener-row">
            <div className="pm-opener-copy">
              <p className="pm-services">{pediamed.services}</p>
              <div className="pm-opener-place">
                {pediamed.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
            <div className="pm-opener-btns">
              <Buttons />
            </div>
          </div>
          <Hero />
        </section>

        <section className="pm-wrap pm-rooms" aria-label="Clinic interiors">
          <div className="pm-rooms-grid">
            {PEDIAMED_SHOTS.map((item) => (
              <Interior item={item} key={item.file} />
            ))}
          </div>
        </section>
      </main>

      <section className="pm-visit" aria-label="Visit">
        <div className="pm-wrap">
          <p className="pm-eyebrow pm-reveal">VISIT</p>
          <h2 className="pm-visit-h pm-reveal">{pediamed.fullName}</h2>
          <div className="pm-visit-btns">
            <div className="pm-visit-btns-inner">
              <Buttons />
            </div>
          </div>
          <div className="pm-visit-split">
            <div className="pm-visit-info">
              <div className="pm-visit-block">
                <p className="pm-eyebrow">ADDRESS</p>
                <div className="pm-visit-lines">
                  {pediamed.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="pm-visit-block">
                <p className="pm-hours-label">{pediamed.hoursLabel}</p>
                {pediamed.hours.map((row) => (
                  <div className="pm-hours-row" key={row.days}>
                    <span className="pm-hours-day">{row.days}</span>
                    <span>{row.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="pm-foot">
        <div className="pm-wrap pm-foot-grid">
          <p className="pm-foot-copy">{pediamed.sampleNote}</p>
          <p className="pm-foot-copy">{pediamed.credit}</p>
          <p className="pm-foot-copy">
            <a href={pediamed.facebook} target="_blank" rel="noopener noreferrer">
              facebook.com/PediaMedPH
            </a>
            {" · "}
            <a
              href={pediamed.kantocoMessenger}
              target="_blank"
              rel="noopener noreferrer"
            >
              {pediamed.madeBy}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
