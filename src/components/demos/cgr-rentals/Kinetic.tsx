"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["Gowns", "Debut", "Prom", "Wedding", "Cavite"];

/**
 * Kinetic marquee: loops on its own, speeds up and leans with scroll
 * velocity, flips direction with scroll direction, pauses off screen.
 * Solid colours only (contrast-safe). Reduced motion: one static line.
 */
export function Marquee() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready || reduced) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>(".cgr-mq-row"));
    const tweens = rows.map((row, i) =>
      gsap.fromTo(
        row,
        { xPercent: i % 2 ? -50 : 0 },
        { xPercent: i % 2 ? 0 : -50, duration: 26 + i * 6, ease: "none", repeat: -1 },
      ),
    );
    const skewTo = rows.map((row) =>
      gsap.quickTo(row, "skewX", { duration: 0.4, ease: "power3.out" }),
    );
    let dir = 1;
    let skewTimer = 0;
    const boost = { v: 1 };
    const st = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      onUpdate: (self) => {
        const v = self.getVelocity();
        dir = self.direction;
        const amt = Math.min(Math.abs(v) / 300, 5);
        gsap.to(boost, {
          v: dir * (1 + amt),
          duration: 0.15,
          overwrite: true,
          onUpdate: () => tweens.forEach((t) => t.timeScale(boost.v)),
          onComplete: () => {
            gsap.to(boost, {
              v: dir,
              duration: 1.1,
              ease: "power2.out",
              onUpdate: () => tweens.forEach((t) => t.timeScale(boost.v)),
            });
          },
        });
        const sk = gsap.utils.clamp(-12, 12, -v / 220);
        skewTo.forEach((q) => q(sk));
        window.clearTimeout(skewTimer);
        skewTimer = window.setTimeout(() => skewTo.forEach((q) => q(0)), 120);
      },
    });
    // Start deep into the loop so a reversed (scroll-up) timeScale never hits time 0.
    tweens.forEach((t) => t.totalTime(t.duration() * 500));
    if (!st.isActive) tweens.forEach((t) => t.pause());
    return () => {
      st.kill();
      window.clearTimeout(skewTimer);
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(boost);
      gsap.set(rows, { clearProps: "all" });
    };
  }, [ready, reduced]);

  const line = (accent: boolean) =>
    Array.from({ length: 4 }, (_, k) => (
      <span className="cgr-mq-set" key={k} aria-hidden={k > 0 ? true : undefined}>
        {WORDS.map((w, i) => (
          <span key={w} className={(i + (accent ? 1 : 0)) % 2 ? "cgr-mq-w is-gold" : "cgr-mq-w"}>
            {w}
            <span className="cgr-mq-dot" aria-hidden="true">
              ·
            </span>
          </span>
        ))}
      </span>
    ));

  return (
    <div ref={rootRef} className="cgr-mq">
      <p className="cgr-sr">Gowns · Debut · Prom · Wedding · Cavite</p>
      <div className="cgr-mq-row" aria-hidden="true">
        {line(false)}
      </div>
      <div className="cgr-mq-row cgr-mq-row--2" aria-hidden="true">
        {line(true)}
      </div>
    </div>
  );
}

/**
 * Cursor ring (Nomi-style companion, kept tiny): a gold ring that follows the
 * pointer with a little lag and grows into a "Rent me" pill over gowns.
 * Fine pointers only, never on touch, off under reduced motion.
 */
export function RentCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready || reduced) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mq.matches) return;
    const root = document.documentElement;
    root.classList.add("cgr-has-cursor");
    let x = -100;
    let y = -100;
    let cx = x;
    let cy = y;
    let raf = 0;
    let shown = false;
    let mode = "";
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
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
      const next = t?.closest?.("[data-cursor=rent]")
        ? "rent"
        : t?.closest?.("a,button,select,input,textarea,label,[role=button]")
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
      root.classList.remove("cgr-has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [ready, reduced]);

  return (
    <div ref={ref} className="cgr-cursor" aria-hidden="true">
      <span className="cgr-cursor-ring" />
      <span className="cgr-cursor-label">Rent me</span>
    </div>
  );
}

/**
 * Staggered fade-up reveal for children marked [data-rv] inside the ref'd
 * container. Only items below the fold at load are hidden first, so nothing
 * on screen ever blinks (CLS-safe: opacity/transform only).
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
      el.style.setProperty("--rv-d", `${Math.min(n, 6) * 70}ms`);
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
