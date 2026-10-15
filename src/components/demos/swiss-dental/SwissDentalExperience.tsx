"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { waitForOpenerAutoplay } from "@/lib/motion";
import {
  IMG,
  PHOTOS,
  PLATE_SIZES,
  SWISS,
} from "@/lib/swiss-dental";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Actions({ landline = false }: { landline?: boolean }) {
  return (
    <div className="sd-cta">
      <a className="sd-btn sd-btn-pri" href={SWISS.mobileTel}>
        Call {SWISS.mobile}
      </a>
      <a
        className="sd-btn sd-btn-sec"
        href={SWISS.messenger}
        target="_blank"
        rel="noopener noreferrer"
      >
        Message on Facebook
      </a>
      {landline ? (
        <p className="sd-landline">
          Landline{" "}
          <a href={SWISS.landlineTel}>{SWISS.landline}</a>
        </p>
      ) : null}
    </div>
  );
}

const readySlots = PHOTOS.facebookLater.filter((slot) => slot.ready);

export function SwissDentalExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.setAttribute("data-sd-live", "");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.remove("js-anim");
      return;
    }

    let live = true;
    waitForOpenerAutoplay(120).then(() => {
      if (!live || !rootRef.current) return;
      const node = rootRef.current;
      const tl = gsap.timeline();
      tl.fromTo(
        node.querySelector(".sd-cross"),
        { clipPath: "inset(50% 50% 50% 50%)" },
        { clipPath: "inset(0%)", duration: 0.35, ease: "power3.out" },
        0,
      )
        .fromTo(
          node.querySelector(".sd-cross-h"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.35, ease: "power2.out" },
          0.25,
        )
        .fromTo(
          node.querySelector(".sd-cross-v"),
          { scaleY: 0 },
          { scaleY: 1, duration: 0.35, ease: "power2.out" },
          0.45,
        )
        .fromTo(
          [
            node.querySelector(".sd-l1 > span"),
            node.querySelector(".sd-word > span"),
          ].filter(Boolean),
          { yPercent: 105, y: 0 },
          {
            yPercent: 0,
            y: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: "power3.out",
          },
          0.5,
        )
        .fromTo(
          [
            node.querySelector(".sd-eyebrow"),
            node.querySelector(".sd-doctor"),
            node.querySelector(".sd-tagline"),
          ].filter(Boolean),
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: "power2.out" },
          1,
        )
        .fromTo(
          node.querySelector(".sd-opener .sd-cta"),
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
          1.2,
        )
        .fromTo(
          node.querySelector(".sd-plate-frame"),
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: "power2.out" },
          1.35,
        );
    });

    return () => {
      live = false;
      document.documentElement.classList.remove("js-anim");
      document.documentElement.removeAttribute("data-sd-live");
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
        document.documentElement.classList.add("js-anim");

        const plateImg = root.querySelector<HTMLElement>(".sd-plate-frame img");
        const plate = root.querySelector<HTMLElement>(".sd-plate-frame");
        if (plate && plateImg) {
          gsap.fromTo(
            plateImg,
            { scale: 1.06 },
            {
              scale: 1,
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

        const clinicImg = root.querySelector<HTMLElement>(".sd-clinic-frame img");
        const clinic = root.querySelector<HTMLElement>(".sd-clinic-frame");
        if (clinic && clinicImg) {
          gsap.fromTo(
            clinicImg,
            { scale: 1.05 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: clinic,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }

        gsap.utils.toArray<HTMLElement>(".sd-reveal", root).forEach((el) => {
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

        gsap.utils.toArray<HTMLElement>(".sd-row", root).forEach((row) => {
          gsap.fromTo(
            row,
            { "--line": 0 },
            {
              "--line": 1,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: row,
                start: "top 80%",
                once: true,
              },
            },
          );
        });

        const visitMask = root.querySelector<HTMLElement>(".sd-visit-mask > *");
        if (visitMask) {
          gsap.fromTo(
            visitMask,
            { yPercent: 105, y: 0 },
            {
              yPercent: 0,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: visitMask.parentElement,
                start: "top 85%",
                once: true,
              },
            },
          );
        }
      });
    },
    { scope: rootRef },
  );

  return (
    <div className="sd" ref={rootRef}>
      <div className="sd-bar">
        <div className="sd-bar-inner sd-wrap">
          <span className="sd-bar-mark">{SWISS.badge}</span>
          <span className="sd-bar-note">
            A KantoCo sample page for Swiss Dental Clinic. Not the clinic&apos;s
            official site.
          </span>
          <span className="sd-bar-note-mob">
            Not the clinic&apos;s official site
          </span>
        </div>
      </div>

      <section className="sd-opener">
        <div className="sd-wrap">
          <p className="sd-eyebrow">
            Dental clinic · Jordan Street, Parañaque
          </p>
          <h1 className="sd-name">
            <span className="sd-l1">
              <span>Swiss Dental</span>
            </span>
            <span className="sd-l2">
              <span className="sd-cross" aria-hidden="true">
                <span className="sd-cross-h" />
                <span className="sd-cross-v" />
              </span>
              <span className="sd-word">
                <span>Clinic</span>
              </span>
            </span>
          </h1>
          <div className="sd-under">
            <p className="sd-doctor">{SWISS.doctor}</p>
            <p className="sd-tagline">
              A dental clinic in Ledesma Bldg, 11 Jordan Street, Parañaque. Call
              the clinic or send a message on Facebook to set your visit.
            </p>
          </div>
          <Actions landline />
        </div>
      </section>

      <section className="sd-plate-sec">
        <div className="sd-wrap">
          <figure className="sd-plate">
            <figcaption className="sd-cap sd-cap-plate">
              {PHOTOS.plate.caption}
            </figcaption>
            <div className="sd-plate-frame">
              <picture>
                <source
                  media="(max-width: 767px)"
                  type="image/webp"
                  srcSet={`${IMG}/${PHOTOS.plate.mobile}.webp`}
                />
                <source
                  media="(max-width: 767px)"
                  type="image/jpeg"
                  srcSet={`${IMG}/${PHOTOS.plate.mobile}.jpg`}
                />
                <source
                  type="image/webp"
                  srcSet={`${IMG}/${PHOTOS.plate.desktop1x}.webp 1120w, ${IMG}/${PHOTOS.plate.desktop}.webp 2240w`}
                  sizes={PLATE_SIZES}
                />
                <source
                  type="image/jpeg"
                  srcSet={`${IMG}/${PHOTOS.plate.desktop1x}.jpg 1120w, ${IMG}/${PHOTOS.plate.desktop}.jpg 2240w`}
                  sizes={PLATE_SIZES}
                />
                <img
                  src={`${IMG}/${PHOTOS.plate.desktop1x}.jpg`}
                  alt={PHOTOS.plate.alt}
                  width={PHOTOS.plate.width}
                  height={PHOTOS.plate.height}
                  loading="eager"
                  decoding="async"
                  fetchPriority="low"
                />
              </picture>
            </div>
          </figure>
        </div>
      </section>

      <section className="sd-angle">
        <div className="sd-wrap">
          <div className="sd-cols">
            <p className="sd-reveal">
              If you searched for Swiss Dental Clinic, this sample gathers the
              right address, both numbers, and its Facebook, in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="sd-clinic-sec">
        <div className="sd-wrap">
          <p className="sd-kicker sd-reveal">The clinic</p>
          <div className="sd-cols">
            <figure className="sd-clinic">
              <div className="sd-clinic-frame">
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`${IMG}/${PHOTOS.clinic.file}.webp`}
                  />
                  <img
                    src={`${IMG}/${PHOTOS.clinic.file}.jpg`}
                    alt={PHOTOS.clinic.alt}
                    width={PHOTOS.clinic.width}
                    height={PHOTOS.clinic.height}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
              <figcaption className="sd-cap">{PHOTOS.clinic.caption}</figcaption>
            </figure>
            <div className="sd-clinic-copy">
              <h2 className="sd-h2 sd-reveal">Look for the red cross.</h2>
              <p className="sd-body sd-reveal">
                The clinic&apos;s sign hangs over reception: SWISS in white
                light, a red cross under it, on a wall of wood slats.
              </p>
              <p className="sd-fact">{SWISS.rating}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sd-before">
        <div className="sd-wrap">
          <p className="sd-kicker">Before you come</p>
          <div className="sd-cols">
            <h2 className="sd-h2">Three ways to reach the clinic.</h2>
          </div>
          <div className="sd-rows">
            <div className="sd-row">
              <p className="sd-row-n">01</p>
              <p className="sd-row-title">Call</p>
              <p className="sd-row-detail">
                Mobile{" "}
                <a className="sd-tap" href={SWISS.mobileTel}>
                  {SWISS.mobile}
                </a>
                , also on WhatsApp. Landline{" "}
                <a className="sd-tap" href={SWISS.landlineTel}>
                  {SWISS.landline}
                </a>
                .
              </p>
            </div>
            <div className="sd-row">
              <p className="sd-row-n">02</p>
              <p className="sd-row-title">Message on Facebook</p>
              <p className="sd-row-detail">
                Send a message to{" "}
                <a
                  className="sd-tap"
                  href={SWISS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {SWISS.facebookHandle}
                </a>
                . Email works too:{" "}
                <a className="sd-tap" href={`mailto:${SWISS.email}`}>
                  {SWISS.email}
                </a>
                .
              </p>
            </div>
            <div className="sd-row">
              <p className="sd-row-n">03</p>
              <p className="sd-row-title">Check the hours</p>
              <p className="sd-row-detail">
                Ask the clinic for this week&apos;s hours before you go.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sd-visit">
        <div className="sd-wrap">
          <p className="sd-kicker">Visit</p>
          <div className="sd-cols">
            <div className="sd-visit-mask sd-visit-lead">
              <h2 className="sd-h2">{SWISS.addressLine}</h2>
            </div>
          </div>
          <Actions />
          <div className="sd-visit-grid">
            <div className="sd-visit-block">
              <p className="sd-kicker">Address</p>
              {SWISS.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p>
                <a
                  className="sd-link"
                  href={SWISS.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions
                </a>
              </p>
            </div>
            <div className="sd-visit-block">
              <p className="sd-kicker">Phone</p>
              <p>Mobile {SWISS.mobile}</p>
              <p>(WhatsApp)</p>
              <p>Landline {SWISS.landline}</p>
            </div>
            <div className="sd-visit-block">
              <p className="sd-kicker">Facebook</p>
              <p>
                <a
                  href={SWISS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  facebook.com/<wbr />
                  swissdentalclinicph
                </a>
              </p>
            </div>
            <div className="sd-visit-block">
              <p className="sd-kicker">Hours</p>
              <p>Ask the clinic.</p>
            </div>
            {readySlots.length > 0 ? (
              <div className="sd-slots is-ready">
                {readySlots.map((slot) => (
                  <figure className="sd-slot" key={slot.id}>
                    <img
                      src={`${IMG}/${slot.file}.jpg`}
                      alt={slot.alt}
                      width={slot.width}
                      height={slot.height}
                      loading="lazy"
                      decoding="async"
                    />
                    {slot.caption ? (
                      <figcaption className="sd-cap">{slot.caption}</figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="sd-foot">
        <div className="sd-wrap">
          <div className="sd-cols">
            <p>
              A KantoCo sample for Swiss Dental Clinic. Not live, and not the
              clinic&apos;s official site.
            </p>
            <p>{PHOTOS.clinic.footer}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
