"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  CGR_ASSET,
  CGR_BASE,
  COLORS,
  GOWNS,
  SIZES,
  cgr,
  formatPhp,
  type GownCategory,
  type GownColor,
  type GownSize,
} from "@/lib/cgr-rentals";
import { VisitSection } from "@/components/demos/cgr-rentals/Visit";

export function Catalogue() {
  const [cat, setCat] = useState<GownCategory | "all">("all");
  const [color, setColor] = useState<GownColor | "all">("all");
  const [size, setSize] = useState<GownSize | "all">("all");

  const filtered = useMemo(() => {
    return GOWNS.filter((g) => {
      if (cat !== "all" && g.category !== cat) return false;
      if (color !== "all" && !g.colors.includes(color)) return false;
      if (size !== "all" && !g.sizes.includes(size)) return false;
      return true;
    });
  }, [cat, color, size]);

  return (
    <>
      <section className="cgr-wrap cgr-hero" aria-label="Catalogue">
        <div className="cgr-hero-copy">
          <h1 className="cgr-h1">Rent the look. Hold the date.</h1>
          <p className="cgr-lead">{cgr.tagline}</p>
          <p className="cgr-note">{cgr.sampleNote}</p>
        </div>
        <div className="cgr-hero-stat" aria-label="Sample commission model">
          <p className="cgr-stat-kicker">Commission model</p>
          <p className="cgr-stat-num">₱200</p>
          <p className="cgr-stat-sub">per booking · counted in Owner</p>
        </div>
      </section>

      <section className="cgr-wrap cgr-filters" aria-label="Filters">
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
          <p className="cgr-empty">No items match these filters.</p>
        ) : (
          filtered.map((g) => {
            const img = g.images[0];
            return (
              <article className="cgr-card" key={g.slug}>
                <Link
                  href={`${CGR_BASE}/gown/${g.slug}`}
                  className="cgr-card-link"
                >
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
                    <h2 className="cgr-card-name">{g.name}</h2>
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
          })
        )}
      </section>

      <VisitSection />
    </>
  );
}
