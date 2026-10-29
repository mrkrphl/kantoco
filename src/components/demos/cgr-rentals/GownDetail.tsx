"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORY_LABEL,
  CGR_ASSET,
  CGR_BASE,
  formatPhp,
  type Gown,
} from "@/lib/cgr-rentals";
import {
  isDateFree,
  useBookings,
  useToday,
} from "@/components/demos/cgr-rentals/bookings";

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function GownDetail({ gown }: { gown: Gown }) {
  const [active, setActive] = useState(0);
  // Today + localStorage are client-only: render a same-size placeholder on the
  // server / first paint so hydration matches and layout does not shift.
  const today = useToday();
  const bookings = useBookings();
  const [picked, setDate] = useState<string | null>(null);
  const ready = today !== null && bookings !== null;
  const date = picked ?? (today ? addDaysIso(today, 7) : "");
  const img = gown.images[active] ?? gown.images[0];

  const free = useMemo(
    () =>
      ready &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      date >= (today ?? "") &&
      isDateFree(gown.slug, date, gown.bookedDates, bookings ?? []),
    [ready, today, gown.slug, gown.bookedDates, date, bookings],
  );

  const upcoming = useMemo(() => {
    if (!today || !bookings) return null;
    const start = today;
    const days: { iso: string; free: boolean }[] = [];
    for (let i = 0; i < 28; i++) {
      const iso = addDaysIso(start, i);
      days.push({
        iso,
        free: isDateFree(gown.slug, iso, gown.bookedDates, bookings),
      });
    }
    return days;
  }, [today, bookings, gown.slug, gown.bookedDates]);

  return (
    <div className="cgr-wrap cgr-detail">
      <p className="cgr-crumb">
        <Link href={CGR_BASE}>Catalogue</Link>
        <span aria-hidden="true"> / </span>
        <span>{gown.name}</span>
      </p>

      <div className="cgr-detail-grid">
        <div className="cgr-detail-media">
          <div className="cgr-detail-hero">
            <img
              src={`${CGR_ASSET}/${img.file}.webp`}
              alt={img.alt}
              width={img.w}
              height={img.h}
              decoding="async"
              fetchPriority="high"
            />
          </div>
          {gown.images.length > 1 ? (
            <div className="cgr-thumbs" role="list">
              {gown.images.map((im, i) => (
                <button
                  key={im.file}
                  type="button"
                  className={i === active ? "is-on" : undefined}
                  aria-label={`Photo ${i + 1}`}
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                >
                  <img
                    src={`${CGR_ASSET}/${im.file}.webp`}
                    alt=""
                    width={im.w}
                    height={im.h}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="cgr-detail-copy">
          <p className="cgr-card-cat">{CATEGORY_LABEL[gown.category]}</p>
          <h1 className="cgr-h1 cgr-h1-sm">{gown.name}</h1>
          <p className="cgr-card-price">
            {formatPhp(gown.pricePerDay)}
            <span> / day · sample price</span>
          </p>
          <p className="cgr-lead">{gown.blurb}</p>
          <dl className="cgr-specs">
            <div>
              <dt>Sizes</dt>
              <dd>{gown.sizes.join(", ")}</dd>
            </div>
            <div>
              <dt>Colors</dt>
              <dd>{gown.colors.join(", ")}</dd>
            </div>
          </dl>

          <div className="cgr-avail" aria-label="Availability check">
            <h2 className="cgr-h3">Check a date</h2>
            <label className="cgr-field">
              <span>Event / pickup date</span>
              <input
                type="date"
                value={date}
                min={today ?? undefined}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <p className={free ? "cgr-avail-ok" : "cgr-avail-no"} role="status">
              {!ready
                ? "Checking the sample calendar…"
                : !date
                  ? "Pick a date."
                  : date < (today ?? "")
                    ? "That date has passed. Pick today or later."
                    : free
                      ? `Available on ${date} (sample calendar).`
                      : `Not available on ${date} — already held in the sample calendar.`}
            </p>
            <div className="cgr-cal" aria-label="Next 28 days">
              {upcoming === null
                ? Array.from({ length: 28 }, (_, i) => (
                    <span key={i} className="cgr-cal-day" aria-hidden="true">
                      <span>&nbsp;</span>
                    </span>
                  ))
                : upcoming.map((d) => (
                    <button
                      key={d.iso}
                      type="button"
                      className={
                        d.iso === date
                          ? d.free
                            ? "cgr-cal-day is-on"
                            : "cgr-cal-day is-on is-busy"
                          : d.free
                            ? "cgr-cal-day"
                            : "cgr-cal-day is-busy"
                      }
                      aria-pressed={d.iso === date}
                      aria-label={`${d.iso}${d.free ? " available" : " booked"}`}
                      onClick={() => setDate(d.iso)}
                    >
                      <span>{d.iso.slice(8)}</span>
                    </button>
                  ))}
            </div>
            <Link
              className={
                free
                  ? "cgr-btn cgr-btn-primary"
                  : "cgr-btn cgr-btn-primary is-disabled"
              }
              href={
                free
                  ? `${CGR_BASE}/reserve/${gown.slug}?date=${encodeURIComponent(date)}`
                  : `${CGR_BASE}/gown/${gown.slug}`
              }
              aria-disabled={!free}
              onClick={(e) => {
                if (!free) e.preventDefault();
              }}
            >
              Request reservation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
