"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  MaxiconChrome,
  MaxiconShell,
} from "@/components/demos/maxicon/MaxiconShell";
import { MaxiconVisit } from "@/components/demos/maxicon/MaxiconVisit";
import { maxicon } from "@/lib/maxicon";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FINS = 13;

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const pin = root.querySelector<HTMLElement>(".maxicon-stage-inner");
      const fins = gsap.utils.toArray<HTMLElement>(".maxicon-fin", root);
      const frost = root.querySelector<HTMLElement>(".maxicon-frost");
      const heat = root.querySelector<HTMLElement>(".maxicon-heat-copy");
      const bay = root.querySelector<HTMLElement>(".maxicon-bay img");
      if (!pin || !fins.length) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pin,
          start: "top 2.2rem",
          end: "+=165%",
          pin: true,
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      fins.forEach((fin, i) => {
        tl.to(
          fin,
          {
            yPercent: i % 2 === 0 ? -130 : 130,
            opacity: 0,
          },
          0,
        );
      });

      if (heat) {
        tl.to(heat, { autoAlpha: 0, y: -28 }, 0);
      }
      if (frost) {
        tl.fromTo(frost, { opacity: 0 }, { opacity: 0.2 }, 0.15);
      }
      if (bay) {
        tl.fromTo(
          bay,
          { scale: 1.08, transformOrigin: "50% 28%" },
          { scale: 1 },
          0,
        );
      }
    },
    { scope: rootRef, dependencies: [ready, reduced] },
  );

  const motion = reduced ? "static" : ready ? "ready" : "pending";

  return (
    <div ref={rootRef} data-motion={motion}>
      <MaxiconShell current="Home" overlay>
        <section
          className="maxicon-stage"
          aria-label="Condenser fins open onto Maxicon’s bay"
        >
          <div className="maxicon-stage-inner">
            <MaxiconChrome current="Home" />
            <div className="maxicon-bay">
              <Image
                src="/demos/maxicon-car-aircon/shop-front.jpg"
                alt="Maxicon’s open bay and sign on President’s Avenue, BF Homes."
                fill
                className="object-cover object-[center_28%]"
                sizes="100vw"
                preload
              />
            </div>
            <div className="maxicon-frost" aria-hidden />
            <div className="maxicon-fins" aria-hidden>
              {Array.from({ length: FINS }, (_, i) => (
                <span className="maxicon-fin" key={i} />
              ))}
            </div>
            <p className="maxicon-heat-copy">
              You come in off President&apos;s Avenue.
            </p>
          </div>
        </section>

        <section className="maxicon-room">
          <p className="maxicon-line">
            The heat stays on the sidewalk. Inside the bay the work is cold air.
          </p>
        </section>

        <figure className="maxicon-still">
          <Image
            src="/demos/maxicon-car-aircon/dash-work.jpg"
            alt="Dashboard pulled for evaporator work on a Toyota, photographed in their bay."
            fill
            className="object-cover"
            sizes="100vw"
          />
        </figure>
        <p className="maxicon-caption">{maxicon.recentPost}</p>

        <MaxiconVisit />

        <p className="maxicon-foot">
          <Link href="/">Back to the agency</Link>
        </p>
      </MaxiconShell>
    </div>
  );
}
