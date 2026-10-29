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
import { CoverFlow } from "@/components/demos/cgr-rentals/CoverFlow";
import { Lookbook } from "@/components/demos/cgr-rentals/Lookbook";
import {
  Marquee,
  RentCursor,
  useReveal,
} from "@/components/demos/cgr-rentals/Kinetic";

const HOLD_STEPS = [
  ["Pick", "Choose a gown or tiara and your event date."],
  ["Check", "See the date open or booked before you message anyone."],
  ["Hold", "Send a request and keep the CGR code. The shop confirms."],
] as const;

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
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <>
      <RentCursor />
      <Story />
      <Marquee />
      <CoverFlow items={DRESSES} />

      <div ref={revealRef}>
        <section className="cgr-wrap cgr-steps" aria-labelledby="cgr-steps-title">
          <h2 className="cgr-h2" id="cgr-steps-title" data-rv>
            How a hold works
          </h2>
          <ol className="cgr-steps-list">
            {HOLD_STEPS.map(([t, d], i) => (
              <li key={t} className="cgr-step" data-rv>
                <span className="cgr-step-no" aria-hidden="true">
                  {i + 1}
                </span>
                <p className="cgr-step-t">{t}</p>
                <p className="cgr-step-d">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="cgr-wrap cgr-sec-head" data-rv>
          <h2 className="cgr-h2">All gowns</h2>
          <p className="cgr-mute">{DRESSES.length} sample listings · filter by fit and colour</p>
        </div>

        <section className="cgr-wrap cgr-filters" aria-label="Gown filters" data-rv>
          <div className="cgr-filter-block">
            <p className="cgr-filter-label" id="cgr-cat-label">
              Category
            </p>
            <div className="cgr-chips" role="group" aria-labelledby="cgr-cat-label">
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
          <div className="cgr-sec-head" data-rv>
            <h2 className="cgr-h2" id="cgr-acc-title">
              Accessories
            </h2>
            <p className="cgr-mute">
              Tiaras, crowns and jewelry · {ACCESSORIES.length} sample listings
            </p>
          </div>
          <Lookbook items={ACCESSORIES} />
          <div className="cgr-grid cgr-grid-acc" id="cgr-acc-grid">
            {ACCESSORIES.map((g) => (
              <ItemCard key={g.slug} item={g} />
            ))}
          </div>
        </section>

        <div className="cgr-wrap">
          <p className="cgr-note cgr-story-note" data-rv>
            {cgr.sampleNote}
          </p>
        </div>
      </div>

      <VisitSection />
    </>
  );
}

function ItemCard({ item: g }: { item: Gown }) {
  const img = g.images[0];
  return (
    <article className="cgr-card" data-rv>
      <Link
        href={`${CGR_BASE}/gown/${g.slug}`}
        className="cgr-card-link"
        data-cursor={g.category === "accessory" ? undefined : "rent"}
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
