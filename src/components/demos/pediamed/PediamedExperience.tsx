"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waitForOpenerAutoplay } from "@/lib/motion";
import { PEDIAMED_SHOTS, pediamed } from "@/lib/pediamed";

gsap.registerPlugin(ScrollTrigger);

const SHOT_SIZES =
  "(min-width: 1024px) min(544px, 42vw), calc(100vw - 2 * clamp(24px, 6vw, 96px))";

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

function Shot({
  item,
  eager,
}: {
  item: (typeof PEDIAMED_SHOTS)[number];
  eager?: boolean;
}) {
  const base = `${pediamed.asset}/${item.file}`;
  const oneX = `${pediamed.asset}/${item.file1x}`;
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${oneX}.webp 640w, ${base}.webp 1280w`}
        sizes={SHOT_SIZES}
      />
      <img
        src={`${oneX}.jpg`}
        srcSet={`${oneX}.jpg 640w, ${base}.jpg 1280w`}
        sizes={SHOT_SIZES}
        width={item.width}
        height={item.height}
        alt={item.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : undefined}
      />
    </picture>
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

      const playOpener = () => {
        if (cancelled || !animate) return;
        const fill = root.querySelector<HTMLElement>(".pm-name-fill");
        const rise = gsap.utils.toArray<HTMLElement>(
          ".pm-opener-eyebrow, .pm-opener-copy, .pm-opener-btns a, .pm-shot-frame",
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
      };

      void waitForOpenerAutoplay(120).then(playOpener);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root.querySelectorAll<HTMLElement>(".pm-shot-frame img").forEach((img) => {
          gsap.fromTo(
            img,
            { scale: 1.06 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest(".pm-shot-frame") ?? img,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            },
          );
        });

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

  const play = PEDIAMED_SHOTS[1];

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
              <p className="pm-opener-place">{pediamed.addressPlain}</p>
            </div>
            <div className="pm-opener-btns">
              <Buttons />
            </div>
          </div>
        </section>

        <section className="pm-wrap pm-rooms" aria-label="Clinic interiors">
          <div className="pm-rooms-grid">
            {PEDIAMED_SHOTS.map((item, i) => (
              <figure className="pm-shot" key={item.file}>
                <div className="pm-shot-frame">
                  <Shot item={item} eager={i === 0} />
                </div>
                <figcaption className="pm-cap">{item.caption}</figcaption>
              </figure>
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
            <figure className="pm-visit-photo">
              <div className="pm-shot-frame">
                <Shot item={play} />
              </div>
              <figcaption className="pm-cap">{play.caption}</figcaption>
            </figure>
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
                <p className="pm-eyebrow">
                  HOURS
                  <span className="pm-confirm">{pediamed.hoursConfirm}</span>
                </p>
                {pediamed.hours.map((row) => (
                  <div className="pm-hours-row" key={row.days}>
                    <span className="pm-hours-day">{row.days}</span>
                    <span>{row.time}</span>
                  </div>
                ))}
                <p className="pm-hours-note">{pediamed.hoursNote}</p>
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
