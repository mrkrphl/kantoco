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
  RingCursor,
  useReveal,
} from "@/components/demos/cgr-rentals/Kinetic";

const HOLD_STEPS = [
  ["I", "Pick", "Choose a gown or tiara and your event date."],
  ["II", "Check", "See the date open or held before you message anyone."],
  ["III", "Hold", "Send a request and keep the CGR code. The shop confirms."],
] as const;

const NUM = (n: number) => String(n).padStart(2, "0");

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
  // Editorial layout (feature card + pull quote) only for the full rail.
  const editorial = filtered.length === DRESSES.length;
  const tiara = ACCESSORIES[0];

  return (
    <>
      <RingCursor />
      <Story />
      <Marquee />
      <CoverFlow items={DRESSES} />

      <div ref={revealRef}>
        <section className="cgr-wrap cgr-steps" id="holds" aria-labelledby="cgr-steps-title">
          <div className="cgr-sec-head" data-rv>
            <p className="cgr-micro">How a hold works</p>
            <h2 className="cgr-h2" id="cgr-steps-title">
              Three quiet <em>steps.</em>
            </h2>
          </div>
          <ol className="cgr-steps-list">
            {HOLD_STEPS.map(([n, t, d]) => (
              <li key={t} className="cgr-step" data-rv>
                <span className="cgr-step-no" aria-hidden="true">
                  {n}
                </span>
                <p className="cgr-step-t">{t}</p>
                <p className="cgr-step-d">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="cgr-wrap cgr-sec-head" id="all-gowns" data-rv>
          <p className="cgr-micro">The collection · {DRESSES.length} example gowns</p>
          <h2 className="cgr-h2">
            All <em>gowns.</em>
          </h2>
        </div>

        <section className="cgr-wrap cgr-filters" aria-label="Gown filters" data-rv>
          <div className="cgr-tabs" role="group" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={cat === c.id ? "cgr-tab is-on" : "cgr-tab"}
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
              >
                {c.id === "all" ? "All gowns" : c.label}
              </button>
            ))}
            <a className="cgr-tab" href="#accessories">
              Accessories
            </a>
          </div>
          <div className="cgr-filter-row">
            <label className="cgr-field">
              <span className="cgr-micro">Colour</span>
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
              <span className="cgr-micro">Size</span>
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
            <p className="cgr-count cgr-micro" aria-live="polite">
              {filtered.length} gown{filtered.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        <section
          className={editorial ? "cgr-wrap cgr-grid is-editorial" : "cgr-wrap cgr-grid"}
          aria-label="Gowns"
        >
          {filtered.length === 0 ? (
            <p className="cgr-empty">No gowns match these filters.</p>
          ) : (
            filtered.map((g, i) => (
              <ItemCard key={g.slug} item={g} no={DRESSES.indexOf(g) + 1} feature={editorial && i === 0} />
            ))
          )}
          {editorial ? (
            <>
              <aside className="cgr-quote" data-rv>
                <p className="cgr-quote-t">
                  “Pick the gown, check the date, keep the code. The shop confirms.”
                </p>
                <a className="cgr-link" href="#holds">
                  How holds work
                </a>
              </aside>
              {tiara ? (
                <article className="cgr-card cgr-card-acc" data-rv>
                  <a href="#accessories" className="cgr-card-link" data-cursor="link">
                    <span className="ff">
                      <span className="ff-img">
                        <img
                          src={`${CGR_ASSET}/${tiara.images[0].file}.webp`}
                          alt=""
                          width={tiara.images[0].w}
                          height={tiara.images[0].h}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                    </span>
                    <span className="cgr-card-row">
                      <span className="cgr-micro">Accessories</span>
                      <span className="cgr-micro">{ACCESSORIES.length} pieces</span>
                    </span>
                    <span className="cgr-card-name">Tiaras, crowns and crystals</span>
                    <span className="cgr-price">
                      from {formatPhp(Math.min(...ACCESSORIES.map((a) => a.pricePerDay)))} a day
                    </span>
                  </a>
                </article>
              ) : null}
            </>
          ) : null}
        </section>

        <section
          className="cgr-wrap cgr-acc"
          id="accessories"
          aria-labelledby="cgr-acc-title"
        >
          <div className="cgr-sec-head" data-rv>
            <p className="cgr-micro">Tiaras, crowns and jewellery · {ACCESSORIES.length} examples</p>
            <h2 className="cgr-h2" id="cgr-acc-title">
              The crown <em>room.</em>
            </h2>
          </div>
          <Lookbook items={ACCESSORIES} />
          <div className="cgr-grid cgr-grid-acc" id="cgr-acc-grid">
            {ACCESSORIES.map((g, i) => (
              <ItemCard key={g.slug} item={g} no={i + 1} />
            ))}
          </div>
        </section>

        <div className="cgr-wrap">
          <p className="cgr-note" data-rv>
            {cgr.sampleNote}
          </p>
        </div>
      </div>

      <VisitSection />
    </>
  );
}

function ItemCard({ item: g, no, feature = false }: { item: Gown; no: number; feature?: boolean }) {
  const img = g.images[0];
  return (
    <article className={feature ? "cgr-card is-feature" : "cgr-card"} data-rv>
      <Link href={`${CGR_BASE}/gown/${g.slug}`} className="cgr-card-link" data-cursor="link">
        <span className="ff">
          <span className="ff-img">
            <img
              src={`${CGR_ASSET}/${img.file}.webp`}
              alt={img.alt}
              width={img.w}
              height={img.h}
              loading="lazy"
              decoding="async"
            />
          </span>
        </span>
        <span className="cgr-card-row">
          <span className="cgr-micro">
            No. {NUM(no)} · {CATEGORY_LABEL[g.category]}
          </span>
          <span className="cgr-micro cgr-card-meta">{g.sizes.join(" · ")}</span>
        </span>
        <span className="cgr-card-name">{g.name}</span>
        <span className="cgr-price">{formatPhp(g.pricePerDay)} a day</span>
      </Link>
    </article>
  );
}
