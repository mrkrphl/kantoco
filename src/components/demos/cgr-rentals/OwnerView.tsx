"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CGR_BASE,
  COMMISSION_PHP,
  STATUS_LABEL,
  STATUS_OPTIONS,
  formatPhp,
  type Booking,
  type BookingStatus,
} from "@/lib/cgr-rentals";
import { updateBookingStatus, useBookings } from "@/components/demos/cgr-rentals/bookings";
import {
  humanDate,
  isFitting,
  rangeLabel,
  recordsCommission,
  slotLabel,
  sortRecords,
} from "@/components/demos/cgr-rentals/reserveMath";

export { humanDate };

type Filter = "all" | "reserve" | "fitting";

function when(b: Booking): string {
  return isFitting(b)
    ? `${humanDate(b.fittingDate ?? "")}, ${slotLabel(b.slot ?? "")}`
    : rangeLabel(b.eventDate, b.returnDate || b.eventDate);
}

function StatusSelect({ b }: { b: Booking }) {
  return (
    <select
      aria-label={`Status for ${b.ref}`}
      value={b.status}
      onChange={(e) => updateBookingStatus(b.ref, e.target.value as BookingStatus)}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

/**
 * r7.11 booking records (spec §7), the owner view. Unlisted (only the
 * footer's small "Owner view" link), noindex like the whole demo, and no
 * passcode (CGR_FLAGS.recordsPath / recordsPasscode). Reservations and
 * fittings from this browser, soonest first, filter chips, a status
 * select per row; a table at 1366 and cards at 390. The ₱200 commission
 * shows here only and counts reservations that are confirmed, out or
 * returned; fittings never count. No invented sample rows.
 */
export function OwnerView() {
  const stored = useBookings();
  const [filter, setFilter] = useState<Filter>("all");
  const all = sortRecords(stored ?? []);
  const fits = all.filter(isFitting);
  const resv = all.filter((b) => !isFitting(b));
  const list = filter === "all" ? all : filter === "fitting" ? fits : resv;
  const total = recordsCommission(all, COMMISSION_PHP);

  const chips: [Filter, string, number][] = [
    ["all", "All", all.length],
    ["reserve", "Reservations", resv.length],
    ["fitting", "Fittings", fits.length],
  ];

  return (
    <section className="r11-rec" aria-labelledby="rec-h">
      <p className="r11-kick">Owner view · sample</p>
      <h1 id="rec-h">Bookings</h1>
      <p className="r11-sub" style={{ marginTop: 0 }}>
        Reservations and fittings, soonest first. Saved in this browser only.
      </p>

      <div className="r11-chips" role="group" aria-label="Show">
        {chips.map(([id, label, n]) => (
          <button key={id} type="button" className="r11-chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label} <span className="n">{stored ? n : ""}</span>
          </button>
        ))}
      </div>

      {!stored ? (
        <p className="r11-empty">Loading…</p>
      ) : list.length === 0 ? (
        <div className="r11-empty">
          <p>No bookings yet in this browser.</p>
          <Link className="r11-link" href={`${CGR_BASE}#rail`}>
            See the gowns
          </Link>
        </div>
      ) : (
        <>
          <table className="r11-table">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Type</th>
                <th scope="col">Gown</th>
                <th scope="col">Client</th>
                <th scope="col">Ref</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.ref} data-ref={b.ref} data-kind={isFitting(b) ? "fitting" : "reserve"}>
                  <td className="d">{when(b)}</td>
                  <td>
                    <span className={isFitting(b) ? "r11-tag fit" : "r11-tag"}>{isFitting(b) ? "Fitting" : "Reserve"}</span>
                  </td>
                  <td>
                    {b.gownName}
                    {isFitting(b) && b.linkedRef ? <div className="s2">For {b.linkedRef}</div> : null}
                  </td>
                  <td>
                    {b.customerName}
                    <div className="s2">{b.customerContact}</div>
                  </td>
                  <td>
                    <code>{b.ref}</code>
                  </td>
                  <td>
                    <StatusSelect b={b} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="r11-cards">
            {list.map((b) => (
              <li key={b.ref} className="r11-card2" data-ref={b.ref}>
                <div className="top">
                  <span className={isFitting(b) ? "r11-tag fit" : "r11-tag"}>{isFitting(b) ? "Fitting" : "Reserve"}</span>
                  <code>{b.ref}</code>
                </div>
                <p className="d">{when(b)}</p>
                <p>
                  {b.gownName}
                  {isFitting(b) && b.linkedRef ? ` · for ${b.linkedRef}` : ""}
                </p>
                <p className="s2">
                  {b.customerName} · {b.customerContact}
                </p>
                <StatusSelect b={b} />
              </li>
            ))}
          </ul>
        </>
      )}

      {stored ? (
        <p className="r11-note" style={{ marginTop: 24 }} data-commission={total}>
          {formatPhp(COMMISSION_PHP)} per confirmed, out or returned reservation. Fittings never count. Total {formatPhp(total)}.
        </p>
      ) : null}
    </section>
  );
}
