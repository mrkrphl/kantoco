"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { waitForOpenerAutoplay } from "@/lib/motion";
import {
  PF_DOG_SIZES,
  PF_PHOTOS,
  PF_SERVICES,
  PF_SIGN_SIZES,
  pf,
} from "@/lib/pet-forum-vet";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Photo = (typeof PF_PHOTOS)[keyof typeof PF_PHOTOS];

function Pic({
  photo,
  sizes,
  eager = false,
  className,
  fetchHigh = false,
}: {
  photo: Photo;
  sizes?: string;
  eager?: boolean;
  className?: string;
  fetchHigh?: boolean;
}) {
  const base = `${pf.asset}/${photo.file}`;
  return (
    <picture>
      {photo.avif ? (
        <source type="image/avif" srcSet={`${base}.avif`} sizes={sizes} />
      ) : null}
      <source type="image/webp" srcSet={`${base}.webp`} sizes={sizes} />
      <img
        className={className}
        src={`${base}.jpg`}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={fetchHigh ? "high" : eager ? "low" : undefined}
      />
    </picture>
  );
}

function PawIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="#E4AC59" aria-hidden="true">
      <circle cx="6" cy="9" r="2.4" />
      <circle cx="10" cy="5" r="2.4" />
      <circle cx="14" cy="5" r="2.4" />
      <circle cx="18" cy="9" r="2.4" />
      <path d="M12 10c-3.5 0-6 4.8-6 7.2 0 2 1.7 2.8 3.4 2.3 1.1-.3 1.8-.6 2.6-.6s1.5.3 2.6.6c1.7.5 3.4-.3 3.4-2.3 0-2.4-2.5-7.2-6-7.2z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7A2E55"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
    </svg>
  );
}

function SyringeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7A2E55"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 20l5-5M14 4l6 6M8 12l4 4 8-8-4-4z" />
    </svg>
  );
}

function PetsIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#7A2E55"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="9" r="3.2" />
      <circle cx="16.5" cy="10.2" r="2.5" />
      <path d="M4.6 18.2c.7-2.5 2.3-3.9 4.2-3.9 1.9 0 3.3 1.3 4 3.5" />
      <path d="M13.4 18.2c.5-1.8 1.7-2.9 3.2-2.9s2.7 1.1 3.2 2.9" />
    </svg>
  );
}

function PawTrail({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="80"
      height="240"
      viewBox="0 0 80 240"
      fill="#7A2E55"
      aria-hidden="true"
    >
      {[
        [20, 20, 160],
        [50, 70, 170],
        [22, 120, 160],
        [52, 170, 170],
        [24, 220, 160],
      ].map(([x, y, r], i) => (
        <g
          className="pf-paw"
          key={i}
          transform={`translate(${x} ${y}) rotate(${r})`}
          opacity="0.22"
        >
          <ellipse cx="0" cy="6" rx="7" ry="6" />
          <circle cx="-7" cy="-4" r="3" />
          <circle cx="-2.5" cy="-8" r="3" />
          <circle cx="2.5" cy="-8" r="3" />
          <circle cx="7" cy="-4" r="3" />
        </g>
      ))}
    </svg>
  );
}

function Actions({ className }: { className?: string }) {
  return (
    <div className={className ?? "pf-ctas"}>
      <a className="pf-btn pf-btn-pri" href={pf.phoneTel}>
        {pf.callLabel}
      </a>
      <a className="pf-btn pf-btn-sec" href={pf.phoneSms}>
        {pf.textLabel}
      </a>
    </div>
  );
}

