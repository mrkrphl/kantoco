export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function waitForFonts(ms = 1600) {
  const ready = document.fonts?.ready ?? Promise.resolve();
  const timeout = new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
  return Promise.race([ready.then(() => undefined), timeout]);
}

/** Opener beat 1: fonts.ready + 250ms, or 1200ms after DOMContentLoaded. */
export function waitForOpenerLine() {
  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(() => window.setTimeout(finish, 250));
    const fallback = () => window.setTimeout(finish, 1200);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fallback, { once: true });
    } else {
      fallback();
    }
  });
}

export function revealOnScroll(
  gsap: typeof import("gsap").gsap,
  targets: HTMLElement[],
) {
  targets.forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });
}
