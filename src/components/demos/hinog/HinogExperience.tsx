"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";
import { exposeGsap, gsap, useGSAP } from "@/lib/gsap-window";

export function HinogExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      exposeGsap();
      const pin = pinRef.current;
      if (!pin) return;
      if (typeof gsap === "undefined") {
        throw new Error("Hinog: GSAP missing after import.");
      }

      const photo = pin.querySelector<HTMLElement>(".hinog-photo");
      const box = pin.querySelector<HTMLElement>(".hinog-box");
      const lid = pin.querySelector<HTMLElement>(".hinog-lid");
      const flapL = pin.querySelector<HTMLElement>(".hinog-flap-l");
      const flapR = pin.querySelector<HTMLElement>(".hinog-flap-r");
      const type = gsap.utils.toArray<HTMLElement>(".hinog-rise", pin);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(photo, { scale: 1, filter: "brightness(1) saturate(1)" });
        gsap.set(box, { autoAlpha: 0, scale: 0.4 });
        gsap.set(lid, { rotateX: -128 });
        gsap.set(flapL, { rotateY: -88 });
        gsap.set(flapR, { rotateY: 88 });
        gsap.set(type, { y: 0, autoAlpha: 1 });
        return;
      }

      gsap.set(photo, {
        scale: 1.08,
        filter: "brightness(0.32) saturate(0.65)",
        transformOrigin: "50% 50%",
      });
      gsap.set(lid, { rotateX: 0, transformOrigin: "top center" });
      gsap.set(flapL, { rotateY: 0, transformOrigin: "left center" });
      gsap.set(flapR, { rotateY: 0, transformOrigin: "right center" });
      gsap.set(box, { scale: 1, autoAlpha: 1 });
      gsap.set(type, { y: 32, autoAlpha: 0 });

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

      tl.to(lid, { rotateX: -128, duration: 0.7, ease: "none" }, 0)
        .to(flapL, { rotateY: -92, duration: 0.55, ease: "none" }, 0.08)
        .to(flapR, { rotateY: 92, duration: 0.55, ease: "none" }, 0.08)
        .to(
          photo,
          { scale: 1, filter: "brightness(1) saturate(1)", duration: 0.95, ease: "none" },
          0.1,
        )
        .to(
          box,
          { scale: 0.42, y: 90, autoAlpha: 0, duration: 0.55, ease: "none" },
          0.48,
        )
        .to(type, { y: 0, autoAlpha: 1, duration: 0.38, stagger: 0.05, ease: "none" }, 0.5);
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="hinog">
      <p className="hinog-banner">{DEMO_DISCLAIMER}</p>

      <div ref={pinRef} className="hinog-pin">
        <div className="hinog-stage">
          <div className="hinog-photo-wrap">
            <Image
              src="/demos/hinog-bakery/counter.jpg"
              alt="Bakery counter with crusted loaves in baskets and handwritten ticket labels"
              fill
              className="hinog-photo"
              sizes="100vw"
              preload
            />
          </div>

          <div className="hinog-scene" aria-hidden>
            <div className="hinog-box">
              <div className="hinog-panel hinog-back" />
              <div className="hinog-panel hinog-bottom" />
              <div className="hinog-panel hinog-left" />
              <div className="hinog-panel hinog-right" />
              <div className="hinog-panel hinog-front">
                <span className="hinog-stamp">HINOG</span>
              </div>
              <div className="hinog-lid-anchor">
                <div className="hinog-lid" />
              </div>
              <div className="hinog-flap-anchor left">
                <div className="hinog-flap hinog-flap-l" />
              </div>
              <div className="hinog-flap-anchor right">
                <div className="hinog-flap hinog-flap-r" />
              </div>
            </div>
          </div>

          <p className="hinog-badge hinog-rise">{DEMO_BADGE}</p>
          <div className="hinog-type">
            <p className="hinog-ticket hinog-rise">Ticket 014 · Tambo sample</p>
            <h1 className="hinog-word hinog-rise">HINOG</h1>
            <p className="hinog-line hinog-rise">Pan de sal. Monay. Ensaymada.</p>
          </div>
        </div>
      </div>

      <section className="hinog-rest">
        <div className="hinog-rest-inner">
          <h2>COUNTER, NOT A CAFE</h2>
          <p>
            Sample stall off Quirino Ave, Tambo, Parañaque. Fictional corner.
            Not a real bakery. Hours on the stub only.
          </p>

          <div className="hinog-ledger">
            <div className="hinog-still">
              <Image
                src="/demos/hinog-bakery/crust.jpg"
                alt="Dark crusted loaves and wheat on a flour-dusted board"
                fill
                sizes="(min-width: 820px) 70vw, 100vw"
              />
            </div>
            <div className="hinog-stub">
              <p>
                Open <strong>Daily 6:00-16:00</strong>
              </p>
              <p>Last pull around 15:30</p>
              <p>No table service. Take the bag.</p>
            </div>
          </div>

          <ul className="hinog-menu">
            <li>
              <span>Pan de sal</span>
              <span>morning pull</span>
            </li>
            <li>
              <span>Monay</span>
              <span>crust, not cake</span>
            </li>
            <li>
              <span>Ensaymada</span>
              <span>cheese, not cream</span>
            </li>
          </ul>

          <div className="hinog-still hinog-bags">
            <Image
              src="/demos/hinog-bakery/bags.jpg"
              alt="Two kraft paper bags on enamel red"
              fill
              sizes="100vw"
            />
          </div>

          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="hinog-cta"
          >
            MESSAGE KANTOCO
          </a>

          <p className="hinog-foot">
            {DEMO_DISCLAIMER} No shop phone. No live orders.{" "}
            <Link href="/">Back to KantoCo</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