export function PetForumExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let revealed = false;
    let ctx: gsap.Context | undefined;

    const settle = () => {
      if (revealed) return;
      revealed = true;
      document.documentElement.classList.remove("js-anim");
      try {
        gsap.killTweensOf(
          root.querySelectorAll(
            ".pf-blob, .pf-sticker, .pf-paw, .pf-chip i",
          ),
        );
      } catch {
        /* still force visible below */
      }
      root.querySelectorAll<HTMLElement>(
        ".pf-name-rise, .pf-name-line, .pf-cta-anim, .pf-frame, .pf-frame img, .pf-reveal, .pf-card-in",
      ).forEach((el) => {
        el.style.transform = "none";
        el.style.opacity = "1";
        el.style.clipPath = "none";
        el.style.overflow = "visible";
      });
      root.querySelectorAll<HTMLElement>(".pf-win, .pf-win img").forEach((el) => {
        el.style.opacity = "1";
        el.style.visibility = "visible";
      });
      const sticker = root.querySelector<HTMLElement>(".pf-sticker");
      if (sticker) sticker.style.transform = "rotate(3deg)";
      const blob = root.querySelector<HTMLElement>(".pf-blob");
      if (blob) blob.style.transform = "none";
      root.querySelectorAll<HTMLElement>(".pf-paw").forEach((el) => {
        el.style.opacity = "0.22";
      });
    };

    const failsafe = window.setTimeout(settle, 2500);

    if (reduce) {
      settle();
      return () => {
        window.clearTimeout(failsafe);
      };
    }

    void waitForOpenerAutoplay(50).then(() => {
      if (cancelled || !rootRef.current || revealed) {
        settle();
        return;
      }
      const node = rootRef.current;
      try {
        document.documentElement.classList.add("js-anim");
        ctx = gsap.context(() => {
          const blob = node.querySelector(".pf-blob");
          const sticker = node.querySelector(".pf-sticker");
          const paws = gsap.utils.toArray<HTMLElement>(".pf-paw", node);
          const dot = node.querySelector(".pf-chip i");

          const tl = gsap.timeline({
            onComplete: () => {
              settle();
              ScrollTrigger.refresh();
            },
            onInterrupt: settle,
          });

          if (blob) {
            tl.fromTo(
              blob,
              { scale: 0.6, "--blob-a": 38, "--blob-b": 62 },
              {
                scale: 1,
                "--blob-a": 46,
                "--blob-b": 54,
                duration: 0.9,
                ease: "elastic.out(1, 0.6)",
                immediateRender: false,
              },
              0,
            );
          }
          if (sticker) {
            tl.fromTo(
              sticker,
              { y: -40, rotation: -8 },
              {
                y: 0,
                rotation: 3,
                duration: 0.5,
                ease: "back.out(1.7)",
                immediateRender: false,
              },
              0.8,
            );
          }
          if (paws.length) {
            tl.fromTo(
              paws.slice().reverse(),
              { opacity: 0 },
              {
                opacity: 0.22,
                duration: 0.24,
                stagger: 0.12,
                ease: "power2.out",
                immediateRender: false,
              },
              0.9,
            );
          }
          if (dot) {
            tl.fromTo(
              dot,
              { scale: 1 },
              {
                scale: 1.4,
                duration: 0.22,
                yoyo: true,
                repeat: 1,
                ease: "power1.inOut",
                immediateRender: false,
              },
              0.95,
            );
          }
        }, node);
      } catch {
        settle();
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      ctx?.revert();
      document.documentElement.classList.remove("js-anim");
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
        const belowFold = (el: HTMLElement) =>
          el.getBoundingClientRect().top >= window.innerHeight;

        gsap.utils.toArray<HTMLElement>(".pf-reveal", root).forEach((el) => {
          if (!belowFold(el)) return;
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

        const tiles = gsap.utils.toArray<HTMLElement>(".pf-card-in", root);
        tiles.forEach((el, i) => {
          if (!belowFold(el)) return;
          gsap.fromTo(
            el,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              delay: i * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
              },
            },
          );
          const ic = el.querySelector<HTMLElement>(".pf-ic");
          if (ic) {
            gsap.fromTo(
              ic,
              { rotate: -6 },
              {
                rotate: 0,
                duration: 0.5,
                delay: i * 0.1,
                ease: "power2.out",
                immediateRender: false,
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  once: true,
                },
              },
            );
          }
        });

        gsap.utils.toArray<HTMLElement>(".pf-zoom img", root).forEach((img) => {
          const frame = img.closest<HTMLElement>(".pf-zoom");
          if (!frame) return;
          gsap.fromTo(
            img,
            { scale: 1.06 },
            {
              scale: 1,
              ease: "none",
              immediateRender: false,
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
        const dock = root.querySelector<HTMLElement>(".pf-dock");
        const openerCta = root.querySelector<HTMLElement>(".pf-opener-ctas");
        const hours = root.querySelector<HTMLElement>(".pf-hours");
        if (!dock || !openerCta || !hours) return;

        const apply = () => {
          const ctaBox = openerCta.getBoundingClientRect();
          const hoursBox = hours.getBoundingClientRect();
          const openerInView = ctaBox.bottom > 48;
          const hoursReached = hoursBox.top < window.innerHeight;
          const show = !openerInView && !hoursReached;
          dock.classList.toggle("is-show", show);
          dock.toggleAttribute("inert", !show);
        };

        apply();
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          onUpdate: apply,
          onRefresh: apply,
        });
        return () => {
          dock.classList.remove("is-show");
          dock.removeAttribute("inert");
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <div className="pf" ref={rootRef}>
      <p className="pf-bar">
        <span>
          <b>SAMPLE | NOT LIVE</b>
          <span className="pf-bar-desk"> · {pf.barDesk}</span>
          <span className="pf-bar-mob"> · {pf.barMob}</span>
        </span>
      </p>

      <main>
        <section className="pf-wrap pf-opener" aria-label={pf.fullName}>
          <div>
            <p className="pf-eyebrow">
              <PawIcon />
              {pf.eyebrow}
            </p>
            <h1 className="pf-name" aria-label={pf.fullName}>
              <span className="pf-name-pair">
                <span className="pf-name-line">
                  <span className="pf-name-rise">{pf.namePet}</span>
                </span>
                <span className="pf-name-line">
                  <span className="pf-name-rise">{pf.nameForum}</span>
                </span>
              </span>
              <span className="pf-name-line pf-name-vet">
                <span className="pf-name-rise">{pf.nameSub}</span>
              </span>
            </h1>
            <div className="pf-chip-row">
              <div className="pf-chip">
                <i />
                {pf.chip}
              </div>
              <span className="pf-confirm">{pf.confirm}</span>
            </div>
            <p className="pf-tag pf-cta-anim">{pf.tagline}</p>
            <Actions className="pf-ctas pf-opener-ctas pf-cta-anim" />
            <a
              className="pf-fb pf-cta-anim"
              href={pf.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              {pf.facebookLabel}
            </a>
          </div>
          <div className="pf-photo">
            <div className="pf-blob" aria-hidden="true" />
            <PawTrail className="pf-paws" />
            <div className="pf-frame">
              <Pic
                photo={PF_PHOTOS.sign}
                sizes={PF_SIGN_SIZES}
                eager
                fetchHigh
              />
            </div>
            <div className="pf-sticker">
              <Pic photo={PF_PHOTOS.dog} sizes={PF_DOG_SIZES} eager />
              <span className="pf-pic-credit">{PF_PHOTOS.dog.caption}</span>
            </div>
          </div>
        </section>

        <section
          className="pf-wrap pf-sec pf-services"
          aria-label="What we do"
        >
          <p className="pf-eyebrow pf-reveal">{pf.servicesKicker}</p>
          <h2 className="pf-h2 pf-reveal">
            {pf.servicesH}
            <br />
            {pf.servicesH2}
          </h2>
          <p className="pf-lead pf-reveal">{pf.servicesLead}</p>
          <div className="pf-cards">
            {PF_SERVICES.map((svc) => (
              <article className="pf-card pf-card-in" key={svc.title}>
                <div className="pf-ic">
                  {svc.icon === "heart" ? <HeartIcon /> : <SyringeIcon />}
                </div>
                <h3>{svc.title}</h3>
                <p>{svc.body}</p>
              </article>
            ))}
            <article className="pf-card pf-card-in pf-card-desk">
              <div className="pf-ic">
                <PetsIcon />
              </div>
              <h3>{pf.petsTileTitle}</h3>
              <p>{pf.servicesLead}</p>
            </article>
            <article className="pf-card pf-cardph pf-card-in">
              <div className="pf-zoom">
                <Pic
                  photo={PF_PHOTOS.cat}
                  sizes="(min-width: 1024px) 280px, (min-width: 768px) 360px, calc(100vw - 2 * clamp(22px, 6vw, 96px))"
                />
              </div>
              <span className="pf-lbl">{PF_PHOTOS.cat.caption}</span>
            </article>
          </div>
        </section>

        <div className="pf-locale">
          <div className="pf-locale-grid">
        <section className="pf-wrap pf-sec pf-find-sec" aria-label="Find us">
          <div className="pf-find">
            <div className="pf-find-copy">
              <p className="pf-eyebrow pf-reveal">Find us</p>
              <h2 className="pf-h2 pf-reveal">{pf.findH}</h2>
              <p className="pf-lead pf-reveal">{pf.findBody}</p>
              <p className="pf-address">{pf.address}</p>
              <a
                className="pf-btn pf-btn-sec pf-dir"
                href={pf.directions}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pf.directionsLabel}
              </a>
            </div>
            <figure className="pf-find-visual">
              <div className="pf-win-wrap">
                <div className="pf-win pf-zoom">
                  <Pic
                    photo={PF_PHOTOS.window}
                    sizes="(min-width: 768px) 420px, calc(100vw - 2 * clamp(22px, 6vw, 96px))"
                    eager
                  />
                </div>
                <div className="pf-inset">
                  <Pic photo={PF_PHOTOS.scale} sizes="148px" />
                  <span className="pf-pic-credit">{PF_PHOTOS.scale.caption}</span>
                </div>
              </div>
              <figcaption className="pf-cap pf-win-cap">
                {PF_PHOTOS.window.caption}
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="pf-hours" aria-label="Hours and contact">
          <div className="pf-wrap">
            <div className="pf-hours-head">
              <p className="pf-eyebrow pf-reveal">Hours</p>
              <span className="pf-confirm">{pf.confirm}</span>
            </div>
            <h2 className="pf-h2 pf-reveal">{pf.hoursH}</h2>
            <div className="pf-hours-grid">
              <div className="pf-block pf-hours-block">
                {pf.hours.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p className="pf-hours-note">{pf.hoursNote}</p>
              </div>
              <div className="pf-block pf-contact-block">
                <p className="pf-eyebrow">Contact</p>
                <p>
                  Call or text{" "}
                  <a href={pf.phoneTel}>{pf.phone}</a>
                </p>
                <p>
                  <a href={pf.emailHref}>{pf.email}</a>
                </p>
                <p>
                  Facebook:{" "}
                  <a
                    href={pf.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {pf.facebookHandle}
                  </a>
                </p>
              </div>
            </div>
            <Actions className="pf-ctas pf-hours-ctas" />
          </div>
        </section>
          </div>
        </div>
      </main>

      <footer className="pf-foot">
        <div className="pf-wrap">
          <p>{pf.sampleNote}</p>
          <p>{pf.credit}</p>
        </div>
      </footer>

      <div className="pf-dock" role="group" aria-label="Call or text">
        <a href={pf.phoneTel}>Call</a>
        <a href={pf.phoneSms}>Text</a>
      </div>
    </div>
  );
}
