"use client";

import Link from "next/link";
import { CGR_BASE, STATUS_LABEL, formatPhp, getGown, type Booking } from "@/lib/cgr-rentals";
import { useBookings } from "@/components/demos/cgr-rentals/bookings";
import { humanDate } from "@/components/demos/cgr-rentals/GownDetail";
import { Steps, rentalDays } from "@/components/demos/cgr-rentals/Steps";

export function Confirmation({ refCode }: { refCode: string }) {
  const stored = useBookings();
  const ready = stored !== null;
  const booking: Booking | null = (refCode && stored?.find((b) => b.ref === refCode)) || null;
  const gown = booking ? getGown(booking.gownSlug) : undefined;
  const days = booking ? rentalDays(booking.eventDate, booking.returnDate) : null;
  const total = gown && days ? gown.pricePerDay * days : null;

  return (
    <div className="cgr-bk ox grain">
      <div className="cgr-bk-in">
        <Steps current={3} title="Your reference code." sub="step 3 of 3, saved in this browser" />
        {!ready ? (
          <p className="mono cgr-cn-loading">loading…</p>
        ) : !booking ? (
          <div className="cgr-cn">
            <h1 className="cgr-cn-h ext">No hold found</h1>
            <p className="cgr-cn-lead">
              Reference <code>{refCode || "none"}</code> is not in this browser&apos;s storage.
            </p>
            <Link className="ulink" href={CGR_BASE}>
              back to the gowns
            </Link>
          </div>
        ) : (
          <div className="cgr-cn">
            <h1 className="cgr-cn-h ext">Hold request saved.</h1>
            <p className="cgr-cn-ref ext" aria-label="Booking reference">
              {booking.ref}
            </p>
            <p className="cgr-cn-lead">
              Sample hold only, stored in this browser. The shop confirms the hold, and this code is what you show at the
              fitting and at pickup.
            </p>
            <dl className="cgr-cn-dl">
              <div>
                <dt className="mono">item</dt>
                <dd>{booking.gownName}</dd>
              </div>
              <div>
                <dt className="mono">pickup</dt>
                <dd>{humanDate(booking.eventDate)}</dd>
              </div>
              <div>
                <dt className="mono">return</dt>
                <dd>{humanDate(booking.returnDate)}</dd>
              </div>
              <div>
                <dt className="mono">name</dt>
                <dd>{booking.customerName}</dd>
              </div>
              <div>
                <dt className="mono">contact</dt>
                <dd>{booking.customerContact}</dd>
              </div>
              <div>
                <dt className="mono">status</dt>
                <dd>{STATUS_LABEL[booking.status]}</dd>
              </div>
              {total !== null && gown ? (
                <div className="cgr-cn-total">
                  <dt className="mono">
                    total, {days} {days === 1 ? "day" : "days"} at {formatPhp(gown.pricePerDay)} (example)
                  </dt>
                  <dd className="ext">{formatPhp(total)}</dd>
                </div>
              ) : null}
            </dl>
            <div className="cgr-bk-actions">
              <Link className="btn btn-wine" href={`${CGR_BASE}/owner`}>
                Open owner view
              </Link>
              <Link className="ulink" href={CGR_BASE}>
                back to the gowns
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
