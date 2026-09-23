"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AlondayShell } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";
import { DEMO_BADGE } from "@/lib/demos";
import { revealOnScroll } from "@/lib/motion";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AlondayHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;
      revealOnScroll(
        gsap,
        gsap.utils.toArray<HTMLElement>("[data-reveal]", root),
      );
    },
    { scope: rootRef, dependencies: [ready, reduced] },
  );

  const motion = reduced ? "static" : ready ? "ready" : "pending";

  return (
    <div ref={rootRef} data-motion={motion}>
      <AlondayShell current="Home">
        <section className="alonday-hero-card" aria-label="Alonday Dental Clinic">
          <p className="alonday-kicker">
            {DEMO_BADGE} · El Grande Avenue, BF Homes
          </p>
          <figure className="alonday-hero-still">
            <Image
              src={alonday.stills.hero}
              alt="Alonday Dental Clinic public logo and contact card"
              width={852}
              height={316}
              priority
            />
            <figcaption>
              As printed on their public contact card: {alonday.dentistOnCard}{" "}
              and associates
            </figcaption>
          </figure>
          <h1 className="alonday-title alonday-title--wide">
            {alonday.promise}
          </h1>
          <p className="alonday-lede">
            A neighborhood dental clinic at 454 El Grande Avenue, BF Homes,
            Parañaque 1718. This is a KantoCo sample, not a live client site.
          </p>
          <div className="alonday-hero-ctas alonday-hero-ctas--ink">
            <a href={alonday.phoneHref} className="alonday-btn alonday-btn--teal">
              Call {alonday.phoneDisplay}
            </a>
            <a
              href={alonday.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="alonday-btn alonday-btn--ghost"
            >
              Facebook
            </a>
          </div>
        </section>

        <section className="alonday-page" data-reveal>
          <p className="alonday-kicker">What they list</p>
          <ul className="alonday-highlights">
            {alonday.highlights.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <Link href="/demos/alonday-dental/services" className="alonday-text-link">
            Services
          </Link>
        </section>

        <p className="alonday-note alonday-foot">
          {alonday.sampleNote}{" "}
          <a
            href={alonday.kantocoMessenger}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message KantoCo
          </a>
          .
          <span className="alonday-foot-back">
            <Link href="/">Back to the agency</Link>
          </span>
        </p>
      </AlondayShell>
    </div>
  );
}
