"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { waitForOpenerAutoplay } from "@/lib/motion";
import {
  PHOTOS,
  TCC_ASSET,
  TCC_BOOK,
  TCC_SERVICES,
  tcc,
  type PhotoSlot,
} from "@/lib/tooth-care-clinique";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STORE_SIZES =
  "(min-width: 768px) 402px, calc(100vw - 2 * clamp(24px, 6vw, 96px))";

function waveD(i: number) {
  const y = 18 + i * 18;
  return `M-10 ${y} C 28 ${y - 12}, 58 ${y + 12}, 88 ${y} S 148 ${y - 12}, 178 ${y} S 238 ${y + 12}, 268 ${y}`;
}

function WaveMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 90"
      fill="none"
      aria-hidden="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          className="tcc-wave-line"
          pathLength={1}
          d={waveD(i)}
        />
      ))}
    </svg>
  );
}

function SlotPicture({
  slot,
  sizes,
  eager = false,
}: {
  slot: PhotoSlot;
  sizes: string;
  eager?: boolean;
}) {
  if (!slot.ready || !slot.file) return null;
  const base = `${TCC_ASSET}/${slot.file}`;
  return (
    <picture>
      <source type="image/webp" srcSet={`${base}.webp`} sizes={sizes} />
      <img
        src={`${base}.jpg`}
        alt={slot.alt}
        width={slot.width}
        height={slot.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "low" : undefined}
      />
    </picture>
  );
}

function Confirm() {
  return <span className="tcc-confirm">{tcc.confirm}</span>;
}

function Actions({ className }: { className?: string }) {
  return (
    <div className={className ?? "tcc-cta"}>
      <a
        className="tcc-btn tcc-btn-pri"
        href={tcc.messenger}
        target="_blank"
        rel="noopener noreferrer"
      >
        {tcc.messengerLabel}
      </a>
      <a className="tcc-btn tcc-btn-sec" href={tcc.phoneTel}>
        {tcc.callLabel}
      </a>
    </div>
  );
}

