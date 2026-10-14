"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waitForOpenerAutoplay } from "@/lib/motion";
import {
  PEDIAMED_KNOW,
  PEDIAMED_SHOTS,
  PEDIAMED_TILES,
  pediamed,
} from "@/lib/pediamed";

gsap.registerPlugin(ScrollTrigger);

const SHOT_SIZES = "(min-width: 768px) 486px, calc(100vw - 2 * clamp(24px, 6vw, 96px))";

function Buttons() {
  return (
    <>
      <a className="pm-btn pm-btn-primary" href={pediamed.phoneTel}>
        {pediamed.callLabel}
      </a>
      <a
        className="pm-btn pm-btn-secondary"
        href={pediamed.messenger}
        target="_blank"
        rel="noopener noreferrer"
      >
        {pediamed.messageLabel}
      </a>
    </>
  );
}

function Shot({ item }: { item: (typeof PEDIAMED_SHOTS)[number] }) {
  const base = `${pediamed.asset}/${item.file}`;
  return (
    <figure className="pm-shot">
      <div className="pm-shot-frame">
        <picture>
          <source
            type="image/webp"
            srcSet={`${base}.webp ${item.width}w`}
            sizes={SHOT_SIZES}
          />
          <img
            src={`${base}.jpg`}
            srcSet={`${base}.jpg ${item.width}w`}
            sizes={SHOT_SIZES}
            width={item.width}
            height={item.height}
            alt={item.alt}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <figcaption className="pm-cap">{item.caption}</figcaption>
      <h3 className="pm-shot-h">{item.heading}</h3>
      <p className="pm-shot-body">{item.body}</p>
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
          const tiles = gsap.utils.toArray<HTMLElement>(".pm-tile", root);
          const names = gsap.utils.toArray<HTMLElement>(".pm-name-rise", root);
          const rise = gsap.utils.toArray<HTMLElement>(
            ".pm-opener-eyebrow, .pm-opener-copy, .pm-opener-btns a",
            root,
          );
          if (!tiles.length || !names.length) return;

          gsap.set(tiles, { opacity: 0, scale: 0.6, rotate: -6 });
          gsap.set(names, { yPercent: 105 });
          gsap.set(rise, { opacity: 0, y: 12 });

          const tl = gsap.timeline({
            onComplete: () => {
              document.documentElement.classList.remove("js-anim");
              ScrollTrigger.refresh();
            },
          });
          tl.to(
            tiles,
            {
              opacity: 1,
              scale: 1,
              rotate: 0,
              duration: 0.25,
              stagger: 0.07,
              ease: "back.out(1.4)",
            },
            0,
          );
          tl.to(
            names,
            {
              yPercent: 0,
              duration: 0.53,
              stagger: 0.12,
              ease: "power3.out",
            },
            0.35,
          );
          tl.to(
            rise,
            {
              opacity: 1,
              y: 0,
              duration: 0.29,
              stagger: 0.07,
              ease: "power2.out",
            },
            0.9,
          );
        });
      };

      const bindScroll = () => {
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.utils.toArray<HTMLElement>(".pm-reveal").forEach((el) => {
            gsap.fromTo(
              el,
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                scrollTrigger: { trigger: el, start: "top 85%" },
              },
            );
          });

          gsap.utils.toArray<HTMLElement>(".pm-know-row").forEach((row) => {
            const marker = row.querySelector<HTMLElement>(".pm-marker");
            if (marker) {
              gsap.fromTo(
                marker,
                { scale: 0 },
                {
                  scale: 1,
                  duration: 0.4,
                  ease: "back.out(1.4)",
                  scrollTrigger: { trigger: row, start: "top 88%" },
                },
              );
            }
            gsap.fromTo(
              row,
              { "--line": 0 },
              {
                "--line": 1,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: { trigger: row, start: "top 88%" },
              },
            );
          });

          const visitH = root.querySelector<HTMLElement>(".pm-visit-h");
          if (visitH) {
            gsap.fromTo(
              visitH,
              { yPercent: 105 },
              {
                yPercent: 0,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: { trigger: visitH, start: "top 88%" },
              },
            );
          }
        });
      };

      void waitForOpenerAutoplay(120).then(() => {
        playOpener();
        bindScroll();
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
            SAMPLE | NOT LIVE · A KantoCo sample page for PediaMed
            Children&apos;s Clinic. Not the clinic&apos;s official site.
          </span>
          <span className="pm-bar-mob">SAMPLE | NOT LIVE</span>
        </span>
      </p>

      <main>
        <section className="pm-wrap pm-opener" aria-label={pediamed.fullName}>
          <div className="pm-opener-grid">
            <div className="pm-mat" aria-hidden="true">
              {PEDIAMED_TILES.map((tone, i) => (
                <span className="pm-tile" data-t={tone} key={`${tone}-${i}`} />
              ))}
            </div>
            <div className="pm-opener-main">
              <p className="pm-eyebrow pm-opener-eyebrow">
                <span className="pm-eyebrow-desk">{pediamed.kicker}</span>
                <span className="pm-eyebrow-mob">{pediamed.kickerMob}</span>
              </p>
              <h1 className="pm-name" aria-label={pediamed.fullName}>
                <span className="pm-name-line">
                  <span className="pm-name-rise">{pediamed.name}</span>
                </span>
                <span className="pm-name-line pm-name-sub">
                  <span className="pm-name-rise">{pediamed.nameSub}</span>
                </span>
              </h1>
              <div className="pm-opener-copy">
                <p className="pm-services">{pediamed.services}</p>
                <div className="pm-opener-place">
                  {pediamed.addressLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <p>{pediamed.comeLine}</p>
                </div>
              </div>
              <div className="pm-opener-btns">
                <Buttons />
              </div>
            </div>
          </div>
        </section>

        <section className="pm-wrap pm-intro" aria-label="About this page">
          <p className="pm-reveal">{pediamed.intro}</p>
        </section>

        <section className="pm-wrap pm-rooms" aria-label="Inside the clinic">
          <p className="pm-eyebrow pm-reveal">INSIDE THE CLINIC</p>
          <h2 className="pm-h2 pm-reveal">Bright, quiet rooms.</h2>
          <div className="pm-rooms-grid">
            {PEDIAMED_SHOTS.map((item) => (
              <Shot item={item} key={item.file} />
            ))}
          </div>
        </section>

        <section className="pm-wrap pm-know" aria-label="Before you come">
          <p className="pm-eyebrow pm-reveal">BEFORE YOU COME</p>
          <h2 className="pm-h2 pm-reveal">Three things to know.</h2>
          <ol className="pm-know-list">
            <li className="pm-know-row">
              <span className="pm-marker" data-t="red" aria-hidden="true" />
              <p className="pm-know-title">{PEDIAMED_KNOW[0].title}</p>
              <p className="pm-know-detail">
                Mobile{" "}
                <a href={pediamed.phoneTel}>{pediamed.phone}</a>.
              </p>
            </li>
            <li className="pm-know-row">
              <span className="pm-marker" data-t="green" aria-hidden="true" />
              <p className="pm-know-title">{PEDIAMED_KNOW[1].title}</p>
              <p className="pm-know-detail">
                Send a message to{" "}
                <a
                  href={pediamed.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {pediamed.facebookHandle}
                </a>
                , or email{" "}
                <a href={pediamed.emailHref}>{pediamed.email}</a>.
              </p>
            </li>
            <li className="pm-know-row">
              <span className="pm-marker" data-t="yellow" aria-hidden="true" />
              <p className="pm-know-title">{PEDIAMED_KNOW[2].title}</p>
              <p className="pm-know-detail">{PEDIAMED_KNOW[2].detail}</p>
            </li>
          </ol>
        </section>

      <section className="pm-visit" aria-label="Visit">
        <div className="pm-wrap">
          <p className="pm-eyebrow pm-reveal">VISIT</p>
          <div className="pm-visit-h-mask">
            <h2 className="pm-visit-h">{pediamed.visitH}</h2>
          </div>
          <div className="pm-visit-btns">
            <Buttons />
          </div>
          <div className="pm-visit-split">
            <div className="pm-visit-block">
              <p className="pm-eyebrow">ADDRESS</p>
              <div className="pm-visit-lines">
                {pediamed.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <p className="pm-visit-lines">
                <a
                  href={pediamed.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {pediamed.directionsLabel}
                </a>
              </p>
            </div>
            <div className="pm-visit-block">
              <p className="pm-eyebrow">PHONE</p>
              <div className="pm-visit-lines">
                <p>
                  <a href={pediamed.phoneTel}>Mobile {pediamed.phone}</a>
                </p>
              </div>
            </div>
            <div className="pm-visit-block">
              <p className="pm-eyebrow">FACEBOOK · EMAIL</p>
              <div className="pm-visit-lines">
                <p>
                  <a
                    href={pediamed.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pediamed.facebookHandle}
                  </a>
                </p>
                <p>
                  <a href={pediamed.emailHref}>{pediamed.email}</a>
                </p>
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
      </section>
      </main>

      <footer className="pm-foot">
        <div className="pm-wrap">
          <p className="pm-foot-copy">{pediamed.sampleNote}</p>
          <p className="pm-foot-copy">{pediamed.credit}</p>
          <p className="pm-foot-copy">
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
