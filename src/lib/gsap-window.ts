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

export { gsap, ScrollTrigger, useGSAP };