export function ToothCareExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.setAttribute("data-tcc-live", "");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.remove("js-anim");
      return;
    }

    let live = true;
    waitForOpenerAutoplay(120).then(() => {
      if (!live || !rootRef.current) return;
      const node = rootRef.current;
      const lines = node.querySelectorAll(".tcc-wave-line");
      const oak = node.querySelector(".tcc-oak");
      const inner = node.querySelector(".tcc-oak-inner");
      const heart = node.querySelector(".tcc-heart");

      const tl = gsap.timeline();
      if (lines.length) {
        tl.fromTo(
          lines,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: 0.9,
            stagger: 0.09,
            ease: "power2.inOut",
          },
          0,
        );
      }
      if (oak) {
        tl.fromTo(
          oak,
          { clipPath: "inset(0 0 100% 0)" },
          { clipPath: "inset(0)", duration: 0.7, ease: "power3.out" },
          0,
        );
      }
      if (inner) {
        tl.fromTo(
          inner,
          { scale: 1.06 },
          { scale: 1, duration: 1.2, ease: "power2.out" },
          0,
        );
      }
      if (heart) {
        tl.fromTo(
          heart,
          { scale: 0 },
          { scale: 1, duration: 0.5, ease: "back.out(1.6)" },
          0.9,
        );
      }
    });

    return () => {
      live = false;
      document.documentElement.classList.remove("js-anim");
      document.documentElement.removeAttribute("data-tcc-live");
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        document.documentElement.classList.remove("js-anim");
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".tcc-reveal", root).forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
              },
            },
          );
        });

        gsap.utils
          .toArray<HTMLElement>(".tcc-book-col", root)
          .forEach((col, i) => {
            const rule = col.querySelector<HTMLElement>(".tcc-book-rule");
            const copy = col.querySelectorAll<HTMLElement>(
              ".tcc-book-n, .tcc-book-title, .tcc-book-detail",
            );
            if (rule) {
              gsap.fromTo(
                rule,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  duration: 0.8,
                  ease: "power2.out",
                  delay: i * 0.12,
                  scrollTrigger: {
                    trigger: col,
                    start: "top 85%",
                    once: true,
                  },
                },
              );
            }
            if (copy.length) {
              gsap.fromTo(
                copy,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: 0.5,
                  delay: 0.25 + i * 0.12,
                  scrollTrigger: {
                    trigger: col,
                    start: "top 85%",
                    once: true,
                  },
                },
              );
            }
          });

        gsap.utils.toArray<HTMLElement>(".tcc-zoom img", root).forEach((img) => {
          const frame = img.closest<HTMLElement>(".tcc-zoom");
          if (!frame) return;
          gsap.fromTo(
            img,
            { scale: 1.05 },
            {
              scale: 1,
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
      });

      mm.add("(max-width: 767px)", () => {
        const dock = root.querySelector<HTMLElement>(".tcc-dock");
        const openerCta = root.querySelector<HTMLElement>(".tcc-opener .tcc-cta");
        const visit = root.querySelector<HTMLElement>(".tcc-visit");
        if (!dock || !openerCta || !visit) return;

        const apply = () => {
          const ctaBox = openerCta.getBoundingClientRect();
          const visitBox = visit.getBoundingClientRect();
          const openerInView = ctaBox.bottom > 48;
          const visitInView =
            visitBox.top < window.innerHeight && visitBox.bottom > 0;
          dock.classList.toggle("is-show", !openerInView && !visitInView);
        };

        apply();
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          onUpdate: apply,
          onRefresh: apply,
        });
        return () => dock.classList.remove("is-show");
      });
    },
    { scope: rootRef },
  );

  const openerReady = PHOTOS.opener.ready;
  const insideReady = PHOTOS.inside.ready;

  return (
    <div className="tcc" ref={rootRef}>
      <p className="tcc-bar">
        <span className="tcc-bar-inner tcc-wrap">
          <span className="tcc-bar-desk">{tcc.barDesk}</span>
          <span className="tcc-bar-mob">{tcc.barMob}</span>
        </span>
      </p>

      <main>
        <section className="tcc-wrap tcc-opener" aria-label={tcc.placeName}>
          <div className="tcc-opener-grid">
            <p className="tcc-eyebrow tcc-opener-eye">{tcc.eyebrow}</p>
            <h1 className="tcc-name" aria-label={`${tcc.name} ${tcc.nameAccent}`}>
              <span className="tcc-name-line">
                <span className="tcc-name-rise">{tcc.name}</span>
              </span>
              <span className="tcc-name-line tcc-name-accent">
                <span className="tcc-name-rise">{tcc.nameAccent}</span>
              </span>
            </h1>
            <p className="tcc-chip">
              <span className="tcc-heart" aria-hidden="true" />
              {tcc.chip}
            </p>
            <p className="tcc-opener-tag">{tcc.tagline}</p>
            <Actions />
            <figure className="tcc-opener-visual">
              <div className="tcc-oak">
                <div className="tcc-oak-inner">
                  {openerReady ? (
                    <div className="tcc-zoom tcc-oak-photo">
                      <SlotPicture
                        slot={PHOTOS.opener}
                        sizes="(min-width: 768px) 448px, calc(100vw - 2 * clamp(24px, 6vw, 96px))"
                        eager
                      />
                    </div>
                  ) : (
                    <div className="tcc-oak-wave">
                      <WaveMark className="tcc-wave-svg" />
                    </div>
                  )}
                </div>
              </div>
              {openerReady ? (
                <WaveMark className="tcc-wave-float" />
              ) : null}
              {openerReady && PHOTOS.opener.caption ? (
                <figcaption className="tcc-cap">
                  {PHOTOS.opener.caption}
                </figcaption>
              ) : null}
            </figure>
          </div>
        </section>

        <section className="tcc-wrap tcc-intro" aria-label="About this page">
          <p className="tcc-reveal">{tcc.intro}</p>
        </section>

        <section className="tcc-wrap tcc-book" aria-label="How to book">
          <p className="tcc-eyebrow tcc-reveal">HOW TO BOOK</p>
          <h2 className="tcc-h2 tcc-reveal">Reserve first, then come in.</h2>
          <div className="tcc-book-grid">
            {TCC_BOOK.map((col) => (
              <div className="tcc-book-col" key={col.n}>
                <span className="tcc-book-rule" aria-hidden="true" />
                <p className="tcc-book-n">{col.n}</p>
                <p className="tcc-book-title">{col.title}</p>
                <p className="tcc-book-detail">
                  {col.n === "1" ? (
                    <>
                      <a
                        href={tcc.messenger}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {tcc.messengerHandle}
                      </a>{" "}
                      or{" "}
                      <a href={tcc.phoneTel}>{tcc.phoneIntl}</a>.
                    </>
                  ) : (
                    col.detail
                  )}{" "}
                  {col.confirm ? <Confirm /> : null}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="tcc-wrap tcc-offer" aria-label="What the clinic offers">
          <p className="tcc-eyebrow tcc-reveal">WHAT THE CLINIC OFFERS</p>
          <h2 className="tcc-h2 tcc-reveal">Three kinds of care.</h2>
          <div className="tcc-cards">
            {TCC_SERVICES.map((svc) => (
              <article className="tcc-card tcc-reveal" key={svc.title}>
                <h3 className="tcc-h3">{svc.title}</h3>
                <p>{svc.body}</p>
              </article>
            ))}
          </div>
        </section>

        {insideReady ? (
          <section className="tcc-wrap tcc-inside" aria-label="Inside">
            <div className="tcc-inside-grid">
              <figure className="tcc-inside-shot">
                <div
                  className="tcc-zoom tcc-inside-frame"
                  style={{ maxWidth: PHOTOS.inside.maxWidth }}
                >
                  <SlotPicture
                    slot={PHOTOS.inside}
                    sizes="(min-width: 768px) 370px, calc(100vw - 2 * clamp(24px, 6vw, 96px))"
                  />
                </div>
                {PHOTOS.inside.caption ? (
                  <figcaption className="tcc-cap">
                    {PHOTOS.inside.caption}
                  </figcaption>
                ) : null}
              </figure>
              <div>
                <p className="tcc-eyebrow tcc-reveal">INSIDE</p>
                <h2 className="tcc-h2 tcc-reveal">{tcc.insideH}</h2>
                <p className="tcc-inside-body tcc-reveal">{tcc.insideBody}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="tcc-visit" aria-label="Visit">
          <div className="tcc-wrap">
            <p className="tcc-eyebrow tcc-reveal">VISIT</p>
            <h2 className="tcc-h2 tcc-reveal">{tcc.visitH}</h2>
            <Actions />
            <div className="tcc-visit-grid">
              <div className="tcc-visit-block">
                <p className="tcc-eyebrow">ADDRESS</p>
                {tcc.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p>{tcc.landmark}</p>
                <p>
                  <a
                    className="tcc-link"
                    href={tcc.directions}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tcc.directionsLabel}
                  </a>
                </p>
                {PHOTOS.storefront.ready ? (
                  <figure className="tcc-store">
                    <div
                      className="tcc-zoom tcc-store-frame"
                      style={{ maxWidth: PHOTOS.storefront.maxWidth }}
                    >
                      <SlotPicture
                        slot={PHOTOS.storefront}
                        sizes={STORE_SIZES}
                      />
                    </div>
                    <figcaption className="tcc-cap">
                      {PHOTOS.storefront.caption}
                    </figcaption>
                  </figure>
                ) : null}
              </div>
              <div className="tcc-visit-block">
                <p className="tcc-eyebrow">
                  BY APPOINTMENT <Confirm />
                </p>
                {tcc.hoursVisit.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="tcc-visit-block">
                <p className="tcc-eyebrow">CONTACT</p>
                <p>
                  <a href={tcc.phoneTel}>{tcc.phoneIntl}</a>
                </p>
                <p>
                  <a
                    href={tcc.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tcc.messengerHandle}
                  </a>
                </p>
                <p>
                  <a href={tcc.emailHref}>{tcc.email}</a>
                </p>
                <p>
                  Instagram{" "}
                  <a
                    href={tcc.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tcc.instagramHandle}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="tcc-foot">
        <div className="tcc-wrap">
          <p>{tcc.sampleNote}</p>
          <p>{tcc.credit}</p>
        </div>
      </footer>

      <a
        className="tcc-dock"
        href={tcc.messenger}
        target="_blank"
        rel="noopener noreferrer"
      >
        {tcc.messengerLabel}
      </a>
    </div>
  );
}
