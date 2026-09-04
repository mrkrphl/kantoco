"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";
import { maxicon, maxiconWork } from "@/lib/maxicon";
import { revealOnScroll } from "@/lib/motion";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const frame = root.querySelector<HTMLElement>(".maxicon-opener-frame");
      if (frame) {
        gsap.set(frame, { clipPath: "circle(0% at 78% 22%)" });
        gsap.to(frame, {
          clipPath: "circle(220% at 78% 22%)",
          duration: 1.4,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(frame, { clipPath: "none" });
          },
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
    <div ref={rootRef} data-motion={motion}>
      <MaxiconShell current="Home">
        <section className="maxicon-opener" aria-label="Maxicon bay on President's Avenue">
          <div className="maxicon-opener-frame">
            <Image
              src="/demos/maxicon-car-aircon/shop-front.jpg"
              alt="Maxicon’s open bay and sign on President’s Avenue, BF Homes."
              fill
              className="object-cover object-[center_28%]"
              sizes="100vw"
              preload
            />
          </div>
        </section>

        <section className="maxicon-section" data-reveal>
          <p className="maxicon-lede">
            You walk in off President&apos;s Avenue and the heat stays on the
            sidewalk. Inside the bay the work is cold air: a leak test, a flush
            when the system needs it, and a recharge only after the parts are
            ready.
          </p>
        </section>

        <section className="maxicon-section" data-reveal>
          <h2 className="maxicon-display maxicon-title">
            Maxicon sells the part and does the repair.
          </h2>
          <p className="maxicon-lede">
            {maxicon.name} is a parts and repair shop at {maxicon.address}. They
            also trade as {maxicon.alsoKnownAs}. Japanese, American, and
            European cars come through the same door. {maxicon.cards} Hours on
            their Facebook intro are {maxicon.hours}.
          </p>
          <ol className="maxicon-jobs">
            {maxiconWork.map(([title, body]) => (
              <li key={title}>
                <p className="maxicon-display text-2xl">{title}</p>
                <p className="text-sm leading-relaxed text-[var(--mute)]">
                  {body}
                </p>
              </li>
            ))}
          </ol>
          <div className="maxicon-cta-row">
            <a href={maxicon.phoneMobileHref} className="maxicon-cta">
              Call {maxicon.phoneMobileDisplay}
            </a>
            <a
              href={maxicon.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="maxicon-cta-ghost"
            >
              Facebook
            </a>
          </div>
          <p className="maxicon-note">
            {maxicon.sampleNote}{" "}
            <a
              href={maxicon.kantocoMessenger}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message KantoCo
            </a>
            .
          </p>
        </section>

        <figure className="maxicon-still" data-reveal>
          <Image
            src="/demos/maxicon-car-aircon/dash-work.jpg"
            alt="Dashboard pulled for evaporator work on a Toyota, photographed in their bay."
            fill
            className="object-cover"
            sizes="100vw"
          />
        </figure>
        <p className="maxicon-caption">{maxicon.recentPost}</p>
      </MaxiconShell>
    </div>
  );
}
