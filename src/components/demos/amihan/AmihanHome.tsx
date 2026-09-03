"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AmihanShell } from "@/components/demos/amihan/AmihanShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";
import { revealOnScroll } from "@/lib/motion";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AmihanHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const frame = root.querySelector<HTMLElement>(".amihan-opener-frame");
      if (frame) {
        gsap.set(frame, { clipPath: "inset(0 100% 0 0)" });
        gsap.to(frame, {
          clipPath: "inset(0% 0% 0% 0%)",
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
    <div ref={rootRef} data-motion={motion}>
      <AmihanShell current="Home">
        <section className="amihan-hero" data-reveal>
          <h1 className="amihan-display">
            Hair that still holds after a humid afternoon on the Moonwalk road.
          </h1>
          <p className="lede">
            Amihan is a sample parlor: wet cut in the bowl, set under the
            fluorescent, then back out into the street. Tuesday to Sunday,
            10:00-20:00. Monday is closed.
          </p>
        </section>

        <section className="amihan-opener" aria-label="Salon mirror">
          <div className="amihan-opener-frame">
            <Image
              src="/demos/amihan-salon/mirrors.jpg"
              alt="Empty wash station, brick, and a long salon mirror"
              fill
              className="object-cover"
              sizes="100vw"
              preload
            />
          </div>
        </section>

        <section className="amihan-page" data-reveal>
          <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-end">
            <p className="max-w-sm text-[var(--mute)]">
              Sample walk-up near BF Homes and Moonwalk, Parañaque. The unit
              number is fictional.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/demos/amihan-salon/gallery"
                className="underline decoration-[var(--accent)] underline-offset-4"
              >
                Open the gallery
              </Link>
              <a
                href={KANTOCO_MESSENGER}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)]"
              >
                Message us on Facebook
              </a>
            </div>
          </div>
        </section>
      </AmihanShell>
    </div>
  );
}
