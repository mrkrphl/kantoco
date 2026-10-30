"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";
import { CGR_ASSET, CGR_BASE, GOWNS, formatPhp, type Gown } from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, useGSAP);

/**
 * Round 7 mood board (stamp §4 Mood board, d03/m03). Cream with grain. Every
 * piece is a `.win` OS-window card (30px ink title bar, 2px ink border, 10px
 * hard shadow) laid out like a fitting-room table. Desktop: GSAP Draggable
 * with inertia inside the section, double-click to open. Phone: a stacked
 * pile with a ghost "Tap to shuffle" button. Reduced motion: a static board
 * (desktop) / static pile (phone) with plain links.
 */

type FilterId = "all" | "debut" | "pageant" | "formal" | "accessory";
const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "debut", label: "Debut" },
  { id: "pageant", label: "Pageant" },
  { id: "formal", label: "Formal" },
  { id: "accessory", label: "Accessories" },
];

/** Slots in % of the board (left, top), width in % of board width, a = h/w, r = deg. */
type Slot = { l: number; t: number; w: number; a: number; r: number };
const L12: Slot[] = [
  { l: 38, t: 7, w: 21, a: 1.45, r: -2 },
  { l: 81, t: 17, w: 16, a: 1.05, r: 5 },
  { l: 82.5, t: 45, w: 14, a: 1.2, r: -1 },
  { l: 61, t: 30, w: 18, a: 0.95, r: -3 },
  { l: 64, t: 3, w: 17, a: 1.0, r: 3 },
  { l: 58, t: 62, w: 15, a: 1.05, r: 2 },
  { l: 30.5, t: 64, w: 13, a: 0.75, r: 4 },
  { l: 31, t: 40, w: 15.5, a: 0.55, r: -6 },
  { l: 44, t: 66, w: 12, a: 0.8, r: -7 },
  { l: 74, t: 71, w: 13, a: 0.7, r: -4 },
  { l: 47, t: 45, w: 13, a: 0.4, r: 4 },
  { l: 88, t: 73, w: 10, a: 0.9, r: 5 },
];
const L6: Slot[] = [
  { l: 40, t: 8, w: 19, a: 0.8, r: -3 },
  { l: 62, t: 4, w: 17, a: 0.75, r: 4 },
  { l: 80, t: 14, w: 15, a: 0.9, r: -5 },
  { l: 46, t: 46, w: 16, a: 0.55, r: 5 },
  { l: 66, t: 42, w: 15, a: 0.8, r: -2 },
  { l: 83, t: 50, w: 12, a: 0.9, r: 3 },
];
const L2: Slot[] = [
  { l: 42, t: 6, w: 22, a: 1.4, r: -3 },
  { l: 67, t: 14, w: 20, a: 1.1, r: 4 },
];
const layoutFor = (k: number) => (k <= 2 ? L2 : k <= 6 ? L6 : L12);

const shortName = (g: Gown) => g.name.replace(/\s+gown$/i, "").toLowerCase();
const num = (g: Gown) => String(GOWNS.indexOf(g) + 1).padStart(2, "0");

