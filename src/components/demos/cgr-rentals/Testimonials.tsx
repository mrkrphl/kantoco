"use client";

import { useId, useState } from "react";
import { REVIEWS_URL, TESTIMONIALS, type Testimonial } from "./testimonials";

/** Shown before "More reviews" opens the rest. */
const FIRST = 4;

const SOURCE_LABEL: Record<Testimonial["source"], string> = {
  Google: "Google review",
  Facebook: "Facebook",
  Instagram: "Instagram",
  TikTok: "TikTok",
};

/**
 * r7.6.4 reviews, in the r7.6 editorial style: Cormorant pull-quotes with a
 * Figtree attribution line (name, source, relative date, rating as text).
 * No avatars, faces or star images. The quotes render verbatim from
 * testimonials.ts; an empty list renders nothing. The rest open below the
 * first four (a user action, so the growth is not scored as CLS).
 */
export function Testimonials({ items = TESTIMONIALS }: { items?: Testimonial[] }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  if (items.length === 0) return null;
  const more = items.length > FIRST;
  return (
    <section className="cgr-tm creamy" id="reviews" aria-labelledby="cgr-tm-t">
      <div className="cgr-tm-in">
        <header className="cgr-tm-head">
          <p className="cgr-tm-kick">From our clients</p>
          <h2 className="cgr-tm-h disp" id="cgr-tm-t">
            Kind <em>words</em>
          </h2>
        </header>
        <ul className="cgr-tm-list" id={listId}>
          {items.map((t, i) => (
            <li key={t.id} className="cgr-tm-card" hidden={more && !open && i >= FIRST ? true : undefined}>
              <figure>
                <span className="cgr-tm-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote className="cgr-tm-q">
                  <p data-quote-id={t.id}>{t.quote}</p>
                </blockquote>
                <figcaption className="cgr-tm-by">
                  <b>{t.name}</b>
                  <span>{SOURCE_LABEL[t.source]}</span>
                  <span>{t.date}</span>
                  <span>{t.rating} stars</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <div className="cgr-tm-foot">
          {more ? (
            <button
              type="button"
              className="btn btn-line"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Fewer reviews" : `More reviews (${items.length - FIRST})`}
            </button>
          ) : null}
          <a className="ulink" href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">
            Read all reviews on Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
