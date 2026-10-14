"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEMO_BADGE } from "@/lib/demos";
import { waitForOpenerAutoplay } from "@/lib/motion";
import {
  FACEBOOK_MSG,
  FACEBOOK_PAGE,
  IMG,
  MAPS_URL,
  PHONE,
  PHONE_CALL_LABEL,
  PHONE_NBSP,
  PLATE_SIZES,
  SERVICES,
  SVC_CAPS,
} from "@/lib/better-details";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function LinkArrow() {
  return (
    <svg
      className="arrow"
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 6h9.5M6.5 2l4 4-4 4" />
    </svg>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "bd-chevron"}
      width="7"
      height="12"
      viewBox="0 0 7 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.5 1.5L5.5 6L1.5 10.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function Actions() {
  return (
    <div className="bd-actions">
      <a className="bd-btn bd-btn-call" href={PHONE.href}>
        <Chevron />
        {PHONE_CALL_LABEL}
      </a>
      <a
        className="bd-btn bd-btn-msg"
        href={FACEBOOK_MSG}
        target="_blank"
        rel="noopener noreferrer"
      >
        Message on Facebook
      </a>
    </div>
  );
}

function Still({
  file,
  alt,
  width,
  height,
  eager = false,
  className,
  hidden = false,
}: {
  file: string;
  alt: string;
  width: number;
  height: number;
  eager?: boolean;
  className?: string;
  hidden?: boolean;
}) {
  return (
    <picture>
      <source type="image/webp" srcSet={`${IMG}/${file}.webp`} />
      <img
        className={className}
        src={`${IMG}/${file}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        aria-hidden={hidden || undefined}
      />
    </picture>
  );
}

let openerTimeline: gsap.core.Timeline | null = null;

function settleOpener(root: HTMLElement) {
  openerTimeline?.progress(1).kill();
  openerTimeline = null;
  const wordmark = root.querySelector<HTMLElement>(".wordmark");
  wordmark?.classList.add("is-lit");
  wordmark?.classList.remove("is-sweeping");
  if (wordmark) gsap.set(wordmark, { clearProps: "opacity" });
  gsap.set(
    [
      root.querySelector(".bd-opener .bd-eyebrow"),
      root.querySelector(".bd-opener .bd-tagline"),
      root.querySelector(".bd-opener .bd-sub"),
      ...gsap.utils.toArray<HTMLElement>(".bd-opener .bd-btn", root),
    ].filter(Boolean),
    { opacity: 1, y: 0 },
  );
}

function playOpener(root: HTMLElement) {
  const wordmark = root.querySelector<HTMLElement>(".wordmark");
  const eyebrow = root.querySelector<HTMLElement>(".bd-eyebrow");
  const tagline = root.querySelector<HTMLElement>(".bd-tagline");
  const sub = root.querySelector<HTMLElement>(".bd-sub");
  const buttons = gsap.utils.toArray<HTMLElement>(".bd-opener .bd-btn", root);
  if (!wordmark) return;

  openerTimeline?.kill();
  wordmark.classList.add("is-sweeping");
  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: () => {
      wordmark.classList.add("is-lit");
      wordmark.classList.remove("is-sweeping");
      gsap.set(wordmark, { clearProps: "opacity" });
      openerTimeline = null;
    },
  });
  tl.fromTo(
    wordmark,
    { backgroundPosition: "100% 0" },
    {
      backgroundPosition: "0% 0",
      duration: 1.1,
      ease: "power2.inOut",
    },
    0,
  );
  if (eyebrow) {
    tl.fromTo(
      eyebrow,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.5 },
      0.15,
    );
  }
  tl.fromTo(
    [tagline, sub].filter(Boolean),
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
    0.7,
  );
  tl.fromTo(
    buttons,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
    1.0,
  );
  openerTimeline = tl;
}

export function BetterDetailsExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const openerPlayed = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.remove("js-anim");
      return;
    }

    if (openerPlayed.current) return;

    let live = true;
    waitForOpenerAutoplay().then(() => {
      if (!live || !rootRef.current || openerPlayed.current) return;
      openerPlayed.current = true;
      playOpener(rootRef.current);
    });

    return () => {
      live = false;
      document.documentElement.classList.remove("js-anim");
      document.documentElement.removeAttribute("data-bd-live");
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      document.documentElement.setAttribute("data-bd-live", "");

      const mm = gsap.matchMedia();
      try {
        mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 1024px)",
        },
        (context) => {
          const motion = Boolean(context.conditions?.motion);
          const reduce = Boolean(context.conditions?.reduce);
          const desktop = Boolean(context.conditions?.desktop);
          const rows = gsap.utils.toArray<HTMLElement>(".svc-row", root);
          const imgs = gsap.utils.toArray<HTMLElement>(".svc-stack img", root);
          const cap = root.querySelector<HTMLElement>(".svc-cap");
          const plate = root.querySelector<HTMLElement>(".plate");
          const plateImg = root.querySelector<HTMLElement>(".plate img");
          const svcStack = root.querySelector<HTMLElement>(".svc-stack");

          const markRow = (i: number) => {
            rows.forEach((row, k) => row.classList.toggle("is-active", k === i));
          };

          const revealFrames = (frames: HTMLElement[]) => {
            frames.forEach((frame) => {
              const img = frame.querySelector("img");
              gsap.fromTo(
                frame,
                { clipPath: "inset(0 0 100% 0)" },
                {
                  clipPath: "inset(0 0 0% 0)",
                  duration: 0.9,
                  ease: "power3.out",
                  scrollTrigger: {
                    trigger: frame,
                    start: "top 85%",
                    once: true,
                  },
                },
              );
              if (img) {
                gsap.fromTo(
                  img,
                  { scale: 1.08 },
                  {
                    scale: 1,
                    duration: 1.4,
                    ease: "power3.out",
                    scrollTrigger: {
                      trigger: frame,
                      start: "top 85%",
                      once: true,
                    },
                  },
                );
              }
            });
          };

          const revealCopy = () => {
            gsap.utils
              .toArray<HTMLElement>(".reveal-in", root)
              .filter((el) => !el.classList.contains("svc-row"))
              .forEach((el) => {
                gsap.fromTo(
                  el,
                  { opacity: 0, y: 16 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                      trigger: el,
                      start: "top 85%",
                      once: true,
                    },
                  },
                );
              });
          };

          if (reduce) {
            document.documentElement.classList.remove("js-anim");
          }

          if (motion) {
            document.documentElement.classList.add("js-anim");
            if (openerPlayed.current) {
              settleOpener(root);
            } else {
              waitForOpenerAutoplay().then(() => {
                if (!rootRef.current || openerPlayed.current) return;
                openerPlayed.current = true;
                playOpener(rootRef.current);
              });
            }

            if (desktop) {
              if (plate && plateImg) {
                gsap.fromTo(
                  plateImg,
                  { scale: 1.06, yPercent: -3 },
                  {
                    scale: 1,
                    yPercent: 3,
                    ease: "none",
                    scrollTrigger: {
                      trigger: plate,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              }

              if (svcStack) {
                gsap.to(svcStack, {
                  scale: 1.06,
                  duration: 10,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                  transformOrigin: "50% 50%",
                });
              }

              let swap: gsap.core.Timeline | undefined;
              let current = 0;
              const show = (i: number) => {
                const next = Math.max(0, Math.min(i, imgs.length - 1));
                if (next === current) return;
                current = next;
                swap?.kill();
                imgs.forEach((img, k) => {
                  img.setAttribute("aria-hidden", k === next ? "false" : "true");
                });
                swap = gsap
                  .timeline({ defaults: { ease: "power2.out" } })
                  .to(imgs, { opacity: (k) => (k === next ? 1 : 0), duration: 0.5 }, 0)
                  .to(
                    cap,
                    { opacity: 0, duration: 0.15, ease: "power1.in" },
                    0,
                  )
                  .call(
                    () => {
                      if (cap) cap.textContent = SVC_CAPS[next];
                    },
                    undefined,
                    0.25,
                  )
                  .to(cap, { opacity: 1, duration: 0.2 }, 0.25);
                markRow(next);
              };

              rows.forEach((row, i) => {
                ScrollTrigger.create({
                  trigger: row,
                  start: "top 50%",
                  onEnter: () => show(i),
                  onLeaveBack: () => show(Math.max(0, i - 1)),
                });
              });

              revealFrames(
                gsap.utils.toArray<HTMLElement>(
                  ".work-main .reveal-frame, .work-front-d .reveal-frame",
                  root,
                ),
              );
            } else {
              revealFrames(
                gsap.utils.toArray<HTMLElement>(
                  ".plate-frame, .work-main .reveal-frame, .work-front-m .reveal-frame",
                  root,
                ),
              );
              gsap.utils
                .toArray<HTMLElement>(".svc-row-media .reveal-frame img", root)
                .forEach((img) => {
                  gsap.fromTo(
                    img,
                    { scale: 1.06 },
                    {
                      scale: 1,
                      duration: 1.2,
                      ease: "power3.out",
                      scrollTrigger: {
                        trigger: img,
                        start: "top 92%",
                        once: true,
                      },
                    },
                  );
                });
            }

            revealCopy();
          }

          if (reduce && desktop) {
            let current = 0;
            const show = (i: number) => {
              const next = Math.max(0, Math.min(i, imgs.length - 1));
              if (next === current) return;
              current = next;
              gsap.set(imgs, { opacity: (k) => (k === next ? 1 : 0) });
              imgs.forEach((img, k) => {
                img.setAttribute("aria-hidden", k === next ? "false" : "true");
              });
              if (cap) {
                cap.textContent = SVC_CAPS[next];
                gsap.set(cap, { opacity: 1 });
              }
              if (svcStack) gsap.set(svcStack, { scale: 1 });
              markRow(next);
            };
            rows.forEach((row, i) => {
              ScrollTrigger.create({
                trigger: row,
                start: "top 50%",
                onEnter: () => show(i),
                onLeaveBack: () => show(Math.max(0, i - 1)),
              });
            });
          }
        },
      );
      } catch {
        document.documentElement.classList.remove("js-anim");
      }
    },
    { scope: rootRef },
  );

  return (
    <div className="bd" ref={rootRef}>
      <div className="bd-bar">
        <div className="bd-bar-inner">
          <span className="bd-bar-full">
            {DEMO_BADGE} · KantoCo sample, not the shop&apos;s site
          </span>
          <span className="bd-bar-short">{DEMO_BADGE} · KantoCo sample</span>
        </div>
      </div>

      <section className="bd-opener">
        <div className="bd-wrap">
          <div className="bd-eyebrow">
            <p className="bd-eyebrow-services">
              Paint protection film · Ceramic coating · Window tint
            </p>
            <p className="bd-eyebrow-place">Don Bosco, Parañaque</p>
          </div>
          <h1 className="wordmark" aria-label="Better Details">
            <span>Better</span>
            <span>Details</span>
          </h1>
          <div className="bd-intro">
            <div className="bd-copy">
              <p className="bd-tagline">Correct, protect, maintain.</p>
              <p className="bd-sub">
                Paint protection film, ceramic coating and window tint, done in
                their bay on Michael Rua St.
              </p>
            </div>
            <Actions />
          </div>
        </div>
      </section>

      <section className="bd-plate-sec">
        <div className="bd-wrap">
          <figure className="plate">
            <div className="plate-frame">
              <picture>
                <source
                  media="(max-width: 1023px)"
                  type="image/webp"
                  srcSet={`${IMG}/plate-mobile-4x5.webp`}
                />
                <source
                  media="(max-width: 1023px)"
                  type="image/jpeg"
                  srcSet={`${IMG}/plate-mobile-4x5.jpg`}
                />
                <source
                  type="image/webp"
                  srcSet={`${IMG}/plate-16x9-1x.webp 1120w, ${IMG}/plate-16x9.webp 1536w`}
                  sizes={PLATE_SIZES}
                />
                <source
                  type="image/jpeg"
                  srcSet={`${IMG}/plate-16x9-1x.jpg 1120w, ${IMG}/plate-16x9.jpg 1536w`}
                  sizes={PLATE_SIZES}
                />
                <img
                  src={`${IMG}/plate-16x9-1x.jpg`}
                  alt="The Better Details bay: a white wall with their red chevron sign, bright ceiling panels, a lift and a yellow scooter."
                  width={1120}
                  height={630}
                  sizes={PLATE_SIZES}
                  loading="eager"
                  decoding="async"
                  fetchPriority="low"
                />
              </picture>
            </div>
            <figcaption className="bd-cap">
              <span className="bd-cap-d">
                Their bay, Michael Rua St., Don Bosco
              </span>
              <span className="bd-cap-m">Their bay, Don Bosco</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bd-svc">
        <div className="bd-wrap">
          <p className="bd-kicker reveal-in">What they do</p>
          <h2 className="bd-display reveal-in">PPF · Ceramic · Tint</h2>
          <div className="svc-grid">
            <div className="svc-rows">
              {SERVICES.map((svc, i) => (
                <article
                  key={svc.file}
                  className={`svc-row reveal-in${i === 0 ? " is-active" : ""}`}
                >
                  <div className="svc-row-media">
                    <div className="svc-row-frame reveal-frame">
                      <Still
                        file={svc.file}
                        alt={svc.alt}
                        width={896}
                        height={1120}
                      />
                    </div>
                    <p className="bd-cap">{svc.cap}</p>
                  </div>
                  <div className="svc-row-text">
                    <span className="svc-num">
                      <Chevron className="svc-chevron" />
                      {svc.num}
                    </span>
                    <div>
                      <h3 className="svc-name">{svc.name}</h3>
                      <p className="svc-line">{svc.line}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <figure className="svc-sticky">
              <div className="svc-frame">
                <div className="svc-stack">
                  {SERVICES.map((svc, i) => (
                    <Still
                      key={svc.file}
                      file={svc.file}
                      alt={svc.alt}
                      width={896}
                      height={1120}
                      eager={i === 0}
                      hidden={i !== 0}
                    />
                  ))}
                </div>
              </div>
              <figcaption className="svc-cap" aria-live="polite">
                {SVC_CAPS[0]}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="bd-work work">
        <div className="bd-wrap">
          <p className="bd-kicker reveal-in">Finished in the bay</p>
          <h2 className="bd-work-head reveal-in">From one of their posts</h2>
          <div className="work-grid">
            <figure className="work-main">
              <div className="work-frame work-frame-sq reveal-frame">
                <Still
                  file="work-1-macan-hood-1x1"
                  alt="Close-up of a dark grey Porsche Macan's hood and headlight, reflecting the bay's ceiling lights."
                  width={1280}
                  height={1280}
                />
              </div>
              <figcaption className="bd-cap">
                Their work: Porsche Macan, hood and headlight
              </figcaption>
            </figure>
            <figure className="work-front-m">
              <div className="work-frame work-frame-m reveal-frame">
                <Still
                  file="work-2-macan-front-4x5"
                  alt="Front of a dark grey Porsche Macan on a checkered tile floor in the bay."
                  width={768}
                  height={960}
                />
              </div>
              <figcaption className="bd-cap">
                Their work: Porsche Macan, front
              </figcaption>
            </figure>
            <div className="work-side">
              <figure className="work-front-d">
                <div className="work-frame work-frame-front reveal-frame">
                  <Still
                    file="work-2-macan-front-1x1"
                    alt="Front of a dark grey Porsche Macan on a checkered tile floor in the bay."
                    width={896}
                    height={896}
                  />
                </div>
                <figcaption className="bd-cap">
                  Their work: Porsche Macan, front
                </figcaption>
              </figure>
              <div className="work-side-foot">
                <p className="work-note">
                  Both shots come from the same post on their Facebook page.
                </p>
                <a
                  className="link-arrow"
                  href={FACEBOOK_PAGE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  See more on Facebook
                  <LinkArrow />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bd-visit">
        <div className="bd-wrap">
          <p className="bd-kicker reveal-in">Visit</p>
          <p className="bd-visit-lead reveal-in">
            Book through Messenger, or call ahead.
          </p>
          <div className="bd-visit-call reveal-in">
            <p className="bd-kicker">Call or message</p>
            <a className="bd-phone" href={PHONE.href}>
              {PHONE_NBSP}
            </a>
            <Actions />
          </div>
          <div className="bd-visit-meta reveal-in">
            <div className="bd-visit-block">
              <p className="bd-kicker">Address</p>
              <p>19 Michael Rua St.</p>
              <p>Brgy. Don Bosco, Parañaque&nbsp;1711</p>
            </div>
            <div className="bd-visit-block">
              <p className="bd-kicker">Hours</p>
              <p>Monday to Saturday</p>
              <p>9&nbsp;am to 6&nbsp;pm</p>
              <p>Sunday closed</p>
            </div>
            <div className="bd-visit-block">
              <p className="bd-kicker">Map</p>
              <p>
                <a
                  className="link-arrow"
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                  <LinkArrow />
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bd-footer">
        <div className="bd-wrap">
          <p>
            Photos: Better Details (facebook.com/BetterDetails), used for this
            private sample only. This is a KantoCo sample, not the shop&apos;s
            website, and it takes no bookings.
          </p>
        </div>
      </footer>
    </div>
  );
}