const PHONE_Q = "(max-width: 899px)";
function subscribePhone(cb: () => void) {
  const m = window.matchMedia(PHONE_Q);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

export function MoodBoard() {
  const router = useRouter();
  const rootRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();
  const phone = useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE_Q).matches,
    () => false,
  );
  const [filter, setFilter] = useState<FilterId>("all");
  const items = useMemo(
    () => (filter === "all" ? GOWNS : GOWNS.filter((g) => g.category === filter)),
    [filter],
  );
  // Phone pile order (slugs, first = on top).
  const [order, setOrder] = useState<string[]>(() => GOWNS.map((g) => g.slug));
  const pile = useMemo(() => {
    const set = new Set(items.map((g) => g.slug));
    const ordered = order.filter((s) => set.has(s));
    return items.map((g) => ({ g, d: ordered.indexOf(g.slug) }));
  }, [items, order]);
  const topSlug = pile.find((p) => p.d === 0)?.g.slug;
  const busy = useRef(false);

  // #accessories opens the board on the accessories filter.
  useEffect(() => {
    const sync = () => {
      if (window.location.hash === "#accessories") setFilter("accessory");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Desktop: drop-in once on enter (re-run on filter change) + Draggable.
  useGSAP(
    () => {
      const root = rootRef.current;
      const board = boardRef.current;
      if (!root || !board || !ready || reduced || phone) return;
      const cards = gsap.utils.toArray<HTMLElement>(".win", board);
      if (!cards.length) return;
      const rest = cards.map((c) => Number(c.dataset.r) || 0);
      gsap.set(cards, { x: 0, y: 0, scale: 1, rotation: (i) => rest[i] });

      gsap.set(cards, {
        autoAlpha: 0,
        y: -40,
        rotation: (i) => rest[i] + (i % 2 ? 12 : -12),
      });
      const drop = () =>
        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          rotation: (i) => rest[i],
          duration: 0.8,
          ease: "back.out(1.4)",
          stagger: 0.05,
          overwrite: "auto",
        });
      const st = ScrollTrigger.create({ trigger: board, start: "top 75%", once: true, onEnter: drop });

      let z = 50;
      const drags = cards.map((card) =>
        Draggable.create(card, {
          type: "x,y",
          bounds: root,
          inertia: true,
          edgeResistance: 0.8,
          zIndexBoost: false,
          minimumMovement: 4,
          onPress() {
            z += 1;
            card.style.zIndex = String(z);
            card.classList.add("is-held");
            gsap.to(card, { scale: 1.04, rotation: 0, duration: 0.18, ease: "power2.out", overwrite: "auto" });
          },
          onRelease() {
            card.classList.remove("is-held");
            gsap.to(card, {
              scale: 1,
              rotation: gsap.utils.random(-5, 5, 0.5),
              duration: 0.5,
              ease: "back.out(1.6)",
            });
          },
        })[0],
      );
      return () => {
        st.kill();
        drags.forEach((d) => d.kill());
        cards.forEach((c) => (c.style.zIndex = ""));
      };
    },
    { scope: rootRef, dependencies: [ready, reduced, phone, filter], revertOnUpdate: true },
  );

  const shuffle = () => {
    if (busy.current || pile.length < 2 || !topSlug) return;
    const rot = (list: string[]) => {
      const i = list.indexOf(topSlug);
      const next = list.slice();
      next.splice(i, 1);
      // Under the last visible piece of this filter.
      const set = new Set(items.map((g) => g.slug));
      let last = -1;
      next.forEach((s, j) => {
        if (set.has(s)) last = j;
      });
      next.splice(last + 1, 0, topSlug);
      return next;
    };
    const el = boardRef.current?.querySelector<HTMLElement>(`.win[data-slug="${topSlug}"]`);
    if (!el || reduced) {
      setOrder(rot);
      return;
    }
    busy.current = true;
    gsap.to(el, {
      xPercent: 110,
      rotation: 14,
      duration: 0.45,
      ease: "power3.in",
      onComplete: () => {
        setOrder(rot);
        gsap.to(el, {
          xPercent: 0,
          rotation: 0,
          duration: 0.35,
          ease: "power3.out",
          clearProps: "transform",
          onComplete: () => {
            busy.current = false;
          },
        });
      },
    });
  };

  const slots = layoutFor(items.length);
  const topIdx = Math.max(0, items.findIndex((g) => g.slug === topSlug));
  const count = (id: FilterId) => (id === "all" ? GOWNS.length : GOWNS.filter((g) => g.category === id).length);

  return (
    <section ref={rootRef} className="cgr-mb cream grain" id="gowns" aria-labelledby="cgr-mb-title">
      <span id="accessories" className="cgr-anchor" aria-hidden="true" />
      <svg className="cgr-mb-wave cgr-mb-wave-desk" viewBox="0 0 1440 140" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 H1440 V40 C 1100 40 980 120 640 120 C 360 120 200 70 0 70 Z" />
      </svg>
      <svg className="cgr-mb-wave cgr-mb-wave-phone" viewBox="0 0 390 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 0 H390 V20 C 280 20 230 52 140 52 C 70 52 40 36 0 36 Z" />
      </svg>

      <div className="cgr-mb-text">
        <h2 className="cgr-mb-title ext" id="cgr-mb-title">
          Every gown, on the table.
        </h2>
        <p className="cgr-mb-copy">
          Twelve pieces, laid out like a fitting-room mood board. Drag them around, stack the ones you like, and open one
          to check its dates.
        </p>
        <div className="cgr-mb-filters" role="group" aria-label="Filter pieces">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="cgr-chip"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <sup className="mono">{count(f.id)}</sup>
            </button>
          ))}
        </div>
      </div>

      <div ref={boardRef} className="cgr-mb-board" data-count={items.length}>
        {pile.map(({ g, d }, i) => {
          const s = slots[i % slots.length];
          const img = g.images[0];
          const href = `${CGR_BASE}/gown/${g.slug}`;
          const hidden = phone && d > 0;
          return (
            <article
              key={g.slug}
              className="win"
              data-slug={g.slug}
              data-r={s.r}
              style={
                {
                  "--l": `${s.l}%`,
                  "--t": `${s.t}%`,
                  "--w": `${s.w}%`,
                  "--a": s.a,
                  "--r": `${s.r}deg`,
                  "--d": d,
                } as React.CSSProperties
              }
              inert={hidden || undefined}
              onDoubleClick={() => {
                if (!phone && !reduced) router.push(href);
              }}
            >
              <p className="win-bar mono">
                <span className="win-name">
                  {num(g)} {shortName(g)}
                </span>
                <span>{formatPhp(g.pricePerDay)}/day</span>
              </p>
              <Link
                href={href}
                className="win-ph"
                draggable={false}
                aria-label={`Open ${g.name}, ${formatPhp(g.pricePerDay)} a day (example), and check dates`}
                onClick={(e) => {
                  // Desktop motion: single click is pick-up; double-click (or Enter) opens.
                  if (!phone && !reduced && e.detail > 0) e.preventDefault();
                }}
              >
                <img
                  src={`${CGR_ASSET}/${img.file}.webp`}
                  alt=""
                  width={img.w}
                  height={img.h}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </Link>
            </article>
          );
        })}
        <p className="cgr-mb-hint mono" aria-hidden="true">
          <span className="cgr-mb-grab" />
          {reduced ? "click one to open" : "drag, or double-click to open"}
        </p>
      </div>

      <div className="cgr-mb-shuffle">
        <button type="button" className="btn btn-ghost" onClick={shuffle} disabled={pile.length < 2}>
          Tap to shuffle
        </button>
        <p className="mono" aria-live="polite">
          {topIdx + 1} of {items.length} on top
        </p>
      </div>
    </section>
  );
}
