"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CGR_BASE,
  COMMISSION_PHP,
  STATUS_LABEL,
  STATUS_OPTIONS,
  formatPhp,
  type Booking,
  type BookingStatus,
} from "@/lib/cgr-rentals";
import {
  updateBookingStatus,
  useBookings,
} from "@/components/demos/cgr-rentals/bookings";

export function OwnerView() {
  const stored = useBookings();
  const ready = stored !== null;
  const list: Booking[] = useMemo(() => stored ?? [], [stored]);

  const billable = useMemo(
    () => list.filter((b) => b.status !== "cancelled"),
    [list],
  );
  const commission = billable.length * COMMISSION_PHP;

  function onStatus(ref: string, status: BookingStatus) {
    updateBookingStatus(ref, status);
  }

  return (
    <div className="cgr-wrap cgr-owner">
      <div className="cgr-owner-head">
        <div>
          <p className="cgr-eyebrow">Owner</p>
          <h1 className="cgr-h1 cgr-h1-sm">Reservations</h1>
          <p className="cgr-lead">
            Sample admin. Bookings live in localStorage on this device only.
          </p>
        </div>
        <div className="cgr-hero-stat" aria-label="Commission total">
          <p className="cgr-stat-kicker">Commission</p>
          <p className="cgr-stat-num">{formatPhp(commission)}</p>
          <p className="cgr-stat-sub">
            {billable.length} booking{billable.length === 1 ? "" : "s"} ×{" "}
            {formatPhp(COMMISSION_PHP)}
          </p>
        </div>
      </div>

      {!ready ? (
        <p className="cgr-mute">Loading…</p>
      ) : list.length === 0 ? (
        <div className="cgr-empty-box">
          <p className="cgr-empty">No reservations yet.</p>
          <Link className="cgr-btn cgr-btn-secondary" href={CGR_BASE}>
            Browse catalogue
          </Link>
        </div>
      ) : (
        <div className="cgr-table-wrap" role="region" aria-label="Bookings">
          <table className="cgr-table">
            <thead>
              <tr>
                <th scope="col">Ref</th>
                <th scope="col">Item</th>
                <th scope="col">Date</th>
                <th scope="col">Customer</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.ref}>
                  <td data-label="Ref">
                    <code>{b.ref}</code>
                  </td>
                  <td data-label="Item">
                    <Link href={`${CGR_BASE}/gown/${b.gownSlug}`}>
                      {b.gownName}
                    </Link>
                  </td>
                  <td data-label="Date">
                    <span>
                      {b.eventDate}
                      <span className="cgr-mute"> → {b.returnDate}</span>
                    </span>
                  </td>
                  <td data-label="Customer">
                    <span>
                      {b.customerName}
                      <br />
                      <span className="cgr-mute">{b.customerContact}</span>
                    </span>
                  </td>
                  <td data-label="Status">
                    <select
                      aria-label={`Status for ${b.ref}`}
                      value={b.status}
                      onChange={(e) =>
                        onStatus(b.ref, e.target.value as BookingStatus)
                      }
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
