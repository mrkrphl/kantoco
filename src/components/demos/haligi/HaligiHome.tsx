"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HaligiShell } from "@/components/demos/haligi/HaligiShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";
import { revealOnScroll } from "@/lib/motion";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const jobs = [
  ["01", "PMS / oil", "Drain, filter, fill. You keep the old filter if you want it."],
  ["02", "Brakes", "Pads, fluid, rotor true. We say stop or go."],
  ["03", "Tires / align", "Mount, balance, pull to one side."],
  ["04", "A/C charge", "Leak check first. No magic cold."],
  ["05", "Undercarriage", "Lift work. We show you the rust before we quote."],
];

export function HaligiHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const frame = root.querySelector<HTMLElement>(".haligi-opener-frame");
      if (frame) {
        gsap.set(frame, { clipPath: "inset(100% 0 0 0)" });
        gsap.to(frame, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.2,
          ease: "power2.inOut",
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
      <HaligiShell current="Home">
        <section className="haligi-opener" aria-label="Lift bay">
          <div className="haligi-opener-frame">
            <Image
              src="/demos/haligi-auto/lift.jpg"
              alt="White wagon on a two-post lift in a working bay"
              fill
              className="object-cover object-[center_62%]"
              sizes="100vw"
              preload
            />
          </div>
        </section>

        <section className="haligi-intro" data-reveal>
          <p className="text-[var(--mute)]">
            Monday to Saturday 8:00-18:00. Sunday 8:00-12:00. Sample bay, Sucat
            corridor.
          </p>
          <h1 className="haligi-cond haligi-title">
            We take the car. You get it back running.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--mute)]">
            Straight talk for a neighborhood bay. There is no lounge and no
            wait-and-see quote. This is a sample, not a live shop.
          </p>

          <ol className="haligi-jobs">
            {jobs.map(([n, title, body]) => (
              <li key={n}>
                <span className="haligi-cond text-2xl text-[var(--accent)]">
                  {n}
                </span>
                <div>
                  <p className="haligi-cond text-2xl">{title}</p>
                  <p className="text-sm text-[var(--mute)]">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={KANTOCO_MESSENGER}
              target="_blank"
              rel="noopener noreferrer"
              className="haligi-cta"
            >
              Message us on Facebook
            </a>
            <Link href="/demos/haligi-auto/services" className="haligi-cta-ghost">
              Work order
            </Link>
          </div>
        </section>
      </HaligiShell>
    </div>
  );
}
