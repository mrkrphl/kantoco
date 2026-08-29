"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";
import { DEMO_PIN, exposeGsap, gsap, useGSAP } from "@/lib/gsap-window";

const BLADES = 12;

export function AninagExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      exposeGsap();
      const pin = pinRef.current;
      if (!pin) return;
      if (typeof gsap === "undefined") {
        throw new Error("Aninag: GSAP missing after import.");
      }

      const hole = pin.querySelector<HTMLElement>(".aninag-photo-wrap");
      const photo = pin.querySelector<HTMLElement>(".aninag-photo");
      const iris = pin.querySelector<HTMLElement>(".aninag-iris");
      const blades = gsap.utils.toArray<HTMLElement>(".aninag-blade", pin);
      const type = gsap.utils.toArray<HTMLElement>(".aninag-rise", pin);
      const gel = pin.querySelector<HTMLElement>(".aninag-gel");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(hole, { clipPath: "circle(80% at 50% 50%)" });
        gsap.set(photo, { scale: 1 });
        gsap.set(iris, { autoAlpha: 0 });
        gsap.set(blades, { rotate: 42, autoAlpha: 0 });
        gsap.set(type, { y: 0, autoAlpha: 1 });
        gsap.set(gel, { autoAlpha: 0.35 });
        return;
      }

      gsap.set(hole, { clipPath: "circle(1.6% at 50% 50%)" });
      gsap.set(photo, { scale: 1.08, transformOrigin: "50% 50%" });
      gsap.set(type, { y: 40, autoAlpha: 0 });
      gsap.set(gel, { autoAlpha: 0.85 });
      gsap.set(iris, { autoAlpha: 1 });
      gsap.set(blades, { rotate: 0, transformOrigin: "50% 92%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          ...DEMO_PIN,
        },
      });

      tl.to(hole, { clipPath: "circle(78% at 50% 50%)", duration: 1, ease: "none" }, 0)
        .to(blades, { rotate: 46, duration: 0.72, ease: "none", stagger: 0.012 }, 0)
        .to(iris, { autoAlpha: 0, duration: 0.28, ease: "none" }, 0.62)
        .to(photo, { scale: 1, duration: 1, ease: "none" }, 0)
        .to(gel, { autoAlpha: 0.22, duration: 0.7, ease: "none" }, 0.15)
        .to(type, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06, ease: "none" }, 0.42);
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className="aninag">
      <p className="aninag-banner">{DEMO_DISCLAIMER}</p>

      <div ref={pinRef} className="aninag-pin">
        <div className="aninag-stage">
          <div className="aninag-photo-wrap">
            <Image
              src="/demos/aninag-studio/studio-room.jpg"
              alt="Empty photo studio with a white cyc wall, softboxes, and a lighting grid"
              fill
              className="aninag-photo"
              sizes="100vw"
              preload
            />
            <div className="aninag-gel" aria-hidden />
          </div>

          <div className="aninag-iris" aria-hidden>
            {Array.from({ length: BLADES }, (_, i) => (
              <span
                key={i}
                className="aninag-blade-slot"
                style={{ transform: `rotate(${i * (360 / BLADES)}deg)` }}
              >
                <span className="aninag-blade" />
              </span>
            ))}
          </div>

          <p className="aninag-badge aninag-rise">{DEMO_BADGE}</p>
          <div className="aninag-type">
            <p className="aninag-meter aninag-rise">
              <span>f/1.4</span>
              <span>1/125</span>
              <span>ISO 200</span>
            </p>
            <h1 className="aninag-word aninag-rise">Aninag</h1>
            <p className="aninag-kicker aninag-rise">Glimpse the room.</p>
          </div>
        </div>
      </div>

      <section className="aninag-rest">
        <div className="aninag-rest-grid">
          <p className="aninag-live-mark">{DEMO_BADGE}</p>
          <h2>Paper. Tungsten. One gel.</h2>
          <p style={{ maxWidth: "28rem", marginTop: "1rem", lineHeight: 1.55 }}>
            Sample loft off Sucat Road, San Antonio, Parañaque. Fictional block.
            Not a real studio. Walk-in hours are printed only.
          </p>

          <div className="aninag-sheet">
            <div className="aninag-still">
              <Image
                src="/demos/aninag-studio/loft-lights.jpg"
                alt="Industrial studio loft with stands, softboxes, and cable on concrete"
                fill
                sizes="(min-width: 800px) 60vw, 100vw"
              />
            </div>
            <dl className="aninag-readout">
              <dt>Open</dt>
              <dd>Tue-Sun 10:00-19:00</dd>
              <dt>Shut</dt>
              <dd>Monday</dd>
              <dt>Work</dt>
              <dd>Portraits on paper. Product stills.</dd>
            </dl>
          </div>

          <ul className="aninag-jobs">
            <li>
              <span>01</span> Headshots against the cyc. No cream backdrop.
            </li>
            <li>
              <span>02</span> Product on black. One tungsten, one cyan gel.
            </li>
            <li>
              <span>03</span> Contact sheets printed on darkroom paper.
            </li>
          </ul>

          <div className="aninag-still" style={{ marginTop: "1.6rem", minHeight: 180 }}>
            <Image
              src="/demos/aninag-studio/camera.jpg"
              alt="Black Canon body with a Sigma zoom facing the lens"
              fill
              sizes="100vw"
            />
          </div>

          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="aninag-cta"
          >
            Message KantoCo
          </a>

          <p className="aninag-foot">
            {DEMO_DISCLAIMER} No shop phone. No live booking.{" "}
            <Link href="/">Back to KantoCo</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
