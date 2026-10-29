"use client";

import Link from "next/link";
import {
  CGR_BASE,
  COMMISSION_PHP,
  STATUS_LABEL,
  formatPhp,
  type Booking,
} from "@/lib/cgr-rentals";
import { useBookings } from "@/components/demos/cgr-rentals/bookings";

export function Confirmation({ refCode }: { refCode: string }) {
  const stored = useBookings();
  const ready = stored !== null;
  const booking: Booking | null =
    (refCode && stored?.find((b) => b.ref === refCode)) || null;

  if (!ready) {
    return (
      <div className="cgr-wrap cgr-confirm">
        <p className="cgr-mute">Loading…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="cgr-wrap cgr-confirm">
        <h1 className="cgr-h1 cgr-h1-sm">No booking found</h1>
        <p className="cgr-lead">
          Reference <code>{refCode || "—"}</code> is not in this browser&apos;s
          localStorage.
        </p>
        <Link className="cgr-btn cgr-btn-secondary" href={CGR_BASE}>
          Back to catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="cgr-wrap cgr-confirm">
      <p className="cgr-eyebrow">Reservation saved</p>
      <h1 className="cgr-h1 cgr-h1-sm">Your reference code</h1>
      <p className="cgr-ref" aria-label="Booking reference">
        {booking.ref}
      </p>
      <p className="cgr-lead">
        Sample booking only — stored in this browser. Owner can change status
        and count commission at {formatPhp(COMMISSION_PHP)} per booking.
      </p>
      <dl className="cgr-specs cgr-specs-wide">
        <div>
          <dt>Item</dt>
          <dd>{booking.gownName}</dd>
        </div>
        <div>
          <dt>Event date</dt>
          <dd>{booking.eventDate}</dd>
        </div>
        <div>
          <dt>Return</dt>
          <dd>{booking.returnDate}</dd>
        </div>
        <div>
          <dt>Name</dt>
          <dd>{booking.customerName}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>{booking.customerContact}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{STATUS_LABEL[booking.status]}</dd>
        </div>
      </dl>
      <div className="cgr-confirm-actions">
        <Link className="cgr-btn cgr-btn-primary" href={`${CGR_BASE}/owner`}>
          Open owner view
        </Link>
        <Link className="cgr-btn cgr-btn-secondary" href={CGR_BASE}>
          Back to catalogue
        </Link>
      </div>
    </div>
  );
}
