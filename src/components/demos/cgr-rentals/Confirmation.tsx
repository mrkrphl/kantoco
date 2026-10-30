"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CGR_BASE, cgr, formatPhp, getGown, type Booking } from "@/lib/cgr-rentals";
import { useBookings } from "@/components/demos/cgr-rentals/bookings";
import { StepHead } from "@/components/demos/cgr-rentals/Steps";
import { customerTotal, humanDate, rangeLabel, rentalDays } from "@/components/demos/cgr-rentals/reserveMath";
import { GownImg } from "@/components/demos/cgr-rentals/GownImg";

/**
 * r7.7 confirmation (Design r7.7 spec §2): the CGR code large, what happens
 * next, and the same ticket. Warm Reserve wording; it never says the booking
 * is confirmed (the shop confirms by message).
 */
export function Confirmation({ refCode }: { refCode: string }) {
  const stored = useBookings();
  const ready = stored !== null;
  const booking: Booking | null = (refCode && stored?.find((b) => b.ref === refCode)) || null;
  const gown = booking ? getGown(booking.gownSlug) : undefined;
  const days = booking ? rentalDays(booking.eventDate, booking.returnDate) : null;
  const total = gown && booking ? customerTotal(gown.pricePerDay, booking.eventDate, booking.returnDate) : null;
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (booking) headRef.current?.focus();
  }, [booking]);
  const img = gown ? (gown.images[1] ?? gown.images[0]) : null;

  return (
    <div className="cgr-bk ox grain">
      <div className="cgr-bk-in">
        {!ready ? (
          <p className="cgr-cn-loading">Loading…</p>
        ) : !booking ? (
          <div className="cgr-cn">
            <h1 className="cgr-steps-q">No reservation found</h1>
            <p className="cgr-cn-lead">
              Reference <code>{refCode || "none"}</code> is not in this browser&apos;s storage.
            </p>
            <Link className="ulink" href={CGR_BASE}>
              Back to the gowns
            </Link>
          </div>
        ) : (
          <div className="cgr-bk-grid">
            <aside className="cgr-bk-side" aria-label="Your reservation">
              {img ? (
                <div className="cgr-bk-photo dark">
                  <GownImg img={img} alt="" decoding="async" />
                </div>
              ) : null}
              <div className="cgr-hold">
                <div className="cgr-hold-top">
                  <p className="cgr-hold-t">Your reservation</p>
                  <p className="cgr-hold-s">{booking.gownName}</p>
                </div>
                <p className="cgr-hold-mini">
                  <span>{rangeLabel(booking.eventDate, booking.returnDate)}</span>
                  <span className="cgr-hold-mini-t">{booking.ref}</span>
                </p>
                <dl className="cgr-hold-dl">
                  <div>
                    <dt>Pickup</dt>
                    <dd>{humanDate(booking.eventDate)}</dd>
                  </div>
                  <div>
                    <dt>Return</dt>
                    <dd>{humanDate(booking.returnDate)}</dd>
                  </div>
                  {gown ? (
                    <div>
                      <dt>Example rate</dt>
                      <dd>{formatPhp(gown.pricePerDay)} / day</dd>
                    </div>
                  ) : null}
                  {total !== null ? (
                    <div>
                      <dt>
                        Total, {days} {days === 1 ? "day" : "days"}
                      </dt>
                      <dd data-total={total}>{formatPhp(total)}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Reference</dt>
                    <dd>{booking.ref}</dd>
                  </div>
                </dl>
                {gown ? null : (
                  <p className="cgr-hold-n" data-unlisted="">
                    This gown is no longer listed. Your reference code still works; the shop can help you pick another.
                  </p>
                )}
                <p className="cgr-hold-n">A reservation request, not a payment. Example rates.</p>
              </div>
            </aside>
            <div className="cgr-cn cgr-step-in">
              <StepHead
                n={3}
                complete
                headRef={headRef}
                title={
                  <>
                    Your reservation request <em>is in.</em>
                  </>
                }
              />
              <p className="cgr-cn-ref" aria-label={`Reference code ${booking.ref}`}>
                {booking.ref}
              </p>
              <p className="cgr-cn-codel">Your reference code. Show it at the fitting and at pickup.</p>
              <ol className="cgr-cn-next">
                <li>
                  <b aria-hidden="true">i.</b>
                  The shop messages you on {booking.customerContact} to confirm the gown and the dates.
                </li>
                <li>
                  <b aria-hidden="true">ii.</b>
                  Come in for a fitting. Hemming and small changes are agreed there.
                </li>
                <li>
                  <b aria-hidden="true">iii.</b>
                  Pick up on {humanDate(booking.eventDate)} and return on {humanDate(booking.returnDate)}.
                </li>
              </ol>
              <div className="cgr-bk-actions">
                <Link className="btn btn-cream" href={`${CGR_BASE}#gowns`}>
                  Back to the gowns
                </Link>
                <a className="ulink" href={cgr.messenger} target="_blank" rel="noopener noreferrer">
                  Ask about a fitting
                </a>
              </div>
              <p className="cgr-bk-note">
                A sample reservation, saved in this browser. Nothing was sent to the shop.{" "}
                <Link className="ulink" href={`${CGR_BASE}/owner`}>
                  Owner view
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
