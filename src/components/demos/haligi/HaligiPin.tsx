"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HaligiPin({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (window.matchMedia("(max-width: 767px)").matches) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "+=56",
        pin: true,
        pinSpacing: true,
      });
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}
