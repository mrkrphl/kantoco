"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CGR_ASSET,
  CGR_BASE,
  COLORS,
  ACCESSORIES,
  DRESSES,
  SIZES,
  cgr,
  formatPhp,
  type Gown,
  type GownCategory,
  type GownColor,
  type GownSize,
} from "@/lib/cgr-rentals";
import { VisitSection } from "@/components/demos/cgr-rentals/Visit";
import { Story } from "@/components/demos/cgr-rentals/Story";

export function Catalogue() {
  const [cat, setCat] = useState<GownCategory | "all">("all");
  const [color, setColor] = useState<GownColor | "all">("all");
  const [size, setSize] = useState<GownSize | "all">("all");

  const filtered = useMemo(() => {
    return DRESSES.filter((g) => {
      if (cat !== "all" && g.category !== cat) return false;
      if (color !== "all" && !g.colors.includes(color)) return false;
      if (size !== "all" && !g.sizes.includes(size)) return false;
      return true;
    });
  }, [cat, color, size]);

  return (
    <>
      <Story />
      <div className="cgr-wrap">
        <p className="cgr-note cgr-story-note">{cgr.sampleNote}</p>
      </div>

      <div className="cgr-wrap cgr-sec-head" id="gowns">
        <h2 className="cgr-h2">Gowns</h2>
        <p className="cgr-mute">{DRESSES.length} sample listings</p>
      </div>

      <section className="cgr-wrap cgr-filters" aria-label="Gown filters">
        <div className="cgr-filter-block">
          <p className="cgr-filter-label" id="cgr-cat-label">
            Category
          </p>
          <div
            className="cgr-chips"
            role="group"
            aria-labelledby="cgr-cat-label"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={cat === c.id ? "cgr-chip-btn is-on" : "cgr-chip-btn"}
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="cgr-filter-row">
          <label className="cgr-field">
            <span>Color</span>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value as GownColor | "all")}
            >
              {COLORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="cgr-field">
            <span>Size</span>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as GownSize | "all")}
            >
              {SIZES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <p className="cgr-count" aria-live="polite">
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <section className="cgr-wrap cgr-grid" aria-label="Gowns">
        {filtered.length === 0 ? (
          <p className="cgr-empty">No gowns match these filters.</p>
        ) : (
          filtered.map((g) => <ItemCard key={g.slug} item={g} />)
        )}
      </section>

      <section
        className="cgr-wrap cgr-acc"
        id="accessories"
        aria-labelledby="cgr-acc-title"
      >
        <div className="cgr-sec-head">
          <h2 className="cgr-h2" id="cgr-acc-title">
            Accessories
          </h2>
          <p className="cgr-mute">
            Tiaras, crowns and jewelry · {ACCESSORIES.length} sample listings
          </p>
        </div>
        <div className="cgr-grid cgr-grid-acc">
          {ACCESSORIES.map((g) => (
            <ItemCard key={g.slug} item={g} />
          ))}
        </div>
      </section>

      <VisitSection />
    </>
  );
}

function ItemCard({ item: g }: { item: Gown }) {
  const img = g.images[0];
  return (
    <article className="cgr-card">
      <Link href={`${CGR_BASE}/gown/${g.slug}`} className="cgr-card-link">
        <div className="cgr-card-media">
          <img
            src={`${CGR_ASSET}/${img.file}.webp`}
            alt={img.alt}
            width={img.w}
            height={img.h}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="cgr-card-body">
          <p className="cgr-card-cat">{CATEGORY_LABEL[g.category]}</p>
          <h3 className="cgr-card-name">{g.name}</h3>
          <p className="cgr-card-meta">
            {g.sizes.join(" · ")} · {g.colors.join(", ")}
          </p>
          <p className="cgr-card-price">
            {formatPhp(g.pricePerDay)}
            <span> / day · sample</span>
          </p>
        </div>
      </Link>
    </article>
  );
}
