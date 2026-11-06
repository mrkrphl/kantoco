"use client";

import Link from "next/link";
import { useState } from "react";
import { CGR_BASE, SLUG_ALIASES, type Gown } from "@/lib/cgr-rentals";
import { useBookings, useToday } from "@/components/demos/cgr-rentals/bookings";
import { GownImg } from "@/components/demos/cgr-rentals/GownImg";
import { Calendar, type DayKind } from "@/components/demos/cgr-rentals/Calendar";
import { DB_ON, dbTakenDays, useDbRead } from "@/components/demos/cgr-rentals/db";
import {
  addDaysIso,
  defaultReturn,
  horizonIso,
  humanDate,
  reserveState,
  takenDays,
} from "@/components/demos/cgr-rentals/reserveMath";

export { addDaysIso, humanDate };

const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "6 Nov" for short labels. */
export function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MO[d.getMonth()]}`;
}

/** Plain name (r7 dropped the italic-last treatment). Kept for older imports. */
export function ItalicLast({ text }: { text: string }) {
  return <>{text}</>;
}

/**
 * r7.11 gown page (Design r7.11 gown.html, spec §4). The same template
 * serves every reservable piece: evening gowns, Bridal, Filipiniana and
 * the accessories (default #4). Focal point: the whole photo on a cream
 * mat (contain, sticky at 1366). Then name, rate, calendar, ONE button.
 * About / Sizes / Fitting sit below the fold. The picked date stays on
 * this page and goes to Reserve as ?from=&to=.
 */
export function GownDetail({
  gown,
  initialDate = "",
  initialReturn = "",
}: {
  gown: Gown;
  initialDate?: string;
  initialReturn?: string;
}) {
  const rows = useBookings();
  const today = useToday();
  const [img, setImg] = useState(0);
  const [pick, setPick] = useState<{ from: string; to: string }>(() =>
    initialDate
      ? { from: initialDate, to: initialReturn && initialReturn >= initialDate ? initialReturn : defaultReturn(initialDate) }
      : { from: "", to: "" },
  );
  const isAcc = gown.category === "accessory";
  const noun = isAcc ? "piece" : "gown";

  // r8.2: with the database on, struck-out days come from taken_days for
  // today..today+366 (one call); this device's rows don't hold a gown then.
  const last = today ? horizonIso(today) : "";
  const dbDays = useDbRead(DB_ON && today ? `${gown.slug}|${today}` : null, () => dbTakenDays(gown.slug, today ?? "", last));
  const dbRows = Array.isArray(dbDays)
    ? dbDays.map((d) => ({ ref: "", gownSlug: gown.slug, eventDate: d, returnDate: d, status: "pending" as const }))
    : [];
  const taken = (a: string, b: string) =>
    takenDays(gown.slug, a, b, gown.bookedDates, DB_ON ? dbRows : (rows ?? []), SLUG_ALIASES);
  const kindOf = (d: string): DayKind => {
    if (today && (d < today || d > last)) return "off";
    return taken(d, d).length ? "booked" : "open";
  };

  const state = today && pick.from ? reserveState(pick.from, pick.to, today, taken(pick.from, pick.to)) : "missing";
  const firstTaken = state === "taken" ? taken(pick.from, pick.to)[0] : "";

  let status = "Tap your event date.";
  let tone = "";
  if (state === "ok") {
    status = `${humanDate(pick.from)} is free for this ${noun}.`;
    tone = "ok";
  } else if (state === "taken") {
    status =
      firstTaken === pick.from
        ? `${humanDate(firstTaken)} is already reserved. Struck-out days are taken.`
        : `${humanDate(firstTaken)}, the return day, is already reserved. Struck-out days are taken.`;
    tone = "no";
  } else if (state === "past") {
    status = "That date has already passed. Pick a day from today onward.";
    tone = "no";
  } else if (state === "too_far") {
    status = "Reservations open up to a year ahead. Pick an earlier day.";
    tone = "no";
  } else if (state === "too_long") {
    status = "Online reservations can be up to 30 days.";
    tone = "no";
  }
  if (DB_ON && dbDays === "unavailable" && state === "ok") {
    status = `${humanDate(pick.from)} looks free. Live dates can’t load right now; the next step checks again.`;
  }

  const href = `${CGR_BASE}/reserve/${gown.slug}?from=${pick.from}&to=${pick.to}`;
  const cta =
    state === "ok" ? (
      <Link className="r11-btn r11-wine" href={href}>
        Reserve for {humanDate(pick.from)}
      </Link>
    ) : (
      <button type="button" className="r11-btn r11-wine" disabled aria-disabled="true">
        {pick.from ? "Pick another date" : "Pick your date"}
      </button>
    );

  // r8.0: no invented sizes (Design r8 §3); the shop fits you in person.
  const sizeLine = "Ask the shop for your size";

  return (
    <>
      <section className="r11-gd" aria-labelledby="gd-h">
        <div className="r11-ph">
          <figure className="r11-mat">
            <GownImg img={gown.images[img]} fetchPriority="high" decoding="async" />
          </figure>
          {gown.images.length > 1 ? (
            <div className="r11-thumbs" role="group" aria-label="Photos">
              {gown.images.map((im, i) => (
                <button
                  key={im.file}
                  type="button"
                  className="r11-thumb"
                  aria-pressed={i === img}
                  aria-label={`Photo ${i + 1} of ${gown.images.length}`}
                  onClick={() => setImg(i)}
                >
                  <GownImg img={im} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="r11-info">
          <Link className="r11-back" href={isAcc ? `${CGR_BASE}#accessories` : `${CGR_BASE}#rail`}>
            ← {isAcc ? "All accessories" : "All gowns"}
          </Link>
          <h1 id="gd-h">{gown.name}</h1>
          <div id="dates" style={{ width: "100%" }}>
            <Calendar
              value={pick.from}
              today={today}
              kindOf={kindOf}
              label="Event date"
              onPick={(d) => setPick({ from: d, to: defaultReturn(d) })}
            />
            <p className={`r11-status ${tone}`} role="status">
              {status}
            </p>
          </div>
          {cta}
        </div>
      </section>

      <section className="r11-lower" aria-label={`About this ${noun}`}>
        <div>
          <h2>About this {noun}</h2>
          <p>{gown.blurb}</p>
        </div>
        <div>
          <dl>
            <dt>Sizes</dt>
            <dd>{sizeLine}</dd>
            <dt>Fitting</dt>
            <dd>
              <Link className="r11-link" href={`${CGR_BASE}/fitting?gown=${gown.slug}`}>
                Book a fitting
              </Link>
            </dd>
          </dl>
        </div>
      </section>

      <div className="r11-bar">
        {cta}
      </div>
    </>
  );
}
