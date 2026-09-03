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

export function HinogExperience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const frame = root.querySelector<HTMLElement>(".hinog-opener-frame");
      if (frame) {
        gsap.set(frame, { clipPath: "inset(46% 0 46% 0)" });
        gsap.to(frame, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.25,
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
    <div ref={rootRef} className="hinog" data-motion={motion}>
      <p className="hinog-banner">{DEMO_DISCLAIMER}</p>

      <section className="hinog-opener" aria-label="Pan de sal">
        <div className="hinog-opener-frame">
          <Image
            src="/demos/hinog-bakery/pandesal-bowl.jpg"
            alt="Wooden bowl of fresh pan de sal beside a cup of coffee"
            fill
            sizes="100vw"
            preload
          />
        </div>
      </section>

      <div className="hinog-intro" data-reveal>
        <p className="hinog-leaf">{DEMO_BADGE}</p>
        <h1 className="hinog-word">Hinog</h1>
        <p style={{ marginTop: "1rem", maxWidth: "32rem", lineHeight: 1.6 }}>
          Pan de sal in the morning pull, then monay and ensaymada until the
          trays empty. Sample stall off Quirino Avenue, Tambo, Parañaque.
          Fictional corner. Not a real bakery.
        </p>
        <p style={{ marginTop: "1rem", color: "var(--mute)" }}>
          Open daily 6:00-16:00. Last pull around 15:30. No table service.
        </p>
      </div>

      <section className="hinog-rest">
        <div data-reveal>
          <h2>Counter, not a cafe</h2>
          <p style={{ maxWidth: "32rem", marginTop: "0.9rem", lineHeight: 1.6 }}>
            Take the bag. Hours sit on the stub. Prices here are a guide for
            this sample only.
          </p>
        </div>
        <div className="hinog-still" data-reveal>
          <Image
            src="/demos/hinog-bakery/pandesal-bag.jpg"
            alt="Pan de sal packed in a plain brown paper bag"
            fill
            sizes="(min-width: 820px) 42rem, 100vw"
          />
        </div>
        <p data-reveal>
          Open <strong>daily 6:00-16:00</strong>
          <br />
          Last pull around 15:30
          <br />
          Sample stall off Quirino Avenue, Tambo, Parañaque
        </p>
        <ul className="hinog-menu" data-reveal>
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
            <span>cheese on top</span>
          </li>
        </ul>
        <div className="hinog-still" data-reveal>
          <Image
            src="/demos/hinog-bakery/kape.jpg"
            alt="Hand dipping pan de sal into a mug of coffee"
            fill
            sizes="(min-width: 820px) 42rem, 100vw"
          />
        </div>
        <a
          href={KANTOCO_MESSENGER}
          target="_blank"
          rel="noopener noreferrer"
          className="hinog-cta"
        >
          Message us on Facebook
        </a>
        <p className="hinog-foot">
          {DEMO_DISCLAIMER} No shop phone. No live orders.{" "}
          <Link href="/">Back to KantoCo</Link>
          <br />
          Pan de sal photos: Jessartcam, Obsidian Soul, and Froirivera, via
          Wikimedia Commons.
        </p>
      </section>
    </div>
  );
}
