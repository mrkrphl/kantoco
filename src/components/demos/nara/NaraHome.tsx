"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { NaraShell } from "@/components/demos/nara/NaraShell";
import { KANTOCO_MESSENGER } from "@/lib/demos";
import { revealOnScroll } from "@/lib/motion";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function NaraHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const frame = root.querySelector<HTMLElement>(".nara-opener-frame");
      if (frame) {
        gsap.set(frame, { clipPath: "inset(0 0 0 100%)" });
        gsap.to(frame, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.25,
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
    <div ref={rootRef} data-motion={motion}>
      <NaraShell current="Home">
        <section className="nara-opener" aria-label="Clinic hallway">
          <div className="nara-opener-frame">
            <Image
              src="/demos/nara-clinic/hallway-daylight.jpg"
              alt="Empty clinic beds in daylight, made and waiting"
              fill
              className="object-cover"
              sizes="100vw"
              preload
            />
          </div>
        </section>

        <section className="nara-intro" data-reveal>
          <p className="nara-kicker">Neighborhood clinic</p>
          <h1 className="nara-serif nara-title">
            Hours on the door, a chair in the consult room, and a list of what
            we actually take.
          </h1>
          <p className="nara-lede">
            Nara is a sample clinic for the Santos-side blocks of BF Homes. We
            treat coughs, cuts, and the weekday check that should not wait for a
            hospital queue.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="nara-cta"
          >
            Message us on Facebook
          </a>
        </section>

        <section className="nara-rest">
          <div data-reveal>
            <p className="nara-kicker">What we take</p>
            <ul className="nara-list">
              {[
                ["General consult", "Fever, cough, gut, skin, and follow-up."],
                ["Wound and dressing", "Cuts from the shop or the kitchen."],
                ["BP and sugar check", "Same-day reading written on paper."],
                [
                  "Clearance papers",
                  "Work and school forms, if the chart fits.",
                ],
              ].map(([title, body]) => (
                <li key={title}>
                  <p className="nara-serif text-xl font-semibold">{title}</p>
                  <p className="mt-1 text-[var(--mute)]">{body}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/demos/nara-clinic/services"
              className="mt-6 inline-block text-sm font-semibold text-[var(--accent)] underline underline-offset-4"
            >
              Full service list
            </Link>
          </div>

          <aside className="nara-hours" data-reveal>
            <p className="nara-kicker">Hours</p>
            <dl>
              <div>
                <dt>Monday to Saturday</dt>
                <dd className="font-semibold">8:00-17:00</dd>
              </div>
              <div>
                <dt>Sunday</dt>
                <dd className="font-semibold">Closed</dd>
              </div>
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-[var(--mute)]">
              Sample block off Dr. A. Santos Avenue, BF Homes, Parañaque. This
              is a fictional address, not a real clinic.
            </p>
          </aside>
        </section>
      </NaraShell>
    </div>
  );
}
