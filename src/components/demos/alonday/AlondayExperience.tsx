"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef } from "react";
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

const TREAT_CAPS = alondayImages.treat.map((item) => item.caption);

function TreatRow({
  row,
}: {
  row: (typeof alonday.treatments)[number];
}) {
  return (
    <li className="alonday-treat-row" data-treat-row={row.n}>
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

function setupStickySwaps(root: HTMLElement, instant: boolean) {
  const imgs = Array.from(
    root.querySelectorAll<HTMLImageElement>(".treat-stack img"),
  );
  const cap = root.querySelector<HTMLElement>(".treat-cap");
  if (!imgs.length || !cap) return;

  let current = 0;
  let tl: gsap.core.Timeline | undefined;

  const show = (i: number) => {
    const next = Math.max(0, Math.min(i, imgs.length - 1));
    if (next === current) return;
    current = next;

    if (instant) {
      tl?.kill();
      imgs.forEach((img, k) => {
        gsap.set(img, { opacity: k === next ? 1 : 0, scale: 1 });
      });
      cap.textContent = TREAT_CAPS[next];
      gsap.set(cap, { opacity: 1 });
      return;
    }

    tl?.kill();
    tl = gsap
      .timeline({ defaults: { ease: "power2.out" } })
      .to(
        imgs,
        { opacity: (k) => (k === next ? 1 : 0), duration: 0.5 },
        0,
      )
      .fromTo(imgs[next], { scale: 1.06 }, { scale: 1, duration: 0.9 }, 0)
      .to(cap, { opacity: 0, duration: 0.15, ease: "power1.in" }, 0)
      .call(() => {
        cap.textContent = TREAT_CAPS[next];
      }, undefined, 0.25)
      .to(cap, { opacity: 1, duration: 0.2 }, 0.25);
  };

  imgs.forEach((img, k) => {
    gsap.set(img, { opacity: k === 0 ? 1 : 0, scale: 1 });
  });
  cap.textContent = TREAT_CAPS[0];
  gsap.set(cap, { opacity: 1 });

  const triggers = ["01", "04", "07"];
  triggers.forEach((row, n) => {
    const el = root.querySelector(`[data-treat-row="${row}"]`);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 50%",
      onEnter: () => show(n),
      onLeaveBack: () => show(n - 1),
    });
  });
}

