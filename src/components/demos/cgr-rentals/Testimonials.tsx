"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { REVIEWS_URL, SOURCE_LABEL, SPREADS, TESTIMONIALS, type Testimonial } from "./testimonials";

/** Group the list into the designed spreads; anything not slotted follows in threes. */
function toSpreads(items: Testimonial[]): Testimonial[][] {
  const byId = new Map(items.map((t) => [t.id, t]));
  const used = new Set<number>();
  const out: Testimonial[][] = [];
  for (const ids of SPREADS) {
    const s = ids.map((id) => byId.get(id)).filter((t): t is Testimonial => Boolean(t));
    s.forEach((t) => used.add(t.id));
    if (s.length) out.push(s);
  }
  const rest = items.filter((t) => !used.has(t.id));
  for (let i = 0; i < rest.length; i += 3) out.push(rest.slice(i, i + 3));
  return out;
}

function Quote({ t, feat }: { t: Testimonial; feat?: boolean }) {
  return (
    <figure className={feat ? "cgr-tq is-feat" : "cgr-tq"}>
      {feat ? (
        <span className="cgr-tq-mark" aria-hidden="true">
          &ldquo;
        </span>
      ) : null}
      <blockquote className="cgr-tq-q">
        <p data-quote-id={t.id}>{t.quote}</p>
      </blockquote>
      <figcaption className="cgr-tq-by">
        <b>{t.name}</b>
        <span className={t.source === "Google" ? "cgr-tq-tag" : "cgr-tq-tag is-fb"}>{SOURCE_LABEL[t.source]}</span>
        <span>{t.date}</span>
        {typeof t.rating === "number" ? (
          <>
            <span className="cgr-tq-dot" aria-hidden="true">
              ·
            </span>
            <span>{t.rating} stars</span>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}

function Spread({ s }: { s: Testimonial[] }) {
  if (s.length === 2) {
    return (
      <>
        <Quote t={s[0]} feat />
        <Quote t={s[1]} feat />
      </>
    );
  }
  return (
    <>
      <Quote t={s[0]} feat />
      {s.length > 1 ? (
        <div className="cgr-tq-side">
          {s.slice(1).map((t) => (
            <Quote key={t.id} t={t} />
          ))}
        </div>
      ) : null}
    </>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

function Arrow({ dir }: { dir: "l" | "r" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d={dir === "l" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

/**
 * One carousel: desktop ("d", spreads) or phone ("m", one review a slide).
 * Both are in the markup and CSS shows one, so the layout never changes
 * after hydration (CLS 0). No auto-advance; ← → work anywhere in the
 * section except on links.
 */
function Carousel({ kind, slides, sectionRef }: { kind: "d" | "m"; slides: Testimonial[][]; sectionRef: React.RefObject<HTMLElement | null> }) {
  const [cur, setCur] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const n = slides.length;
  const trackId = `cgr-tm-track-${kind}`;
  const go = useCallback((i: number) => setCur(Math.max(0, Math.min(n - 1, i))), [n]);

  useEffect(() => {
    const sec = sectionRef.current;
    const root = rootRef.current;
    if (!sec || !root) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if ((e.target as HTMLElement | null)?.closest("a, input, textarea, select")) return;
      if (getComputedStyle(root).display === "none") return;
      e.preventDefault();
      setCur((c) => Math.max(0, Math.min(n - 1, c + (e.key === "ArrowRight" ? 1 : -1))));
    };
    sec.addEventListener("keydown", onKey);
    return () => sec.removeEventListener("keydown", onKey);
  }, [n, sectionRef]);

  const one = kind === "m";
  const prevBtn = (
    <button
      type="button"
      className="cgr-tm-btn"
      aria-label={one ? "Previous review" : "Previous reviews"}
      aria-controls={trackId}
      aria-disabled={cur === 0}
      onClick={() => go(cur - 1)}
    >
      <Arrow dir="l" />
    </button>
  );
  const nextBtn = (
    <button
      type="button"
      className="cgr-tm-btn"
      aria-label={one ? "Next review" : "Next reviews"}
      aria-controls={trackId}
      aria-disabled={cur === n - 1}
      onClick={() => go(cur + 1)}
    >
      <Arrow dir="r" />
    </button>
  );
  const count = (
    <span className="cgr-tm-count" aria-live="polite" aria-atomic="true">
      <span className="sr-only">{one ? "Review" : "Reviews"} </span>
      {pad(cur + 1)} <small>/ {pad(n)}</small>
    </span>
  );

  const viewport = (
    <div
      className="cgr-tm-view"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client reviews"
      tabIndex={0}
    >
      <div className="cgr-tm-track" id={trackId} style={{ "--i": cur } as React.CSSProperties}>
        {slides.map((s, i) => (
          <div
            key={s.map((t) => t.id).join("-")}
            className={`cgr-tm-slide${s.length === 2 ? " is-duo" : ""}${s.length === 1 ? " is-one" : ""}${i > cur ? " is-peek" : i < cur ? " is-gone" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${n}`}
            aria-hidden={i !== cur ? true : undefined}
            inert={i !== cur}
          >
            <Spread s={s} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`cgr-tm-c cgr-tm-c-${kind}`} ref={rootRef}>
      {one ? (
        <>
          {viewport}
          <div className="cgr-tm-ctrls">
            {prevBtn}
            {count}
            {nextBtn}
          </div>
        </>
      ) : (
        <>
          <div className="cgr-tm-ctrls">
            {prevBtn}
            {count}
            {nextBtn}
          </div>
          {viewport}
          <div className="cgr-tm-prog">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to reviews ${i + 1} of ${n}`}
                aria-current={i === cur ? "true" : undefined}
                aria-controls={trackId}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * r7.7 reviews (Design r7.7 spec §1): an editorial carousel of the eight
 * Google reviews, verbatim from testimonials.ts. Desktop: three spreads
 * (3/3/2) with the next one peeking. Phone: eight slides. An empty list
 * renders nothing.
 */
export function Testimonials({ items = TESTIMONIALS }: { items?: Testimonial[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  if (items.length === 0) return null;
  const spreads = toSpreads(items);
  const singles = spreads.flat().map((t) => [t]);
  return (
    <section className="cgr-tm creamy" id="reviews" aria-labelledby="cgr-tm-t" ref={sectionRef}>
      <div className="cgr-tm-in">
        <header className="cgr-tm-head">
          <p className="cgr-kicker">From our clients</p>
          <h2 className="cgr-tm-h disp" id="cgr-tm-t">
            Kind <em>words</em>
          </h2>
          <p className="cgr-tm-dek">Google reviews, word for word, as the clients wrote them.</p>
        </header>
        <Carousel kind="d" slides={spreads} sectionRef={sectionRef} />
        <Carousel kind="m" slides={singles} sectionRef={sectionRef} />
        <div className="cgr-tm-foot">
          <a className="ulink" href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">
            Read all on Google Maps <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <span className="cgr-tm-kb">Use ← → or the arrows. Nothing moves on its own.</span>
        </div>
      </div>
    </section>
  );
}
