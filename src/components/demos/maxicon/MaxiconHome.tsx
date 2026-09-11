"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  MaxiconBanner,
  MaxiconShell,
} from "@/components/demos/maxicon/MaxiconShell";
import { MaxiconVisit } from "@/components/demos/maxicon/MaxiconVisit";
import { maxicon } from "@/lib/maxicon";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FINS = 28;

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;

      const inner = root.querySelector<HTMLElement>(".maxicon-stage-inner");
      const bay = root.querySelector<HTMLElement>(".maxicon-bay");
      const bayImg = root.querySelector<HTMLElement>(".maxicon-bay img");
      if (!inner || !bay) return;

      const startIris = parseFloat(
        getComputedStyle(inner).getPropertyValue("--iris"),
      );
      const iris = { r: Number.isFinite(startIris) ? startIris : 8 };

      inner.style.setProperty("--iris", `${iris.r}%`);
      inner.classList.remove("maxicon-iris-css");

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
      });

      tl.to(
        iris,
        {
          r: 160,
          duration: 0.85,
          onUpdate: () => {
            inner.style.setProperty("--iris", `${iris.r}%`);
          },
          onComplete: () => {
            bay.style.clipPath = "none";
          },
        },
        0,
      );

      if (bayImg) {
        tl.fromTo(
          bayImg,
          { scale: 1.08, transformOrigin: "50% 28%" },
          { scale: 1, duration: 0.85 },
          0,
        );
      }

      tl.fromTo(
        ".maxicon-hero-copy",
        { y: 12 },
        { y: 0, duration: 0.45, ease: "power2.out" },
        0.4,
      );

      gsap.fromTo(
        ".maxicon-room p",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".maxicon-room",
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        },
      );

      gsap.fromTo(
        ".maxicon-caption",
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".maxicon-caption",
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const motion = reduced ? "static" : "ready";

  return (
    <div ref={rootRef} data-motion={motion}>
      <MaxiconShell current="Home" overlay>
        <section
          className="maxicon-stage"
          aria-label="Maxicon’s bay on President’s Avenue"
        >
          <div className="maxicon-stage-inner maxicon-iris-css">
            <MaxiconBanner over />
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
            <div className="maxicon-fins" aria-hidden>
              {Array.from({ length: FINS }, (_, i) => (
                <span className="maxicon-fin" key={i} />
              ))}
            </div>
            <div className="maxicon-hero">
              <div className="maxicon-hero-copy">
                <h1 className="maxicon-hero-name">{maxicon.name}</h1>
                <p className="maxicon-hero-addr">{maxicon.addressShort}</p>
                <p className="maxicon-hero-line">{maxicon.heroLine}</p>
                <div className="maxicon-hero-actions">
                  <a href={maxicon.phoneMobileHref} className="maxicon-hero-call">
                    Call {maxicon.phoneMobileDisplay}
                  </a>
                  <a
                    href={maxicon.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="maxicon-hero-fb"
                  >
                    Facebook
                  </a>
                </div>
                <a href="#visit" className="maxicon-scroll-cue">
                  Hours and the map
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="maxicon-room">
          <p className="maxicon-line">
            You come in off President&apos;s Avenue. The heat stays on the
            sidewalk. Inside the bay the work is cold air.
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
