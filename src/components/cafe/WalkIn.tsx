"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cafe, walkIn } from "@/lib/cafe";
import ArchMark from "./ArchMark";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function chapterOpacity(index: number, progress: number, count: number) {
  const start = index / count;
  const end = (index + 1) / count;
  const fade = 0.08;
  if (progress < start || progress > end) return 0;
  let opacity = 1;
  if (index > 0 && progress < start + fade) {
    opacity = (progress - start) / fade;
  }
  if (index < count - 1 && progress > end - fade) {
    opacity = Math.min(opacity, (end - progress) / fade);
  }
  return Math.max(0, Math.min(1, opacity));
}

export default function WalkIn() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const pin = rootRef.current;
      const stage = stageRef.current;
      if (!pin || !stage) return;

      const apply = (p: number) => {
        const count = walkIn.length;
        layerRefs.current.forEach((el, i) => {
          if (!el) return;
          const opacity = chapterOpacity(i, p, count);
          const visible = opacity > 0.02;
          el.style.opacity = String(opacity);
          el.style.visibility = visible ? "visible" : "hidden";
          if (visible) {
            const start = i / count;
            const local = Math.min(1, Math.max(0, (p - start) / (1 / count)));
            el.style.transform = `scale(${1.06 - local * 0.06})`;
          }
        });
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        apply(0);
        gsap.from(".walkin-intro", {
          y: 24,
          autoAlpha: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: "power3.out",
        });

        ScrollTrigger.create({
          trigger: pin,
          start: "top top",
          end: "+=280%",
          pin: true,
          scrub: 0.7,
          anticipatePin: 1,
          onUpdate: (self) => apply(self.progress),
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        stage.style.height = "auto";
        layerRefs.current.forEach((el) => {
          if (!el) return;
          el.style.opacity = "1";
          el.style.visibility = "visible";
          el.style.transform = "none";
          el.style.position = "relative";
          el.style.height = "100svh";
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="walkin overflow-hidden bg-navy">
      <div ref={stageRef} className="relative h-[100svh]">
        {walkIn.map((chapter, i) => (
          <div
            key={chapter.key}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className="absolute inset-0 origin-center will-change-transform"
            style={{
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? "visible" : "hidden",
            }}
          >
            <Image
              src={chapter.src}
              alt={chapter.alt}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy/70 via-navy/25 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-navy/20"
              aria-hidden
            />
            <div className="absolute inset-x-5 bottom-16 max-w-3xl md:inset-x-8 md:bottom-20">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cornflower-2">
                {chapter.kicker}
              </p>
              <p className="mt-2 font-[family-name:var(--font-cafe-display)] text-[clamp(3.4rem,14vw,8rem)] leading-[0.82] tracking-[-0.03em] text-cream">
                {chapter.title}
              </p>
              <p
                className={`mt-4 text-cream ${
                  "italic" in chapter && chapter.italic
                    ? "font-[family-name:var(--font-cafe-accent)] text-xl italic md:text-2xl"
                    : "font-[family-name:var(--font-cafe-display)] text-2xl tracking-tight md:text-4xl"
                }`}
              >
                {chapter.line}
              </p>
            </div>
          </div>
        ))}

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
