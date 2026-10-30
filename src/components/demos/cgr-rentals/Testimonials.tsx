"use client";

import { useState } from "react";
import { REVIEWS_URL, SOURCE_LABEL, TESTIMONIALS, type Testimonial } from "./testimonials";

/** r7.11 (Design r7.11 home.html #reviews): Hillary M. first, then the rest in list order. */
const FIRST_ID = 7;
const LONG = 140;

function order(items: Testimonial[]): Testimonial[] {
  const lead = items.filter((t) => t.id === FIRST_ID);
  return [...lead, ...items.filter((t) => t.id !== FIRST_ID)];
}

/**
 * "Kind words": one verbatim Google review at a time (CGR_FLAGS.reviewsOneAtATime).
 * Every quote is stacked in one grid cell so the box is the tallest quote
 * from the first paint (no shift when it changes); only the shown one is
 * visible to everyone, screen readers included. An empty list hides it.
 */
export function Testimonials({ items = TESTIMONIALS }: { items?: Testimonial[] }) {
  const list = order(items);
  const n = list.length;
  const [i, setI] = useState(0);
  if (!n) return null;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  return (
    <section id="reviews" className="r11-reviews" aria-labelledby="reviews-h">
      <p className="r11-script" aria-hidden="true">
        Kind words
      </p>
      <h2 id="reviews-h" className="sr-only">
        Reviews from Google
      </h2>
      <div className="r11-quotes" aria-live="polite">
        {list.map((t, k) => (
          <figure key={t.id} data-on={k === i ? "true" : "false"} aria-hidden={k === i ? undefined : true}>
            <blockquote className={t.quote.length > LONG ? "long" : undefined}>
              <p data-quote-id={t.id}>&ldquo;{t.quote}&rdquo;</p>
            </blockquote>
            <figcaption>
              {t.name} · {SOURCE_LABEL[t.source]} · {t.date}
              {typeof t.rating === "number" ? ` · ${t.rating} stars` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
      {n > 1 ? (
        <div className="r11-ctrl r11-ctrl-light">
          <button type="button" className="r11-arr" onClick={() => go(-1)} aria-label="Previous review">
            ←
          </button>
          <output>
            {i + 1} / {n}
          </output>
          <button type="button" className="r11-arr" onClick={() => go(1)} aria-label="Next review">
            →
          </button>
        </div>
      ) : null}
      <a className="r11-link" href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">
        All reviews on Google
      </a>
    </section>
  );
}
