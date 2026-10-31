"use client";

import { useState } from "react";
import { REVIEWS_URL, SOURCE_LABEL, TESTIMONIALS, type Testimonial } from "./testimonials";

/** r7.11 (Design r7.11 home.html #reviews): Hillary M. first, then the rest in list order. */
const FIRST_ID = 7;
const LONG = 140;

/** The quote as words, with the curly quotes on the first and last word (verbatim text, no edits). */
function words(q: string): string[] {
  const w = q.split(/\s+/).filter(Boolean);
  if (!w.length) return w;
  w[0] = `\u201c${w[0]}`;
  w[w.length - 1] = `${w[w.length - 1]}\u201d`;
  return w;
}

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
              <p data-quote-id={t.id}>
                {/* r8.0: the visual quote is split into word masks so the
                    lines can rise out of their own boxes (HomeMotion B9);
                    screen readers get the whole verbatim quote once. */}
                <span className="sr-only">&ldquo;{t.quote}&rdquo;</span>
                <span className="r11-q" aria-hidden="true">
                  {words(t.quote).map((w, j) => (
                    <span key={j}>
                      {j ? " " : null}
                      <span className="r11-w">
                        <span>{w}</span>
                      </span>
                    </span>
                  ))}
                </span>
              </p>
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
