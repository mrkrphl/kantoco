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

function Actions() {
  return (
    <div className="sd-actions">
      <a
        className="sd-btn sd-btn-msg"
        href={SWISS.messenger}
        target="_blank"
        rel="noopener noreferrer"
      >
        Message on Facebook
      </a>
      <a
        className="sd-btn sd-btn-dir"
        href={SWISS.maps}
        target="_blank"
        rel="noopener noreferrer"
      >
        Get directions
      </a>
    </div>
  );
}

const readySlots = PHOTOS.facebookLater.filter((slot) => slot.ready);

export function SwissDentalExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.remove("js-anim");
      return;
    }

    let live = true;
    waitForOpenerAutoplay().then(() => {
      if (!live || !rootRef.current) return;
      const node = rootRef.current;
      const bits = [
        node.querySelector(".sd-mark"),
        node.querySelector(".sd-eyebrow"),
        node.querySelector(".sd-wordmark"),
        node.querySelector(".sd-copy"),
        ...gsap.utils.toArray<HTMLElement>(".sd-opener .sd-btn", node),
      ].filter(Boolean);
      gsap.fromTo(
        bits,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power2.out" },
      );
    });

    return () => {
      live = false;
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
        document.documentElement.classList.add("js-anim");

        const plateImg = root.querySelector<HTMLElement>(".sd-plate-frame img");
        const plate = root.querySelector<HTMLElement>(".sd-plate-frame");
        if (plate && plateImg) {
          gsap.fromTo(
            plateImg,
            { scale: 1.05 },
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

        gsap.utils.toArray<HTMLElement>(".sd-reveal", root).forEach((el) => {
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

        const clinic = root.querySelector<HTMLElement>(".sd-clinic-frame");
        if (clinic) {
          gsap.fromTo(
            clinic,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: clinic,
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
          <span className="sd-bar-full">
            {SWISS.badge} · KantoCo sample, not the clinic&apos;s site
          </span>
          <span className="sd-bar-short">{SWISS.badge} · KantoCo sample</span>
        </div>
      </div>

      <section className="sd-opener">
        <div className="sd-wrap">
          <div className="sd-mark">
            <picture>
              <source type="image/webp" srcSet={`${IMG}/heart.webp`} />
              <img
                src={`${IMG}/heart.png`}
                alt=""
                width={56}
                height={56}
                decoding="async"
              />
            </picture>
          </div>
          <p className="sd-eyebrow">Jordan St · Parañaque</p>
          <h1 className="sd-wordmark">
            <span>Swiss Dental</span>
            <span>Clinic</span>
          </h1>
          <div className="sd-intro">
            <div className="sd-copy">
              <p className="sd-tagline">On Jordan Street, in Ledesma Bldg.</p>
              <p className="sd-sub">
                A KantoCo sample for the clinic. Not their website, and it takes
                no bookings.
              </p>
              <p className="sd-rating">{SWISS.rating}</p>
            </div>
            <Actions />
          </div>
        </div>
      </section>

      <section className="sd-plate-sec">
        <div className="sd-wrap">
          <figure className="sd-plate">
            <div className="sd-plate-frame">
              <picture>
                <source
                  media="(max-width: 1023px)"
                  type="image/webp"
                  srcSet={`${IMG}/${PHOTOS.plate.mobile}.webp`}
                />
                <source
                  media="(max-width: 1023px)"
                  type="image/jpeg"
                  srcSet={`${IMG}/${PHOTOS.plate.mobile}.jpg`}
                />
                <source
                  type="image/webp"
                  srcSet={`${IMG}/${PHOTOS.plate.desktop1x}.webp 1120w, ${IMG}/${PHOTOS.plate.desktop}.webp 1536w`}
                  sizes={PLATE_SIZES}
                />
                <source
                  type="image/jpeg"
                  srcSet={`${IMG}/${PHOTOS.plate.desktop1x}.jpg 1120w, ${IMG}/${PHOTOS.plate.desktop}.jpg 1536w`}
                  sizes={PLATE_SIZES}
                />
                <img
                  src={`${IMG}/${PHOTOS.plate.desktop1x}.jpg`}
                  alt={PHOTOS.plate.alt}
                  width={PHOTOS.plate.width}
                  height={PHOTOS.plate.height}
                  sizes={PLATE_SIZES}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
            </div>
            <figcaption className="sd-cap">{PHOTOS.plate.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section className="sd-clinic-sec">
        <div className="sd-wrap">
          <p className="sd-kicker sd-reveal">The clinic</p>
          <h2 className="sd-clinic-h sd-reveal">On Jordan Street.</h2>
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
          </div>
        </div>
      </section>

      <section className="sd-visit">
        <div className="sd-wrap">
          <p className="sd-kicker sd-reveal">Visit</p>
          <p className="sd-visit-lead sd-reveal">
            Message on Facebook, or open the map.
          </p>
          <div className="sd-visit-grid">
            <div className="sd-visit-block sd-reveal">
              <p className="sd-kicker">Address</p>
              {SWISS.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="sd-visit-block sd-reveal">
              <p className="sd-kicker">Map</p>
              <p className="sd-phone-row">
                <a
                  className="sd-link"
                  href={SWISS.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps
                </a>
              </p>
              <p className="sd-rating">{SWISS.rating}</p>
            </div>
            <div className="sd-visit-block sd-reveal">
              <p className="sd-kicker">Message</p>
              <Actions />
            </div>
            {readySlots.length > 0 ? (
              <div className="sd-slots is-ready">
                {readySlots.map((slot) => (
                  <figure className="sd-slot" key={slot.id}>
                    <div className="sd-slot-frame">
                      <picture>
                        <source
                          type="image/webp"
                          srcSet={`${IMG}/${slot.file}.webp`}
                        />
                        <img
                          src={`${IMG}/${slot.file}.jpg`}
                          alt={slot.alt}
                          width={slot.width}
                          height={slot.height}
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    </div>
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
          <p>{PHOTOS.clinic.footer}</p>
          <p>
            {PHOTOS.plate.credit}. This is a KantoCo sample, not the
            clinic&apos;s website, and it takes no bookings.
          </p>
        </div>
      </footer>
    </div>
  );
}
