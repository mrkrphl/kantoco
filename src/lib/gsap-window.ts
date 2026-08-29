import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

declare global {
  interface Window {
    gsap: typeof gsap;
    ScrollTrigger: typeof ScrollTrigger;
  }
}

if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
  throw new Error("GSAP failed to import. Do not ship a CSS fallback.");
}

export function exposeGsap() {
  if (typeof window === "undefined") return;
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
}

if (typeof window !== "undefined") {
  exposeGsap();
}

/** One pinned viewport. Animate children, never the pinned node. */
export const DEMO_PIN = {
  pin: true,
  pinSpacing: true,
  scrub: 0.6,
  start: "top top",
  end: "+=220%",
  anticipatePin: 1,
  invalidateOnRefresh: true,
} as const;

export { gsap, ScrollTrigger, useGSAP };
