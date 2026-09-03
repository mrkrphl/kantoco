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

export function BuholExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const frame = root.querySelector<HTMLElement>(".buhol-opener-frame");
      if (frame) {
        gsap.set(frame, {
          clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
        });
        gsap.to(frame, {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 1.3,
          ease: "power3.inOut",
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
    <div ref={rootRef} className="buhol" data-motion={motion}>
      <p className="buhol-banner">{DEMO_DISCLAIMER}</p>

      <div className="buhol-mast" data-reveal>
        <p style={{ fontSize: 11, letterSpacing: "0.14em" }}>{DEMO_BADGE}</p>
        <p className="buhol-hand">buhol</p>
        <h1 className="buhol-word">Blooms</h1>
        <p style={{ maxWidth: "32rem", marginTop: "1.1rem", lineHeight: 1.6 }}>
          Sample wrap stall at Moonwalk market, Parañaque. Stems by the bunch,
          funeral work, and table bunches tied with a rubber band. Fictional
          pitch. Not a real florist.
        </p>
      </div>

      <section className="buhol-opener" aria-label="Wrapped stems">
        <div className="buhol-opener-frame">
          <Image
            src="/demos/buhol-blooms/buckets.jpg"
            alt="Kraft-wrapped asters standing in galvanized buckets at a market stall"
            fill
            sizes="100vw"
            preload
          />
        </div>
      </section>

      <section className="buhol-rest">
        <div className="buhol-still" data-reveal>
          <Image
            src="/demos/buhol-blooms/wrap.jpg"
            alt="Wrapped bouquet of red and peach blooms seen from above"
            fill
            sizes="(min-width: 800px) 42rem, 100vw"
          />
        </div>
        <div className="buhol-board" data-reveal>
          <p>open when the ice holds</p>
          <dl>
            <dt>Hours</dt>
            <dd>Tuesday to Sunday, 8:00-18:00</dd>
            <dt>Monday</dt>
            <dd>Closed</dd>
            <dt>Work</dt>
            <dd>Stems by the bunch, plus funeral and table wraps.</dd>
          </dl>
        </div>
        <div className="buhol-still" data-reveal>
          <Image
            src="/demos/buhol-blooms/market-table.jpg"
            alt="Peonies in plastic buckets with handwritten cardboard prices on a market table"
            fill
            sizes="(min-width: 800px) 42rem, 100vw"
          />
        </div>
        <ul className="buhol-stems" data-reveal>
          <li>
            <span>wrap</span>
            Newspaper or kraft, with no satin bow.
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
        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="buhol-cta"
        >
          Message us on Facebook
        </a>
        <p className="buhol-foot">
          {DEMO_DISCLAIMER} No shop phone. No live orders.{" "}
          <Link href="/">Back to KantoCo</Link>
        </p>
      </section>
    </div>
  );
}
