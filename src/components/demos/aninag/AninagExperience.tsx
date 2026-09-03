"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";
import { revealOnScroll } from "@/lib/motion";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AninagExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const frame = root.querySelector<HTMLElement>(".aninag-opener-frame");
      if (frame) {
        gsap.set(frame, { clipPath: "circle(0% at 50% 50%)" });
        gsap.to(frame, {
          clipPath: "circle(150% at 50% 50%)",
          duration: 1.35,
          ease: "power4.inOut",
        });
      }

      revealOnScroll(
        gsap,
        gsap.utils.toArray<HTMLElement>("[data-reveal]", root),
      );
    },
    { scope: rootRef, dependencies: [ready, reduced] },
  );

  const motion = reduced ? "static" : ready ? "ready" : "pending";

  return (
    <div ref={rootRef} className="aninag" data-motion={motion}>
      <p className="aninag-banner">{DEMO_DISCLAIMER}</p>

      <div className="aninag-mast" data-reveal>
        <p style={{ fontSize: 11, letterSpacing: "0.16em" }}>{DEMO_BADGE}</p>
        <h1 className="aninag-word">Aninag</h1>
        <p className="aninag-kicker">
          Sample loft off Sucat Road, San Antonio, Parañaque. Portraits on paper
          and product stills under one tungsten and one gel. Fictional block.
          Not a real studio.
        </p>
      </div>

      <section className="aninag-opener" aria-label="Studio cyc">
        <div className="aninag-opener-frame">
          <Image
            src="/demos/aninag-studio/studio-room.jpg"
            alt="Empty photo studio with a white cyc wall, softboxes, and a lighting grid"
            fill
            sizes="100vw"
            preload
          />
        </div>
      </section>

      <div className="aninag-stills">
        <div className="aninag-still" data-reveal>
          <Image
            src="/demos/aninag-studio/loft-lights.jpg"
            alt="Industrial studio loft with stands, softboxes, and cable on concrete"
            fill
            sizes="(min-width: 800px) 50vw, 100vw"
          />
        </div>
        <div className="aninag-still" data-reveal>
          <Image
            src="/demos/aninag-studio/camera.jpg"
            alt="Black Canon body with a Sigma zoom facing the lens"
            fill
            sizes="(min-width: 800px) 50vw, 100vw"
          />
        </div>
      </div>

      <section className="aninag-rest" data-reveal>
        <h2>Paper, tungsten, and one gel</h2>
        <p style={{ marginTop: "1rem" }}>
          Hours are printed only. Tuesday to Sunday, 10:00-19:00. Closed Monday.
          No live booking and no shop phone.
        </p>
        <dl className="aninag-readout">
          <dt>Open</dt>
          <dd>Tue-Sun 10:00-19:00</dd>
          <dt>Work</dt>
          <dd>Headshots against the cyc, plus product on black.</dd>
          <dt>Print</dt>
          <dd>Contact sheets on darkroom paper.</dd>
        </dl>
        <ul className="aninag-jobs">
          <li>
            <span>01</span> Headshots against the cyc, with no cream backdrop.
          </li>
          <li>
            <span>02</span> Product on black, lit with one tungsten and one cyan
            gel.
          </li>
          <li>
            <span>03</span> Contact sheets printed on darkroom paper.
          </li>
        </ul>
        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="aninag-cta"
        >
          Message us on Facebook
        </a>
        <p className="aninag-foot">
          {DEMO_DISCLAIMER} <Link href="/">Back to KantoCo</Link>
        </p>
      </section>
    </div>
  );
}
