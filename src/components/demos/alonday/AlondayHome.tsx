"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AlondayBanner } from "@/components/demos/alonday/AlondayShell";
import { alonday } from "@/lib/alonday";
import { DEMO_BADGE } from "@/lib/demos";
import { revealOnScroll } from "@/lib/motion";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function AlondayHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const chairs = root.querySelectorAll<HTMLElement>("[data-chair]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-lit", entry.isIntersecting);
        }
      },
      { threshold: 0.55, rootMargin: "0px 0px -8% 0px" },
    );

    chairs.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [reduced]);

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
    <div ref={rootRef} className="alonday alonday--home" data-motion={motion}>
      <AlondayBanner />

      <main>
        <section className="alonday-hero" aria-label="Alonday Dental Clinic">
          <div className="alonday-hero-still">
            <Image
              src="/demos/alonday-dental/facade.jpg"
              alt="White clinic bungalow on a paved lot, green roof, wooden door, and a hanging sign for Dr. Emma Aleli D. Alonday."
              fill
              className="object-cover"
              sizes="100vw"
              preload
            />
            <div className="alonday-hero-wash" aria-hidden />
          </div>
          <div className="alonday-hero-copy">
            <p className="alonday-hero-eye">
              {DEMO_BADGE} · El Grande Avenue, BF Homes
            </p>
            <h1 className="alonday-hero-name">{alonday.name}</h1>
            <p className="alonday-hero-line">{alonday.heroLine}</p>
            <div className="alonday-hero-ctas">
              <a href={alonday.phoneHref} className="alonday-btn alonday-btn--clay">
                Call {alonday.phoneDisplay}
              </a>
              <a
                href={alonday.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="alonday-btn"
              >
                Facebook
              </a>
              <a
                href={alonday.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="alonday-btn"
              >
                Book on their app
              </a>
            </div>
            <a
              href={alonday.kantocoMessenger}
              target="_blank"
              rel="noopener noreferrer"
              className="alonday-hero-pitch"
            >
              Message KantoCo
            </a>
            <p className="alonday-hero-meta">{alonday.hours}</p>
          </div>
        </section>

        <section className="alonday-intro" data-reveal>
          <p className="alonday-kicker">On El Grande</p>
          <h2 className="alonday-title">
            The lot is a white bungalow. The work is listed on Facebook.
          </h2>
          <p className="alonday-lede">
            Alonday Dental Clinic is at 454 El Grande Avenue, BF Homes,
            Parañaque. Their public About names general dentistry, braces,
            children’s dentistry, implants, and root canal. People book by
            phone, Facebook, or the MyMeds app they already use.
          </p>
        </section>

        <section className="alonday-chairs" aria-label="Listed services">
          <p className="alonday-kicker" data-reveal>
            Chair list
          </p>
          <ol className="alonday-service-list">
            {alonday.services.map((row) => (
              <li
                key={row.n}
                className={`alonday-chair${reduced ? " is-lit" : ""}`}
                data-chair
                data-reveal
              >
                <p className="alonday-chair-name">
                  <span className="alonday-num">{row.n}</span>
                  {row.name}
                </p>
                <p className="alonday-chair-line">{row.line}</p>
              </li>
            ))}
          </ol>
          <Link href="/demos/alonday-dental/services" className="alonday-text-link">
            Full service list
          </Link>
        </section>

        <section className="alonday-pair" data-reveal>
          <div className="alonday-shot alonday-shot--tall">
            <Image
              src="/demos/alonday-dental/chair.jpg"
              alt="Reference still of an empty dental chair and a navy operator stool. Not their room."
              fill
              className="object-cover"
              sizes="(min-width: 880px) 42vw, 100vw"
            />
          </div>
          <div className="alonday-pair-copy">
            <p className="alonday-kicker">A sample, not their site</p>
            <p className="alonday-lede">
              {alonday.sampleNote} The bungalow photograph is a public listing
              still of this clinic. The empty-chair pictures are licensed
              references, left under filenames that can be swapped for a
              Facebook still.
            </p>
            <div className="alonday-hero-ctas">
              <a href={alonday.phoneHref} className="alonday-btn alonday-btn--clay">
                Call {alonday.phoneDisplay}
              </a>
              <a
                href={alonday.booking}
                target="_blank"
                rel="noopener noreferrer"
                className="alonday-btn"
              >
                Book on their app
              </a>
            </div>
          </div>
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
      </main>
    </div>
  );
}
