"use client";

import Image from "next/image";
import Link from "next/link";
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
      const line = root.querySelector<HTMLElement>(".maxicon-loud");
      if (frame) {
        gsap.set(frame, { clipPath: "circle(0% at 78% 22%)" });
        gsap.to(frame, {
          clipPath: "circle(160% at 78% 22%)",
          duration: 1.4,
          ease: "power3.inOut",
        });
      }
      if (line) {
        gsap.fromTo(
          line,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            delay: 0.55,
            ease: "power3.out",
          },
        );
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
        <section className="maxicon-opener" aria-label="Dark workshop bay">
          <div className="maxicon-opener-frame">
            <Image
              src="/demos/maxicon-car-aircon/workshop-haze.jpg"
              alt="Generic workshop photograph: a dark service bay with a car on a lift. Not Maxicon’s storefront."
              fill
              className="object-cover"
              sizes="100vw"
              preload
            />
          </div>
          <div className="maxicon-loud-wrap">
            <p className="maxicon-kicker">BF Homes · Parañaque</p>
            <h1 className="maxicon-display maxicon-loud">
              The heat stays on President&apos;s Avenue.
            </h1>
          </div>
        </section>

        <section className="maxicon-section" data-reveal>
          <p className="maxicon-kicker">The bay</p>
          <p className="maxicon-lede">
            You walk in off President&apos;s Avenue and the heat stays on the
            sidewalk. Inside, the work is cold air: leak tests, a flush when the
            system needs it, and a recharge only after the parts are ready.
          </p>
          <p className="maxicon-lede">
            {maxicon.name} is a parts and repair shop in BF Homes. They also
            trade as {maxicon.alsoKnownAs}. Japanese, American, and European
            cars come through the same door. {maxicon.cards} Hours on their
            Facebook intro are {maxicon.hours.toLowerCase()}.
          </p>
          <p className="maxicon-lede">{maxicon.sampleNote}</p>
        </section>

        <section className="maxicon-section" data-reveal>
          <p className="maxicon-kicker">What they do</p>
          <h2 className="maxicon-display maxicon-title">
            Parts on the shelf. Repair in the bay.
          </h2>
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
            <Link
              href="/demos/maxicon-car-aircon/services"
              className="maxicon-cta-ghost"
            >
              Full work list
            </Link>
          </div>
          <p className="maxicon-note">
            {maxicon.sampleNote}{" "}
            <a
              href={maxicon.kantocoMessenger}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message KantoCo on Facebook
            </a>{" "}
            if you want a site like this for a shop that is actually yours.
          </p>
        </section>

        <figure className="maxicon-still" data-reveal>
          <Image
            src="/demos/maxicon-car-aircon/shop-front.jpg"
            alt="Maxicon’s open bay and sign on a busy street, published on their public Wix page."
            fill
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
        </figure>
        <p className="maxicon-caption">
          Their shop, from a photo they published. {maxicon.recentPost}
        </p>

        <section className="maxicon-visit" data-reveal>
          <div className="maxicon-visit-grid">
            <div className="maxicon-card">
              <p className="maxicon-kicker">Hours</p>
              <p className="mt-3 text-lg">{maxicon.hours}</p>
              <p className="mt-2 text-sm text-[var(--mute)]">
                From their Facebook intro. Directories that say 6pm were
                ignored.
              </p>
            </div>
            <div className="maxicon-card">
              <p className="maxicon-kicker">Find them</p>
              <p className="mt-3 text-lg">{maxicon.address}</p>
              <p className="mt-2 text-sm text-[var(--mute)]">
                Call {maxicon.phoneMobileDisplay}, or open their Facebook page.
                Their live page is Facebook, not this sample.
              </p>
            </div>
          </div>
        </section>
      </MaxiconShell>
    </div>
  );
}
