"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";
import { exposeGsap, gsap, useGSAP } from "@/lib/gsap-window";

const PETALS = [
  { deg: 0, kind: "sap" },
  { deg: 45, kind: "band" },
  { deg: 90, kind: "kraft" },
  { deg: 135, kind: "sap" },
  { deg: 180, kind: "band" },
  { deg: 225, kind: "kraft" },
  { deg: 270, kind: "sap" },
  { deg: 315, kind: "band" },
] as const;

export function BuholExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      exposeGsap();
      const pin = pinRef.current;
      if (!pin) return;
      if (typeof gsap === "undefined") {
        throw new Error("Buhol: GSAP missing after import.");
      }

      const hole = pin.querySelector<HTMLElement>(".buhol-photo-wrap");
      const photo = pin.querySelector<HTMLElement>(".buhol-photo");
      const bloom = pin.querySelector<HTMLElement>(".buhol-bloom");
      const petals = gsap.utils.toArray<HTMLElement>(".buhol-petal", pin);
      const type = gsap.utils.toArray<HTMLElement>(".buhol-rise", pin);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(hole, { clipPath: "circle(80% at 50% 48%)" });
        gsap.set(photo, { scale: 1 });
        gsap.set(petals, { rotateX: 0, scale: 1.15, autoAlpha: 0.15 });
        gsap.set(bloom, { autoAlpha: 0.2 });
        gsap.set(type, { y: 0, autoAlpha: 1 });
        return;
      }

      gsap.set(hole, { clipPath: "circle(3.5% at 50% 48%)" });
      gsap.set(photo, { scale: 1.08, transformOrigin: "50% 50%" });
      gsap.set(petals, { rotateX: 78, scale: 0.28, transformOrigin: "50% 100%" });
      gsap.set(type, { y: 36, autoAlpha: 0 });
      gsap.set(bloom, { autoAlpha: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          start: "top top",
          end: "+=220%",
        },
      });

      tl.to(petals, { rotateX: 0, scale: 1.18, duration: 0.7, stagger: 0.03, ease: "none" }, 0)
        .to(hole, { clipPath: "circle(78% at 50% 48%)", duration: 0.85, ease: "none" }, 0.12)
        .to(photo, { scale: 1, duration: 1, ease: "none" }, 0)
        .to(petals, { autoAlpha: 0, y: -40, duration: 0.35, ease: "none" }, 0.62)
        .to(bloom, { autoAlpha: 0, duration: 0.28, ease: "none" }, 0.68)
        .to(type, { y: 0, autoAlpha: 1, duration: 0.38, stagger: 0.05, ease: "none" }, 0.48);
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="buhol">
      <p className="buhol-banner">{DEMO_DISCLAIMER}</p>

      <div ref={pinRef} className="buhol-pin">
        <div className="buhol-stage">
          <div className="buhol-photo-wrap">
            <Image
              src="/demos/buhol-blooms/buckets.jpg"
              alt="Kraft-wrapped asters standing in galvanized buckets at a market stall"
              fill
              className="buhol-photo"
              sizes="100vw"
              preload
            />
          </div>

          <div className="buhol-bloom" aria-hidden>
            <div className="buhol-bloom-core">
              {PETALS.map((petal) => (
                <span
                  key={petal.deg}
                  className="buhol-petal-slot"
                  style={{ transform: `rotate(${petal.deg}deg)` }}
                >
                  <span
                    className={
                      petal.kind === "kraft"
                        ? "buhol-petal kraft"
                        : petal.kind === "band"
                          ? "buhol-petal band"
                          : "buhol-petal"
                    }
                  />
                </span>
              ))}
              <span className="buhol-center" />
            </div>
          </div>

          <p className="buhol-badge buhol-rise">{DEMO_BADGE}</p>
          <div className="buhol-type">
            <p className="buhol-hand buhol-rise">buhol</p>
            <h1 className="buhol-word buhol-rise">Blooms</h1>
            <p className="buhol-line buhol-rise">Wrap. Stem. Rubber band.</p>
          </div>
        </div>
      </div>

      <section className="buhol-rest">
        <div className="buhol-rest-inner">
          <h2>
            knot the wrap
            <span>then the table</span>
          </h2>
          <p>
            Sample wrap stall, Moonwalk market fringe, Parañaque. Fictional
            pitch. Not a real florist. Hours on the board only.
          </p>

          <div className="buhol-split">
            <div className="buhol-still">
              <Image
                src="/demos/buhol-blooms/market-table.jpg"
                alt="Peonies in plastic buckets with handwritten cardboard prices on a market table"
                fill
                sizes="(min-width: 800px) 55vw, 100vw"
              />
            </div>
            <div className="buhol-board">
              <p>open when the ice holds</p>
              <dl>
                <dt>Hours</dt>
                <dd>Tue-Sun 8:00-18:00</dd>
                <dt>Monday</dt>
                <dd>Closed</dd>
                <dt>Work</dt>
                <dd>Stems by the bunch. Funeral and table.</dd>
              </dl>
            </div>
          </div>

          <ul className="buhol-stems">
            <li>
              <span>wrap</span>
              Newspaper or kraft. No satin bow.
            </li>
            <li>
              <span>band</span>
              Rubber-band red. Count the stems.
            </li>
            <li>
              <span>bucket</span>
              Water, ice, and a hand-lettered card.
            </li>
          </ul>

          <div className="buhol-still buhol-wrap-still">
            <Image
              src="/demos/buhol-blooms/wrap.jpg"
              alt="Wrapped bouquet of red and peach blooms seen from above"
              fill
              sizes="100vw"
            />
          </div>

          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="buhol-cta"
          >
            Message KantoCo
          </a>

          <p className="buhol-foot">
            {DEMO_DISCLAIMER} No shop phone. No live orders.{" "}
            <Link href="/">Back to KantoCo</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
