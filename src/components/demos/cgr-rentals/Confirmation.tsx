"use client";

import Link from "next/link";
import {
  CGR_BASE,
  STATUS_LABEL,
  type Booking,
} from "@/lib/cgr-rentals";
import { useBookings } from "@/components/demos/cgr-rentals/bookings";
import { humanDate } from "@/components/demos/cgr-rentals/GownDetail";

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
        <h1 className="cgr-h2">No booking found</h1>
        <p className="cgr-lead">
          Reference <code>{refCode || "none"}</code> is not in this browser&apos;s
          localStorage.
        </p>
        <Link className="cgr-link" href={CGR_BASE}>
          Back to catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="cgr-wrap cgr-confirm">
      <p className="cgr-micro">Hold request saved · Example</p>
      <h1 className="cgr-h2">
        Your reference <em>code</em>
      </h1>
      <p className="cgr-ref" aria-label="Booking reference">
        {booking.ref}
      </p>
      <p className="cgr-lead">
        Sample hold only, stored in this browser. The shop confirms your
        hold; bring this code when you fit or pick up.
      </p>
      <dl className="cgr-specs cgr-specs-wide">
        <div>
          <dt className="cgr-micro">Item</dt>
          <dd>{booking.gownName}</dd>
        </div>
        <div>
          <dt className="cgr-micro">Event date</dt>
          <dd>{humanDate(booking.eventDate)}</dd>
        </div>
        <div>
          <dt className="cgr-micro">Return</dt>
          <dd>{humanDate(booking.returnDate)}</dd>
        </div>
        <div>
          <dt className="cgr-micro">Name</dt>
          <dd>{booking.customerName}</dd>
        </div>
        <div>
          <dt className="cgr-micro">Contact</dt>
          <dd>{booking.customerContact}</dd>
        </div>
        <div>
          <dt className="cgr-micro">Status</dt>
          <dd>{STATUS_LABEL[booking.status]}</dd>
        </div>
      </dl>
      <div className="cgr-confirm-actions">
        <Link className="cgr-btn" href={`${CGR_BASE}/owner`}>
          Open owner view
        </Link>
        <Link className="cgr-link" href={CGR_BASE}>
          Back to catalogue
        </Link>
      </div>
    </div>
  );
}
