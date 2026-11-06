"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CGR_BASE, type Gown } from "@/lib/cgr-rentals";
import { GownImg } from "@/components/demos/cgr-rentals/GownImg";

/**
 * r7.11 "the Rail" (Design r7.11 home.html #rail): every piece, one at a
 * time, on the dark band. The front card plus a dim neighbour each side
 * (hidden at 390); one name, one button, ← n / N →. Arrows, arrow keys and
 * a swipe step it; nothing moves on its own. Photos are contained, never
 * cropped. Reduced motion: no fade.
 */
export function Rail({ items }: { items: Gown[] }) {
  const n = items.length;
  const [i, setI] = useState(0);
  const x0 = useRef<number | null>(null);
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const at = (d: number) => items[(i + d + n) % n];
  const g = items[i];

  return (
    <section id="rail" className="r11-rail r11-dark" aria-labelledby="rail-h">
      <div className="r11-rail-head">
        <p className="r11-script" aria-hidden="true">
          the Rail
        </p>
        <h2 id="rail-h" className="r11-small">
          All {n} pieces, one at a time.
        </h2>
      </div>
      <div
        className="r11-rail-flow"
        role="group"
        aria-roledescription="carousel"
        aria-label="All pieces"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
        onPointerDown={(e) => {
          x0.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (x0.current === null) return;
          const dx = e.clientX - x0.current;
          x0.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className="r11-card side l" aria-hidden="true">
          <GownImg img={at(-1).images[0]} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="r11-card c r11-fade" key={g.slug}>
          <GownImg img={g.images[0]} loading="lazy" decoding="async" draggable={false} />
        </div>
        <div className="r11-card side r" aria-hidden="true">
          <GownImg img={at(1).images[0]} alt="" loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="r11-rail-meta">
        <p className="r11-rail-nm" aria-live="polite">
          {g.name}
        </p>
        <Link className="r11-btn r11-ivory r11-sm" href={`${CGR_BASE}/gown/${g.slug}`}>
          {g.category === "accessory" ? "Reserve this piece" : "Reserve this gown"}
        </Link>
        <div className="r11-ctrl">
          <button type="button" className="r11-arr" onClick={() => go(-1)} aria-label="Previous piece">
            ←
          </button>
          <output aria-live="off">
            {i + 1} / {n}
          </output>
          <button type="button" className="r11-arr" onClick={() => go(1)} aria-label="Next piece">
            →
          </button>
        </div>
      </div>
    </section>
  );
}
