"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { alonday } from "@/lib/alonday";
import { alondayImages } from "@/lib/alonday-images";
import { waitForOpenerAutoplay } from "@/lib/motion";
import { DEMO_BADGE, DEMO_DISCLAIMER } from "@/lib/demos";
import { useMotionReady } from "@/components/motion/useMotionReady";
import { AlondayPicture } from "@/components/demos/alonday/AlondayPicture";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function TreatRow({
  row,
}: {
  row: (typeof alonday.treatments)[number];
}) {
  return (
    <li className="alonday-treat-row">
      <span className="alonday-treat-num">{row.n}</span>
      <div className="alonday-treat-main">
        <h2 className="alonday-treat-name alonday-line">{row.name}</h2>
      </div>
      <p className="alonday-treat-desc">{row.descriptor}</p>
    </li>
  );
}

function drawLine(el: Element | null) {
  el?.classList.add("is-drawn");
}

function playOpener(root: HTMLElement) {
  const name = root.querySelector<HTMLElement>(".alonday-name");
  const rise = gsap.utils.toArray<HTMLElement>(
    ".alonday-clinic, .alonday-promise, .alonday-place",
    root,
  );
  const buttons = gsap.utils.toArray<HTMLElement>(
    ".alonday-opener-ctas .alonday-btn",
    root,
  );
  if (!name) return;

  const vars = { draw: 0 };
  const applyVars = () => {
    name.style.setProperty("--draw", String(vars.draw));
  };
  applyVars();
  gsap.set(name, { opacity: 0.4 });
  gsap.set(rise, { opacity: 0, y: 12 });
  gsap.set(buttons, { opacity: 0, y: 12 });

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: () => {
      document.documentElement.classList.remove("js-anim");
    },
  });

  tl.to(vars, { draw: 1, duration: 0.8, onUpdate: applyVars }, 0);
  tl.to(name, { opacity: 1, duration: 0.75 }, 0.25);
  tl.to(rise, { opacity: 1, y: 0, duration: 0.3, stagger: 0.1 }, 0.8);
  tl.to(buttons, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 1.2);
}

