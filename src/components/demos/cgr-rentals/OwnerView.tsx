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
import { updateBookingStatus, useBookings } from "@/components/demos/cgr-rentals/bookings";
import { humanDate } from "@/components/demos/cgr-rentals/GownDetail";
import { COUNTED_STATUSES, ownerCommission } from "@/components/demos/cgr-rentals/reserveMath";

/** Statuses that earn the ₱200 commission. Pending and cancelled are ₱0. */
const COUNTED = new Set<BookingStatus>(COUNTED_STATUSES);

export function OwnerView() {
  const stored = useBookings();
  const ready = stored !== null;
  const list: Booking[] = useMemo(() => stored ?? [], [stored]);
  const billable = useMemo(() => list.filter((b) => COUNTED.has(b.status)), [list]);
  const pending = list.filter((b) => b.status === "pending").length;
  const commission = ownerCommission(
    list.map((b) => b.status),
    COMMISSION_PHP,
  );

  return (
    <div className="cgr-ow cream grain">
      <div className="cgr-ow-in">
        <div className="cgr-ow-head">
          <div>
            <p className="mono">owner view, sample admin</p>
            <h1 className="cgr-ow-h ext">Reservations.</h1>
            <p className="cgr-ow-lead">Bookings live in this browser&apos;s storage on this device only.</p>
          </div>
          <div className="cgr-ow-stat" aria-label="Commission total">
            <p className="mono">commission (owner side only)</p>
            <p className="cgr-ow-num ext" data-commission={commission}>
              {formatPhp(commission)}
            </p>
            <p className="mono">
              {billable.length} confirmed, out or returned × {formatPhp(COMMISSION_PHP)}. pending ({ready ? pending : 0})
              and cancelled count {formatPhp(0)}.
            </p>
          </div>
        </div>

        {!ready ? (
          <p className="mono">loading…</p>
        ) : list.length === 0 ? (
          <div className="cgr-ow-empty">
            <p>No reservations yet.</p>
            <Link className="ulink" href={CGR_BASE}>
              browse the gowns
            </Link>
          </div>
        ) : (
          <div className="cgr-table-wrap" role="region" aria-label="Bookings" tabIndex={0}>
            <table className="cgr-table">
              <thead>
                <tr>
                  <th scope="col">ref</th>
                  <th scope="col">item</th>
                  <th scope="col">dates</th>
                  <th scope="col">customer</th>
                  <th scope="col">status</th>
                  <th scope="col">commission</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.ref} data-status={b.status}>
                    <td data-label="ref">
                      <code>{b.ref}</code>
                    </td>
                    <td data-label="item">
                      <Link className="ulink" href={`${CGR_BASE}/gown/${b.gownSlug}`}>
                        {b.gownName}
                      </Link>
                    </td>
                    <td data-label="dates">
                      {humanDate(b.eventDate)} to {humanDate(b.returnDate)}
                    </td>
                    <td data-label="customer">
                      {b.customerName}
                      <br />
                      <span className="cgr-ow-dim">{b.customerContact}</span>
                    </td>
                    <td data-label="status">
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
                    </td>
                    <td data-label="commission" className="cgr-ow-c">
                      {formatPhp(COUNTED.has(b.status) ? COMMISSION_PHP : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
