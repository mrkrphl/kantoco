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

const FINS = 28;

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !ready || reduced) return;

      const stage = root.querySelector<HTMLElement>(".maxicon-stage");
      const inner = root.querySelector<HTMLElement>(".maxicon-stage-inner");
      const heat = root.querySelector<HTMLElement>(".maxicon-heat-copy");
      const bayImg = root.querySelector<HTMLElement>(".maxicon-bay img");
      if (!stage || !inner) return;

      const startIris = parseFloat(
        getComputedStyle(inner).getPropertyValue("--iris"),
      );
      const iris = { r: Number.isFinite(startIris) ? startIris : 7 };

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=220%",
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      });

      inner.style.setProperty("--iris", `${iris.r}%`);
      tl.to(
        iris,
        {
          r: 160,
          duration: 0.6,
          onUpdate: () => {
            inner.style.setProperty("--iris", `${iris.r}%`);
          },
        },
        0,
      );

      if (heat) {
        tl.to(heat, { opacity: 0, y: -28, duration: 0.2 }, 0.06);
      }

      if (bayImg) {
        tl.fromTo(
          bayImg,
          { scale: 1.12, transformOrigin: "50% 28%" },
          { scale: 1, duration: 0.6 },
          0,
        );
      }

      tl.to({}, { duration: 0.4 });

      inner.classList.remove("maxicon-iris-css");

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

      const bayImage = inner.querySelector("img");
      if (bayImage) {
        const refresh = () => ScrollTrigger.refresh();
        if (bayImage.complete) refresh();
        else bayImage.addEventListener("load", refresh, { once: true });
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
          aria-label="A vent iris opens onto Maxicon’s bay"
        >
          <div className="maxicon-stage-inner maxicon-iris-css">
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
