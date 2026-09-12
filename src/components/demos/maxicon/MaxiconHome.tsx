"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { MaxiconBanner, MaxiconShell } from "@/components/demos/maxicon/MaxiconShell";
import { MaxiconVisit } from "@/components/demos/maxicon/MaxiconVisit";
import { maxicon } from "@/lib/maxicon";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function circleClip(r: number, x = 50, y = 50) {
  return `circle(${r}% at ${x}% ${y}%)`;
}

function slitClip(v: number) {
  return `inset(${v}% 0 ${v}% 0)`;
}

export function MaxiconHome() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionReady();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;

      const stage = root.querySelector<HTMLElement>(".maxicon-stage");
      const inner = root.querySelector<HTMLElement>(".maxicon-stage-inner");
      const bay = root.querySelector<HTMLElement>(".maxicon-bay");
      const vent = root.querySelector<HTMLElement>(".maxicon-vent");
      const frost = root.querySelector<HTMLElement>(".maxicon-frost");
      const copy = root.querySelector<HTMLElement>(".maxicon-hero-copy");
      if (!stage || !inner || !bay || !vent || !frost || !copy) return;

      inner.classList.remove("maxicon-iris-css");

      const iris = { r: 9 };
      const ventSlit = { v: 48 };
      const frostR = { r: 0 };

      const paintIris = () => {
        bay.style.clipPath = circleClip(iris.r, 50, 50);
      };
      const paintVent = () => {
        vent.style.clipPath = slitClip(ventSlit.v);
      };
      const paintFrost = () => {
        frost.style.clipPath = circleClip(frostR.r, 68, 42);
      };

      paintIris();
      paintVent();
      paintFrost();
      gsap.set(copy, { autoAlpha: 0, y: 18 });
      gsap.set(vent, { autoAlpha: 0 });
      gsap.set(frost, { autoAlpha: 0 });

      const open = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      open.to(
        iris,
        {
          r: 160,
          duration: 0.82,
          onUpdate: paintIris,
          onComplete: () => {
            bay.style.clipPath = "none";
          },
        },
        0,
      );
      open.to(
        copy,
        { autoAlpha: 1, y: 0, duration: 0.42, ease: "power2.out" },
        0.52,
      );

      const cool = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "+=175%",
          pin: true,
          pinSpacing: true,
          scrub: 0.55,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cool.to({}, { duration: 0.22 });
      cool.to(copy, { autoAlpha: 0, y: -16, duration: 0.32, ease: "power2.in" });
      cool.to(vent, { autoAlpha: 1, duration: 0.28 }, 0.3);
      cool.to(
        ventSlit,
        {
          v: 0,
          duration: 0.7,
          ease: "power2.out",
          onUpdate: paintVent,
        },
        0.3,
      );
      cool.to(frost, { autoAlpha: 1, duration: 0.28 }, 0.82);
      cool.to(
        frostR,
        {
          r: 160,
          duration: 0.82,
          ease: "power2.inOut",
          onUpdate: paintFrost,
        },
        0.82,
      );
      cool.to({}, { duration: 0.2 });

      const refresh = () => ScrollTrigger.refresh();
      stage.querySelectorAll("img").forEach((img) => {
        if (img.complete) return;
        img.addEventListener("load", refresh, { once: true });
      });
      requestAnimationFrame(refresh);
    },
    { scope: rootRef, dependencies: [reduced] },
  );

  const motion = reduced ? "static" : "ready";

  return (
    <div ref={rootRef} data-motion={motion}>
      <MaxiconShell overlay>
        <section
          className="maxicon-stage"
          aria-label="Maxicon’s bay on President’s Avenue"
        >
          <div className="maxicon-stage-inner maxicon-iris-css">
            <MaxiconBanner over />

            <div className="maxicon-shutter" aria-hidden>
              <Image
                src="/demos/maxicon-car-aircon/plate-iris-fin.png"
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                preload
              />
            </div>

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

            <div className="maxicon-vent" aria-hidden>
              <div className="maxicon-vent-photo">
                <Image
                  src="/demos/maxicon-car-aircon/plate-vent-mist.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </div>

            <div className="maxicon-frost" aria-hidden>
              <Image
                src="/demos/maxicon-car-aircon/plate-condenser-frost.png"
                alt=""
                fill
                className="object-cover object-[center_40%]"
                sizes="100vw"
              />
            </div>

            <div className="maxicon-hero">
              <div className="maxicon-hero-copy">
                <h1 className="maxicon-hero-name">{maxicon.name}</h1>
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
                  Hours and the street
                </a>
              </div>
            </div>
          </div>
        </section>

        <MaxiconVisit />

        <p className="maxicon-foot">
          <Link href="/">Back to the agency</Link>
        </p>
      </MaxiconShell>
    </div>
  );
}
