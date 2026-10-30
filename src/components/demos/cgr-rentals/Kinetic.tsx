"use client";

import { useEffect, useRef } from "react";
import { useMotionReady } from "@/components/motion/useMotionReady";

const WORDS = ["Debut", "Pageant", "Prom", "Wedding", "Formal", "Cavite"];

/**
 * One slow Bodoni italic line (~90s per loop). CSS-driven (transform only),
 * paused on hover and whenever the band is off screen (IntersectionObserver).
 * Reduced motion: one static, centred line.
 */
export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionReady();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("is-live", e.isIntersecting),
      { rootMargin: "80px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("is-live");
    };
  }, [reduced]);

  // Two identical halves; the row slides by exactly one half per loop.
  const half = (key: string, hidden: boolean) => (
    <span className="cgr-mq-set" key={key} aria-hidden={hidden || undefined}>
      {[...WORDS, ...WORDS].map((w, i) => (
        <span className="cgr-mq-w" key={i}>
          {w}
          <span className="cgr-mq-sep" aria-hidden="true">
            ◆
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div ref={ref} className="cgr-mq">
      <p className="cgr-sr">Gowns for debut, pageant, prom, wedding and formal nights in Cavite.</p>
      <div className="cgr-mq-row" aria-hidden="true">
        {half("a", true)}
        {half("b", true)}
      </div>
    </div>
  );
}

/**
 * Fine champagne ring with a 3px dot that trails the pointer (lerp .12).
 * 20px at rest, 44px over links / buttons / cards, 36px while pressed.
 * Fine pointers only; hidden on touch and under reduced motion. The native
 * cursor stays visible.
 */
export function RingCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready || reduced) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    let shown = false;
    let mode = "";
    const loop = () => {
      cx += (x - cx) * 0.12;
      cy += (y - cy) * 0.12;
      el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        cx = x;
        cy = y;
        el.classList.add("is-on");
      }
      const t = e.target as Element | null;
      const next = t?.closest?.("a,button,select,input,textarea,label,[role=button],[data-cursor=link]")
        ? "link"
        : "";
      if (next !== mode) {
        mode = next;
        el.dataset.mode = mode;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      shown = false;
      el.classList.remove("is-on");
    };
    const onDown = () => el.classList.add("is-press");
    const onUp = () => el.classList.remove("is-press");
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [ready, reduced]);

  return (
    <div ref={ref} className="cgr-cursor" aria-hidden="true">
      <span className="cgr-cursor-ring" />
      <span className="cgr-cursor-dot" />
    </div>
  );
}

/**
 * Masked fade-up reveal (900ms, ease-out) for children marked [data-rv]
 * inside the ref'd container. 120ms stagger per parent, capped at 3 items.
 * Only items below the fold at load are hidden first, so nothing on screen
 * ever blinks (CLS-safe: opacity / transform / clip-path only).
 */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  const { ready, reduced } = useMotionReady();
  useEffect(() => {
    const root = ref.current;
    if (!root || !ready || reduced) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
    const vh = window.innerHeight;
    const pending = items.filter((el) => el.getBoundingClientRect().top > vh * 0.92);
    const groups = new Map<Element, number>();
    pending.forEach((el) => {
      const parent = el.parentElement ?? root;
      const n = groups.get(parent) ?? 0;
      groups.set(parent, n + 1);
      el.style.setProperty("--rv-d", `${Math.min(n, 2) * 120}ms`);
      el.classList.add("rv");
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rv-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    pending.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      items.forEach((el) => el.classList.remove("rv", "rv-in"));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduced, ...deps]);
  return ref;
}
