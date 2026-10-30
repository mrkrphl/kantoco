"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CATEGORY_LABEL,
  CGR_ASSET,
  CGR_BASE,
  formatPhp,
  type Gown,
} from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * 3D cover-flow rail (a24-style). CSS 3D transforms on real photos, no models.
 * Inputs: drag / swipe, horizontal wheel or shift+wheel, page scroll (the rail
 * advances as the section passes), arrow keys and the two buttons.
 * Couture pass (r6): 24° tilt, shallow depth, 900ms ease-out snap.
 * Reduced motion: a flat, swipeable row with no 3D.
 */
export function CoverFlow({ items }: { items: Gown[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLAnchorElement[]>([]);
  const goRef = useRef<(i: number) => void>(() => {});
  const { ready, reduced } = useMotionReady();
  const [active, setActive] = useState(0);
  const n = items.length;

  useEffect(() => {
    const view = viewRef.current;
    const root = rootRef.current;
    if (!view || !root || !ready || reduced) return;
    const cards = cardsRef.current.slice(0, n);
    const st = { pos: 0 };
    let raf = 0;
    let lastActive = -1;
    let cardW = cards[0]?.offsetWidth || 280;

    const render = () => {
      raf = 0;
      const p = st.pos;
      const step1 = cardW * 0.62;
      const stepN = cardW * 0.3;
      cards.forEach((c, i) => {
        const o = i - p;
        const a = Math.abs(o);
        const sgn = Math.sign(o);
        const x = sgn * (Math.min(a, 1) * step1 + Math.max(a - 1, 0) * stepN);
        const ry = -clamp(o, -1, 1) * 24;
        const z = -Math.min(a, 3.2) * cardW * 0.25;
        c.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg)`;
        c.style.zIndex = String(100 - Math.round(a * 10));
        const op = a <= 1 ? 1 - a * 0.5 : a <= 2 ? 0.5 - (a - 1) * 0.28 : 0.22;
        c.style.opacity = a > 3.4 ? "0" : op.toFixed(3);
        c.style.visibility = a > 3.4 ? "hidden" : "visible";
        c.classList.toggle("is-front", a < 0.5);
      });
      const ai = clamp(Math.round(p), 0, n - 1);
      if (ai !== lastActive) {
        lastActive = ai;
        setActive(ai);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    let tween: gsap.core.Tween | null = null;
    let snapTimer = 0;
    const to = (target: number, dur = 0.9) => {
      tween?.kill();
      tween = gsap.to(st, {
        pos: clamp(target, 0, n - 1),
        duration: dur,
        ease: "power3.out",
        onUpdate: kick,
      });
    };
    const snapSoon = (ms = 160) => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => to(Math.round(st.pos), 0.9), ms);
    };
    const nudge = (d: number) => {
      tween?.kill();
      st.pos = clamp(st.pos + d, -0.35, n - 1 + 0.35);
      kick();
      snapSoon();
    };
    goRef.current = (i: number) => to(i);

    // Drag / swipe (pointer events; touch-action: pan-y keeps vertical page scroll).
    let down = false;
    let dragging = false;
    let sx = 0;
    let sy = 0;
    let sp = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let suppressClick = false;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      down = true;
      dragging = false;
      sx = lastX = e.clientX;
      sy = e.clientY;
      sp = st.pos;
      lastT = performance.now();
      vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!dragging) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - sy)) return;
        dragging = true;
        tween?.kill();
        window.clearTimeout(snapTimer);
        view.setPointerCapture(e.pointerId);
        view.classList.add("is-dragging");
      }
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = (e.clientX - lastX) / dt;
      lastX = e.clientX;
      lastT = now;
      st.pos = clamp(sp - dx / (cardW * 0.62), -0.4, n - 1 + 0.4);
      kick();
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (dragging) {
        suppressClick = true;
        view.classList.remove("is-dragging");
        const fling = -vel * 0.35;
        to(Math.round(st.pos + clamp(fling, -2, 2)));
      }
      dragging = false;
    };
    const onClick = (e: MouseEvent) => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      }
    };
    // Horizontal wheel / trackpad, or shift + wheel.
    const onWheel = (e: WheelEvent) => {
      const h = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!h) return;
      e.preventDefault();
      nudge(h / (cardW * 1.1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") to(Math.round(st.pos) + 1);
      else if (e.key === "ArrowLeft") to(Math.round(st.pos) - 1);
      else if (e.key === "Home") to(0);
      else if (e.key === "End") to(n - 1);
      else return;
      e.preventDefault();
    };
    // Keyboard focus on a card brings it to the front.
    const onFocus = (e: FocusEvent) => {
      const i = cards.indexOf(e.target as HTMLAnchorElement);
      if (i >= 0 && Math.round(st.pos) !== i) to(i);
    };

    // Page scroll advances the rail while the section is on screen.
    let lastProg = 0;
    const trig = ScrollTrigger.create({
      trigger: root,
      start: "top 80%",
      end: "bottom 30%",
      onUpdate: (self) => {
        const d = (self.progress - lastProg) * (n - 1);
        lastProg = self.progress;
        if (down) return;
        nudge(d);
      },
      onRefresh: (self) => {
        lastProg = self.progress;
      },
    });

    const onResize = () => {
      cardW = cards[0]?.offsetWidth || cardW;
      kick();
    };
    window.addEventListener("resize", onResize);
    view.addEventListener("pointerdown", onDown);
    view.addEventListener("pointermove", onMove);
    view.addEventListener("pointerup", onUp);
    view.addEventListener("pointercancel", onUp);
    view.addEventListener("click", onClick, true);
    view.addEventListener("wheel", onWheel, { passive: false });
    view.addEventListener("keydown", onKey);
    view.addEventListener("focusin", onFocus);
    root.dataset.flow = "on";
    render();

    return () => {
      trig.kill();
      tween?.kill();
      window.clearTimeout(snapTimer);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      view.removeEventListener("pointerdown", onDown);
      view.removeEventListener("pointermove", onMove);
      view.removeEventListener("pointerup", onUp);
      view.removeEventListener("pointercancel", onUp);
      view.removeEventListener("click", onClick, true);
      view.removeEventListener("wheel", onWheel);
      view.removeEventListener("keydown", onKey);
      view.removeEventListener("focusin", onFocus);
      delete root.dataset.flow;
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.opacity = "";
        c.style.zIndex = "";
        c.style.visibility = "";
      });
    };
  }, [ready, reduced, n, items]);

  const g = items[active];

  return (
    <section
      ref={rootRef}
      className="cgr-cf"
      id="gowns"
      aria-roledescription="carousel"
      aria-labelledby="cgr-cf-title"
    >
      <div className="cgr-wrap cgr-cf-head">
        <p className="cgr-micro">The rail · {items.length} example gowns</p>
        <h2 className="cgr-h2 cgr-cf-title" id="cgr-cf-title">
          Spin the <em>rail.</em>
        </h2>
        <p className="cgr-cf-hint cgr-micro">Drag, swipe, scroll or use the arrow keys</p>
      </div>
      <div
        ref={viewRef}
        className="cgr-cf-view"
        tabIndex={0}
        role="group"
        aria-label="Gown rail. Use left and right arrow keys."
      >
        <div className="cgr-cf-track">
          {items.map((it, i) => {
            const img = it.images[0];
            return (
              <Link
                key={it.slug}
                ref={(el) => {
                  if (el) cardsRef.current[i] = el;
                }}
                href={`${CGR_BASE}/gown/${it.slug}`}
                className="cgr-cf-card"
                data-cursor="link"
                draggable={false}
                aria-label={`${it.name}, ${formatPhp(it.pricePerDay)} per day sample. View and check dates.`}
              >
                <span className="cgr-cf-media">
                  <img
                    src={`${CGR_ASSET}/${img.file}.webp`}
                    alt=""
                    width={img.w}
                    height={img.h}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="cgr-wrap cgr-cf-foot">
        <div className="cgr-cf-caption" aria-live="polite">
          {/* Keyed so a new name mounts fresh (fades in) instead of shifting text. */}
          <div key={g.slug} className="cgr-cf-cap-in">
            <p className="cgr-micro cgr-cf-cat">No. {String(active + 1).padStart(2, "0")} · {CATEGORY_LABEL[g.category]}</p>
            <p className="cgr-cf-name">{g.name}</p>
            <p className="cgr-price cgr-cf-price">{formatPhp(g.pricePerDay)} a day</p>
          </div>
        </div>
        <div className="cgr-cf-bar">
          <p className="cgr-cf-count cgr-micro" aria-hidden="true">
            {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>
          <div className="cgr-cf-ctrls">
            <button
              type="button"
              className="cgr-cf-arrow cgr-textbtn"
              aria-label="Previous gown"
              onClick={() => goRef.current(active - 1)}
              disabled={active === 0}
            >
              Previous
            </button>
            <button
              type="button"
              className="cgr-cf-arrow cgr-textbtn"
              aria-label="Next gown"
              onClick={() => goRef.current(active + 1)}
              disabled={active === items.length - 1}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
