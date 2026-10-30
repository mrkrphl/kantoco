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

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Fri 6 Nov" from an ISO date (fixed English, no locale drift). */
export function humanDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
}

/** Bodoni name with the last word in italic. */
export function ItalicLast({ text }: { text: string }) {
  const i = text.lastIndexOf(" ");
  if (i < 0) return <em>{text}</em>;
  return (
    <>
      {text.slice(0, i + 1)}
      <em>{text.slice(i + 1)}</em>
    </>
  );
}

const CAL_HEAD = ["M", "T", "W", "T", "F", "S", "S"];
const CAL_CELLS = 35; // 5 rows always, so the grid never changes height (CLS 0)

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
  // Monday-first pad so days sit under the right weekday.
  const pad = today ? (new Date(`${today}T12:00:00`).getDay() + 6) % 7 : 0;

  return (
    <div className="cgr-wrap cgr-detail">
      <p className="cgr-crumb cgr-micro">
        <Link href={CGR_BASE}>All gowns</Link>
        <span aria-hidden="true"> / </span>
        <span>{gown.name}</span>
      </p>

      <div className="cgr-detail-grid">
        <div className="cgr-detail-media">
          <div className="ff cgr-detail-hero">
            <span className="ff-img">
              <img
                src={`${CGR_ASSET}/${img.file}.webp`}
                alt={img.alt}
                width={img.w}
                height={img.h}
                decoding="async"
                fetchPriority="high"
              />
            </span>
          </div>
          {gown.images.length > 1 ? (
            <div className="cgr-thumbs" role="list">
              {gown.images.map((im, i) => (
                <button
                  key={im.file}
                  type="button"
                  className={i === active ? "ff is-on" : "ff"}
                  aria-label={`Photo ${i + 1}`}
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                >
                  <span className="ff-img">
                    <img
                      src={`${CGR_ASSET}/${im.file}.webp`}
                      alt=""
                      width={im.w}
                      height={im.h}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="cgr-detail-copy">
          <p className="cgr-micro">{CATEGORY_LABEL[gown.category]} · Example gown</p>
          <h1 className="cgr-h2 cgr-detail-name">
            <ItalicLast text={gown.name} />
          </h1>
          <p className="cgr-price">
            {formatPhp(gown.pricePerDay)} a day <span className="cgr-micro">Example rate</span>
          </p>
          <p className="cgr-lead">{gown.blurb}</p>
          <dl className="cgr-specs">
            <div>
              <dt className="cgr-micro">Size</dt>
              <dd>{gown.sizes.join(", ")}</dd>
            </div>
            <div>
              <dt className="cgr-micro">Colour</dt>
              <dd>{gown.colors.join(", ")}</dd>
            </div>
            <div>
              <dt className="cgr-micro">Hold</dt>
              <dd>Request a date, keep the CGR code, the shop confirms</dd>
            </div>
          </dl>

          <div className="cgr-avail" aria-label="Availability check">
            <h2 className="cgr-h3">Check a date</h2>
            <label className="cgr-field">
              <span className="cgr-micro">Event or pickup date</span>
              <input
                type="date"
                value={date}
                min={today ?? undefined}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <div className="cgr-cal" aria-label="Sample calendar, next 28 days">
              {CAL_HEAD.map((h, i) => (
                <span key={`h${i}`} className="cgr-cal-head cgr-micro" aria-hidden="true">
                  {h}
                </span>
              ))}
              {Array.from({ length: CAL_CELLS }, (_, i) => {
                const d = upcoming && i >= pad ? upcoming[i - pad] : undefined;
                if (!d) {
                  return (
                    <span key={i} className="cgr-cal-day is-pad" aria-hidden="true">
                      <span>&nbsp;</span>
                    </span>
                  );
                }
                const cls = [
                  "cgr-cal-day",
                  d.iso === date ? "is-on" : "",
                  d.free ? "" : "is-busy",
                  d.iso === today ? "is-today" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={d.iso}
                    type="button"
                    className={cls}
                    aria-pressed={d.iso === date}
                    aria-label={`${humanDate(d.iso)}${d.free ? " open" : " held"}`}
                    onClick={() => setDate(d.iso)}
                  >
                    <span>{Number(d.iso.slice(8))}</span>
                  </button>
                );
              })}
            </div>
            <p className="cgr-cal-legend cgr-micro" aria-hidden="true">
              <span className="k-open">Open</span> · <span className="k-held">Held</span> ·{" "}
              <span className="k-on">Chosen</span> · sample dates
            </p>
            <p className={free ? "cgr-status cgr-avail-ok" : "cgr-status cgr-avail-no"} role="status">
              {!ready
                ? "Checking the sample calendar…"
                : !date
                  ? "Pick a date."
                  : date < (today ?? "")
                    ? "That date has passed. Pick today or later."
                    : free
                      ? `${humanDate(date)} is open in the sample calendar.`
                      : `${humanDate(date)} is already held in the sample calendar.`}
            </p>
            <div className="cgr-actions">
              <Link
                className={free ? "cgr-btn" : "cgr-btn is-disabled"}
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
                Request a hold
              </Link>
              <Link className="cgr-link" href={`${CGR_BASE}#all-gowns`}>
                Back to all gowns
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