export function AlondayExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const banner = root.querySelector<HTMLElement>(".alonday-banner");
    if (banner) {
      root.style.setProperty("--banner-h", `${banner.offsetHeight}px`);
    }

    if (reduced) {
      document.documentElement.classList.remove("js-anim");
      return;
    }

    let live = true;
    waitForOpenerAutoplay().then(() => {
      if (!live || !rootRef.current) return;
      playOpener(rootRef.current);
    });
    return () => {
      live = false;
    };
  }, [reduced]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      ScrollTrigger.batch(".alonday-treat-row .alonday-line", {
        start: "top 85%",
        once: true,
        onEnter: (els) => {
          els.forEach((el, i) => {
            gsap.delayedCall(i * 0.08, () => drawLine(el));
          });
        },
      });

      root.querySelectorAll<HTMLElement>("[data-draw]").forEach((el) => {
        const start = el.classList.contains("alonday-foot-rule")
          ? "top bottom"
          : "top 75%";
        ScrollTrigger.create({
          trigger: el,
          start,
          once: true,
          onEnter: () => drawLine(el),
        });
        if (el.getBoundingClientRect().top < window.innerHeight) {
          drawLine(el);
        }
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const plateFrame = root.querySelector<HTMLElement>(
          ".alonday-plate .alonday-frame",
        );
        const plateImg = plateFrame?.querySelector("img");
        if (plateFrame && plateImg) {
          gsap.fromTo(
            plateImg,
            { scale: 1.08 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: plateFrame,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            },
          );
        }

        root
          .querySelectorAll<HTMLElement>("[data-parallax^='treat']")
          .forEach((frame) => {
            const img = frame.querySelector("img");
            if (!img) return;
            const pair = frame.dataset.parallax === "treat-2";
            gsap.set(img, { scale: 1.08 });
            gsap.fromTo(
              img,
              { yPercent: pair ? -2 : -4 },
              {
                yPercent: pair ? 2 : 4,
                ease: "none",
                scrollTrigger: {
                  trigger: frame,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });

        const shopFrame = root.querySelector<HTMLElement>(
          ".alonday-visit-storefront .alonday-frame",
        );
        const shopImg = shopFrame?.querySelector("img");
        if (shopFrame && shopImg) {
          gsap.fromTo(
            shopImg,
            { scale: 1.04 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: shopFrame,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            },
          );
        }
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [ready, reduced] },
  );

  const motion = reduced ? "static" : ready ? "ready" : "pending";

  return (
    <div ref={rootRef} className="alonday" data-motion={motion}>
      <p className="alonday-banner">
        <span className="alonday-banner-full">
          <strong>{DEMO_BADGE}</strong>
          <span>{DEMO_DISCLAIMER}</span>
        </span>
        <span className="alonday-banner-short">
          SAMPLE | NOT LIVE · KantoCo sample, not client work
        </span>
      </p>

      <section className="alonday-opener" aria-label="Alonday Dental Clinic">
        <div className="alonday-wrap alonday-opener-copy">
          <h1 className="alonday-name alonday-line">{alonday.shortName}</h1>
          <div className="alonday-opener-below">
            <div className="alonday-opener-left">
              <p className="alonday-clinic alonday-kicker--tick">
                <span className="alonday-section-tick" aria-hidden />
                Dental Clinic
              </p>
              <p className="alonday-promise tagline">{alonday.promise}</p>
            </div>
            <div className="alonday-opener-right">
              <p className="alonday-place">{alonday.addressShort}</p>
              <div className="alonday-ctas alonday-opener-ctas">
                <a href={alonday.phoneHref} className="alonday-btn alonday-btn--fill">
                  {alonday.callLabel}
                </a>
                <a
                  href={alonday.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="alonday-btn alonday-btn--line"
                >
                  {alonday.messageLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`alonday-plate alonday-plate--${alondayImages.plate.key}`}
        aria-label="Clinic interior"
      >
        <div className="alonday-wrap">
          <AlondayPicture
            desktop={alondayImages.plate.desktop}
            mobile={alondayImages.plate.mobile}
            alt={alondayImages.plate.alt}
            sizes={alondayImages.sizes.plate}
            frameClass="alonday-frame--plate"
            parallax="plate"
          />
          {alondayImages.plate.caption ? (
            <p className="alonday-stock-cap note">{alondayImages.plate.caption}</p>
          ) : null}
        </div>
      </section>

      <section
        className="alonday-section alonday-section--treat"
        aria-label="What they treat"
      >
        <div className="alonday-wrap">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            What they treat
          </p>
          <ol className="alonday-treat">
            {alonday.treatments.slice(0, 3).map((row) => (
              <TreatRow key={row.n} row={row} />
            ))}
            <li className="alonday-treat-break alonday-treat-break--pair">
              <figure className="alonday-treat-fig alonday-treat-fig--1">
                <AlondayPicture
                  desktop={alondayImages.treat1.src}
                  mobile={alondayImages.treat1.src}
                  alt={alondayImages.treat1.alt}
                  sizes={alondayImages.sizes.treat}
                  frameClass="alonday-frame--treat alonday-frame--treat-1"
                  parallax="treat"
                />
              </figure>
              <figure className="alonday-treat-fig alonday-treat-fig--2">
                <AlondayPicture
                  desktop={alondayImages.treat2.src}
                  mobile={alondayImages.treat2.src}
                  alt={alondayImages.treat2.alt}
                  sizes={alondayImages.sizes.treat2}
                  frameClass="alonday-frame--treat alonday-frame--treat-2"
                  parallax="treat-2"
                />
                <figcaption className="alonday-stock-cap note">
                  {alondayImages.treat2.caption}
                </figcaption>
              </figure>
            </li>
            {alonday.treatments.slice(3, 6).map((row) => (
              <TreatRow key={row.n} row={row} />
            ))}
            <li className="alonday-treat-break alonday-treat-break--solo">
              <figure className="alonday-treat-fig alonday-treat-fig--3">
                <AlondayPicture
                  desktop={alondayImages.treat3.src}
                  mobile={alondayImages.treat3.src}
                  alt={alondayImages.treat3.alt}
                  sizes={alondayImages.sizes.treat}
                  frameClass="alonday-frame--treat alonday-frame--treat-3"
                  parallax="treat"
                />
              </figure>
            </li>
            {alonday.treatments.slice(6).map((row) => (
              <TreatRow key={row.n} row={row} />
            ))}
          </ol>
        </div>
      </section>

      <section
        className="alonday-section alonday-section--notes"
        aria-label="Case notes"
      >
        <div className="alonday-wrap">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            Case notes · from their Facebook
          </p>
          <div className="alonday-notes">
            {alonday.notes.map((note) => (
              <article key={note.title} className="alonday-note">
                <h2 className="alonday-note-title">“{note.title}”</h2>
                <p className="alonday-note-body">{note.body}</p>
              </article>
            ))}
          </div>
          <p className="alonday-note-attr">{alonday.notesAttribution}</p>
        </div>
      </section>

      <section className="alonday-visit" aria-label="Visit">
        <div className="alonday-wrap">
          <p className="alonday-kicker alonday-kicker--tick">
            <span className="alonday-section-tick" aria-hidden />
            Visit
          </p>
          <p className="alonday-visit-close closing-line">{alonday.visitClose}</p>
          <div className="alonday-visit-grid">
            <div className="alonday-visit-main">
              <p className="alonday-kicker">Call or message</p>
              <div className="alonday-visit-number">
                <a
                  href={alonday.phoneHref}
                  className="alonday-visit-dial alonday-line"
                  data-draw
                >
                  {alonday.phoneNbsp}
                </a>
              </div>
              <div className="alonday-ctas alonday-visit-ctas">
                <a href={alonday.phoneHref} className="alonday-btn alonday-btn--fill">
                  {alonday.callLabel}
                </a>
                <a
                  href={alonday.messenger}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="alonday-btn alonday-btn--line"
                >
                  {alonday.messageLabel}
                </a>
              </div>
            </div>
            <div className="alonday-visit-hours alonday-visit-block">
              <p className="alonday-kicker alonday-kicker--tick">
                <span className="alonday-section-tick" aria-hidden />
                Hours
              </p>
              <p className="alonday-visit-heading">{alonday.hoursHeading}</p>
              <p className="alonday-visit-body">{alonday.hoursBody}</p>
            </div>
            <div className="alonday-visit-storefront">
              <AlondayPicture
                desktop={alondayImages.storefront.desktop}
                mobile={alondayImages.storefront.mobile}
                alt={alondayImages.storefront.alt}
                sizes={alondayImages.sizes.storefront}
                frameClass="alonday-frame--storefront"
                parallax="storefront"
              />
            </div>
            <div className="alonday-visit-address alonday-visit-block">
              <p className="alonday-kicker alonday-kicker--tick">
                <span className="alonday-section-tick" aria-hidden />
                Address
              </p>
              <p className="alonday-visit-heading">{alonday.address}</p>
              <a
                href={alonday.mapsQuery}
                target="_blank"
                rel="noopener noreferrer"
                className="alonday-map-link"
              >
                Open the map
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="alonday-foot">
        <div className="alonday-wrap">
          <span
            className="alonday-foot-rule alonday-line"
            data-draw
            aria-hidden
          />
          <div className="alonday-foot-grid">
            <div className="alonday-foot-copy">
              <p>{alonday.sampleNote}</p>
              <p className="alonday-foot-credit">{alondayImages.plate.credit}</p>
            </div>
            <p className="alonday-foot-links">
              <a
                href={alonday.kantocoMessenger}
                target="_blank"
                rel="noopener noreferrer"
              >
                Message KantoCo
              </a>
              <Link href="/">Back to the agency</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