function drawTreatRows(root: HTMLElement) {
  const desktop = window.matchMedia("(min-width: 1024px)");
  ScrollTrigger.batch(".alonday-treat-row", {
    start: "top 85%",
    once: true,
    onEnter: (els) => {
      els.forEach((node, i) => {
        const el = node as HTMLElement;
        if (desktop.matches) {
          const vars = { line: 0 };
          el.style.setProperty("--line", "0");
          gsap.to(vars, {
            line: 1,
            duration: 0.8,
            ease: "power2.out",
            delay: i * 0.08,
            onUpdate: () => el.style.setProperty("--line", String(vars.line)),
          });
        } else {
          gsap.delayedCall(i * 0.08, () =>
            drawLine(el.querySelector(".alonday-line")),
          );
        }
      });
    },
  });
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
      if (!root || !ready) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        drawTreatRows(root);

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

        const plateFrame = root.querySelector<HTMLElement>(".plate-frame");
        const plateImg = root.querySelector<HTMLElement>(".plate-img");
        if (plateFrame && plateImg) {
          gsap.fromTo(
            plateImg,
            { scale: 1.04 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: plateFrame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        setupStickySwaps(root, false);

        const shopFrame = root.querySelector<HTMLElement>(
          ".alonday-frame--storefront",
        );
        const shopImg = shopFrame?.querySelector("img");
        if (shopFrame && shopImg) {
          gsap.fromTo(
            shopImg,
            { scale: 1.06 },
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

        root
          .querySelectorAll<HTMLElement>(".alonday-treat-mobile-frame")
          .forEach((frame) => {
            const img = frame.querySelector("img");
            if (!img) return;
            gsap.fromTo(
              img,
              { scale: 1.06 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: frame,
                  start: "top bottom",
                  end: "center center",
                  scrub: true,
                },
              },
            );
          });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        root.querySelectorAll<HTMLElement>(".alonday-treat-row").forEach((el) => {
          el.style.setProperty("--line", "1");
        });
        setupStickySwaps(root, true);
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [ready, reduced] },
  );

  const motion = reduced ? "static" : ready ? "ready" : "pending";
  const chair = alondayImages.treat[0];
  const desk = alondayImages.treat[2];

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

      <section className="alonday-plate" aria-label="Clinic interior">
        <div className="alonday-wrap">
          <figure className="plate">
            <div className="plate-frame">
              <AlondayPicture
                desktop={alondayImages.plate.desktop}
                desktop1x={alondayImages.plate.desktop1x}
                mobile={alondayImages.plate.mobile}
                alt={alondayImages.plate.alt}
                sizes={alondayImages.sizes.plate}
                className="plate-img"
                fetchPriority="low"
                loading="eager"
              />
            </div>
            <figcaption className="alonday-cap">
              {alondayImages.plate.caption}
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        className="alonday-section alonday-section--treat"
        aria-label="What they treat"
      >
        <div className="alonday-wrap alonday-treat-layout">
          <div className="alonday-treat-copy">
            <p className="alonday-kicker alonday-kicker--tick">
              <span className="alonday-section-tick" aria-hidden />
              What they treat
            </p>
            <ol className="alonday-treat">
              {alonday.treatments.map((row) => (
                <Fragment key={row.n}>
                  {row.n === "01" ? (
                    <li className="alonday-treat-mobile">
                      <figure>
                        <div className="alonday-treat-mobile-frame">
                          <AlondayPicture
                            src={chair.src}
                            alt={chair.alt}
                            sizes={alondayImages.sizes.sticky}
                            only="max-1023"
                            position={chair.position}
                          />
                        </div>
                        <figcaption className="alonday-cap">
                          {chair.caption}
                        </figcaption>
                      </figure>
                    </li>
                  ) : null}
                  {row.n === "07" ? (
                    <li className="alonday-treat-mobile">
                      <figure>
                        <div className="alonday-treat-mobile-frame">
                          <AlondayPicture
                            src={desk.src}
                            alt={desk.alt}
                            sizes={alondayImages.sizes.sticky}
                            only="max-1023"
                            position={desk.position}
                          />
                        </div>
                        <figcaption className="alonday-cap">
                          {desk.caption}
                        </figcaption>
                      </figure>
                    </li>
                  ) : null}
                  <TreatRow row={row} />
                </Fragment>
              ))}
            </ol>
          </div>
          <aside className="alonday-treat-sticky">
            <figure className="treat-frame">
              <div className="treat-stack alonday-treat-sticky-frame">
                {alondayImages.treat.map((item) => (
                  <div
                    key={item.group}
                    className="alonday-treat-slide"
                    data-group={item.group}
                  >
                    <AlondayPicture
                      src={item.src}
                      alt={item.alt}
                      sizes={alondayImages.sizes.sticky}
                      only="min-1024"
                      position={item.position}
                    />
                  </div>
                ))}
              </div>
              <figcaption className="treat-cap alonday-cap">
                {alondayImages.treat[0].caption}
              </figcaption>
            </figure>
          </aside>
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
            <figure className="alonday-visit-storefront">
              <div className="alonday-frame alonday-frame--storefront">
                <AlondayPicture
                  src={alondayImages.storefront.src}
                  alt={alondayImages.storefront.alt}
                  sizes={alondayImages.sizes.storefront}
                />
              </div>
              <figcaption className="alonday-cap">
                {alondayImages.storefront.caption}
              </figcaption>
            </figure>
            <div className="alonday-visit-info">
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
              <div className="alonday-visit-hours alonday-visit-block">
                <p className="alonday-kicker alonday-kicker--tick">
                  <span className="alonday-section-tick" aria-hidden />
                  Hours
                </p>
                <p className="alonday-visit-heading">{alonday.hoursHeading}</p>
                <p className="alonday-visit-body">{alonday.hoursBody}</p>
              </div>
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
