"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useMotionReady } from "@/components/motion/useMotionReady";

/**
 * Round 7 kinetic helpers (stamp §6). The r6 RingCursor and serif Marquee
 * are retired. What stays: the line reveal and the magnet button.
 */

/**
 * Line reveal for children marked [data-rv] inside the ref'd container:
 * clip inset(100% 0 0 0) -> inset(0), 0.7s, 80ms stagger per parent (capped).
 * Only items below the fold at load are hidden first, so nothing on screen
 * blinks (CLS-safe: clip-path and transform only). Reduced motion: instant.
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
      el.style.setProperty("--rv-d", `${Math.min(n, 4) * 80}ms`);
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
      { rootMargin: "0px 0px -6% 0px", threshold: 0.1 },
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

/**
 * Magnet button (stamp §5/§6): a hot circle that pulls toward the pointer
 * within 120px, max 18px (quickTo), its label moving 1.4x as far; snaps back
 * with elastic.out(1, .4) over 0.8s. Fine pointers only; reduced motion and
 * touch get a plain link.
 */
export function Magnet({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { ready, reduced } = useMotionReady();
  useEffect(() => {
    const el = ref.current;
    if (!el || !ready || reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const label = el.querySelector<HTMLElement>(".magnet-l");
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const lxTo = label ? gsap.quickTo(label, "x", { duration: 0.35, ease: "power3.out" }) : null;
    const lyTo = label ? gsap.quickTo(label, "y", { duration: 0.35, ease: "power3.out" }) : null;
    let rect: DOMRect | null = null;
    let near = false;
    const MAX = 18;
    const RANGE = 120;
    // Rest rect (without the magnet offset), re-read after any scroll.
    const measure = () => {
      const r = el.getBoundingClientRect();
      const ox = Number(gsap.getProperty(el, "x")) || 0;
      const oy = Number(gsap.getProperty(el, "y")) || 0;
      rect = new DOMRect(r.left - ox, r.top - oy, r.width, r.height);
    };
    const onMove = (e: PointerEvent) => {
      if (!rect) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      const reach = rect.width / 2 + RANGE;
      if (d < reach) {
        near = true;
        const k = (1 - d / reach) * 1.6;
        const mx = gsap.utils.clamp(-MAX, MAX, dx * 0.25 * k);
        const my = gsap.utils.clamp(-MAX, MAX, dy * 0.25 * k);
        xTo(mx);
        yTo(my);
        lxTo?.(mx * 0.4);
        lyTo?.(my * 0.4);
      } else if (near) {
        near = false;
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)", overwrite: true });
        if (label) gsap.to(label, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)", overwrite: true });
      }
    };
    // Measure lazily on the next pointer move after a scroll.
    const onScroll = () => {
      rect = null;
    };
    const onAny = (e: PointerEvent) => {
      if (!rect) measure();
      onMove(e);
    };
    window.addEventListener("pointermove", onAny, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onAny);
      window.removeEventListener("scroll", onScroll);
      gsap.set([el, label].filter(Boolean), { x: 0, y: 0 });
    };
  }, [ready, reduced]);
  return (
    <a ref={ref} href={href} className={`magnet ${className}`.trim()}>
      <span className="magnet-l">{children}</span>
    </a>
  );
}
