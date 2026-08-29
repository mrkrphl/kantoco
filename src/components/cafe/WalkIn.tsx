"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cafe, walkIn } from "@/lib/cafe";
import ArchMark from "./ArchMark";

gsap.registerPlugin(ScrollTrigger, useGSAP);

declare global {
  interface Window {
    gsap: typeof gsap;
    ScrollTrigger: typeof ScrollTrigger;
  }
}

if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
  throw new Error("WalkIn: GSAP failed to import. Do not ship a CSS fallback.");
}

function exposeGsap() {
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
}

export default function WalkIn() {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = pinRef.current;
      if (!root || !pin) return;

      if (typeof gsap === "undefined" || typeof ScrollTrigger.create !== "function") {
        throw new Error("WalkIn: ScrollTrigger is missing after import.");
      }

      exposeGsap();

      const layers = gsap.utils.toArray<HTMLElement>(".walkin-layer", pin);
      const photos = gsap.utils.toArray<HTMLElement>(".walkin-photo", pin);
      const types = gsap.utils.toArray<HTMLElement>(".walkin-type", pin);
      const cupReveal = pin.querySelector<HTMLElement>(".walkin-cup-reveal");
      const cupLayer = pin.querySelector<HTMLElement>('[data-key="cup"]');

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        pin.dataset.walkin = "reduced";
        pin.style.height = "auto";
        layers.forEach((el) => {
          el.style.position = "relative";
          el.style.height = "100svh";
          el.style.opacity = "1";
          el.style.visibility = "visible";
          el.style.transform = "none";
          el.style.clipPath = "none";
        });
        return;
      }

      pin.dataset.walkin = "pinned";

      gsap.set(layers, { autoAlpha: 0 });
      gsap.set(layers[0], { autoAlpha: 1 });
      gsap.set(photos, { scale: 1.08, transformOrigin: "50% 50%" });
      gsap.set(types, { y: 24, autoAlpha: 0 });
      if (cupReveal) {
        gsap.set(cupReveal, { clipPath: "circle(0% at 50% 52%)" });
      }
      if (cupLayer) {
        gsap.set(cupLayer, { autoAlpha: 1 });
      }

      gsap.from(".walkin-intro", {
        y: 24,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: "power3.out",
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=480%",
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          id: "walk-in",
        },
      });

      tl.to(photos[0], { scale: 1, duration: 0.9, ease: "power3.out" }, 0);
      tl.to(types[0], { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" }, 0.05);

      const crossfade = (from: number, to: number, at: number) => {
        tl.to(types[from], { autoAlpha: 0, y: -16, duration: 0.2, ease: "power3.out" }, at);
        tl.to(layers[from], { autoAlpha: 0, duration: 0.16 }, at + 0.2);
        tl.fromTo(
          layers[to],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.16, immediateRender: false },
          at + 0.36,
        );
        tl.fromTo(
          photos[to],
          { scale: 1.08 },
          { scale: 1, duration: 0.9, ease: "power3.out", immediateRender: false },
          at + 0.36,
        );
        if (types[to]?.dataset.empty !== "true") {
          tl.fromTo(
            types[to],
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", immediateRender: false },
            at + 0.42,
          );
        }
      };

      // facade → patio glass → inside at the doors → the hall
      crossfade(0, 1, 1.0);
      crossfade(1, 2, 2.15);
      crossfade(2, 3, 3.3);

      // cup opens over the room
      const cupAt = 4.5;
      tl.to(types[3], { autoAlpha: 0, y: -16, duration: 0.2, ease: "power3.out" }, cupAt);
      if (cupReveal) {
        tl.fromTo(
          cupReveal,
          { clipPath: "circle(0% at 50% 52%)" },
          { clipPath: "circle(80% at 50% 52%)", duration: 1.2, ease: "power3.out" },
          cupAt + 0.12,
        );
      }
      tl.fromTo(
        photos[4],
        { scale: 1.08 },
        { scale: 1, duration: 1.2, ease: "power3.out", immediateRender: false },
        cupAt + 0.12,
      );
      tl.to(layers[3], { autoAlpha: 0, duration: 0.5 }, cupAt + 0.4);
      tl.fromTo(
        types[4],
        { y: 24, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out", immediateRender: false },
        cupAt + 0.55,
      );

      const refresh = () => ScrollTrigger.refresh();
      pin.querySelectorAll("img").forEach((img) => {
        if (img.complete) return;
        img.addEventListener("load", refresh, { once: true });
      });
      requestAnimationFrame(refresh);
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="walkin bg-navy">
      <div
        ref={pinRef}
        id="walk-in"
        className="walkin-pin relative h-[100svh] overflow-hidden"
      >
        {walkIn.map((chapter, i) => {
          const emptyType = !chapter.title && !chapter.line;
          const isCup = chapter.kind === "cup";
          return (
            <div
              key={chapter.key}
              data-key={chapter.key}
              className="walkin-layer absolute inset-0"
              style={{ zIndex: isCup ? 4 : i + 1 }}
            >
              <div
                className={
                  isCup
                    ? "walkin-cup-reveal absolute inset-0 overflow-hidden"
                    : "absolute inset-0"
                }
              >
                <div className="walkin-photo absolute inset-0 origin-center will-change-transform">
                  <Image
                    src={chapter.src}
                    alt={chapter.alt}
                    fill
                    priority={i < 2}
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy/65 via-navy/20 to-transparent"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-navy/15"
                    aria-hidden
                  />
                </div>
              </div>
              <div
                className="walkin-type absolute inset-x-5 bottom-16 max-w-3xl md:inset-x-8 md:bottom-20"
                data-empty={emptyType ? "true" : "false"}
              >
                {chapter.kicker ? (
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cornflower-2">
                    {chapter.kicker}
                  </p>
                ) : null}
                {chapter.title ? (
                  <p className="mt-2 font-[family-name:var(--font-cafe-display)] text-[clamp(3.4rem,14vw,8rem)] leading-[0.82] tracking-[-0.03em] text-cream">
                    {chapter.title}
                  </p>
                ) : null}
                {chapter.line ? (
                  <p
                    className={`mt-4 text-cream ${
                      "italic" in chapter && chapter.italic
                        ? "font-[family-name:var(--font-cafe-accent)] text-xl italic md:text-2xl"
                        : "font-[family-name:var(--font-cafe-display)] text-2xl tracking-tight md:text-4xl"
                    }`}
                  >
                    {chapter.line}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-x-5 top-8 z-10 flex items-start gap-3 md:inset-x-8 md:top-10">
          <ArchMark className="walkin-intro h-12 w-12 shrink-0 md:h-14 md:w-14" />
          <div className="walkin-intro">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream md:text-[0.7rem]">
              {cafe.tagline}
            </p>
            <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cornflower md:text-[0.7rem]">
              {cafe.lockup}
            </p>
          </div>
        </div>

        <p className="absolute bottom-5 left-5 z-10 bg-navy px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream md:left-8">
          {cafe.lookPass}
        </p>
        <p className="absolute bottom-5 right-5 z-10 text-[0.6rem] text-cream/80 md:right-8">
          {cafe.photoCredit}
        </p>
      </div>
    </section>
  );
}
