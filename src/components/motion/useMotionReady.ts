"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { waitForFonts } from "@/lib/motion";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useMotionReady() {
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let live = true;
    waitForFonts().then(() => {
      if (live) setFontsReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  return { ready: reduced || fontsReady, reduced };
}
