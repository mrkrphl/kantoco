"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CGR_ASSET, CGR_BASE, GOWNS, formatPhp, type Gown } from "@/lib/cgr-rentals";
import { addBooking, isRangeFree, useBookings, useToday } from "@/components/demos/cgr-rentals/bookings";
import { addDaysIso, humanDate } from "@/components/demos/cgr-rentals/GownDetail";
import { Steps, rentalDays } from "@/components/demos/cgr-rentals/Steps";

/**
 * Round 7 booking (stamp §4 Booking, d05/m05): oxblood, steps 01 02 03 with
 * 02 in hot, underline fields, and a "Your hold" summary card (+2.5deg, ink
 * hard shadow) over a rotated photo. The customer total is rate x days only.
 */
export function ReserveForm({ gown, initialDate }: { gown: Gown; initialDate: string }) {
  const router = useRouter();
  const today = useToday();
  const bookings = useBookings();
  const [eventPicked, setEventDate] = useState<string | null>(initialDate || null);
  const [returnPicked, setReturnDate] = useState<string | null>(null);
  const eventDate = eventPicked ?? (today ? addDaysIso(today, 7) : "");
  const returnDate = returnPicked ?? (eventDate ? addDaysIso(eventDate, 1) : "");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const days = rentalDays(eventDate, returnDate);
  const validDates = days !== null;
  const past = today !== null && eventDate < today;
  const free = useMemo(
    () =>
      today !== null &&
      bookings !== null &&
      validDates &&
      isRangeFree(gown.slug, eventDate, returnDate, gown.bookedDates, bookings),
    [today, bookings, validDates, gown.slug, gown.bookedDates, eventDate, returnDate],
  );
  const canSave = free && !past;
  const total = days ? days * gown.pricePerDay : null;
  const no = String(GOWNS.indexOf(gown) + 1).padStart(2, "0");
  const img = gown.images[1] ?? gown.images[0];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !contact.trim()) {
      setError("Your name and a mobile or Messenger contact are required.");
      return;
    }
    if (!validDates) {
      setError("The return date must be on or after the pickup date.");
      return;
    }
    if (past) {
      setError("Pick a date from today onward.");
      return;
    }
    if (!free) {
      setError("Those dates overlap a hold on the sample calendar.");
      return;
    }
    const booking = addBooking({
      gownSlug: gown.slug,
      gownName: gown.name,
      eventDate,
      returnDate,
      customerName: name.trim(),
      customerContact: contact.trim(),
      notes: [occasion.trim(), notes.trim()].filter(Boolean).join(" · "),
    });
    router.push(`${CGR_BASE}/confirmation?ref=${encodeURIComponent(booking.ref)}`);
  }

  const status =
    today === null || bookings === null
      ? "checking the sample calendar…"
      : !validDates
        ? "the return date must be on or after the pickup date."
        : past
          ? "that date has passed. pick today or later."
          : free
            ? `open in the sample calendar, ${humanDate(eventDate).toLowerCase()} to ${humanDate(returnDate).toLowerCase()}.`
            : `${humanDate(eventDate).toLowerCase()} to ${humanDate(returnDate).toLowerCase()} overlaps a hold. pick other dates.`;

  return (
    <div className="cgr-bk ox grain">
      <div className="cgr-bk-in">
        <Steps current={2} title="Your details." sub="step 2 of 3, takes a minute" />

        <div className="cgr-bk-grid">
          <form className="cgr-form" onSubmit={onSubmit} noValidate aria-labelledby="cgr-bk-h">
            <h1 className="sr-only" id="cgr-bk-h">
              Request a hold for the {gown.name}
            </h1>
            <label className="uf">
              <span className="uf-l mono">your name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Mavy Dela Cruz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <span className="uf-h mono" aria-hidden="true">
                example
              </span>
            </label>
            <label className="uf">
              <span className="uf-l mono">mobile or messenger</span>
              <input
                type="text"
                autoComplete="tel"
                inputMode="text"
                placeholder="0917 000 0000"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
              <span className="uf-h mono" aria-hidden="true">
                the shop texts to confirm
              </span>
            </label>
            <div className="uf-row">
              <label className="uf">
                <span className="uf-l mono">pickup (event) date</span>
                <input
                  type="date"
                  value={eventDate}
                  min={today ?? undefined}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    setReturnDate(null);
                  }}
                  required
                />
              </label>
              <label className="uf">
                <span className="uf-l mono">return date</span>
                <input
                  type="date"
                  value={returnDate}
                  min={eventDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  required
                />
              </label>
            </div>
            <p className={canSave ? "mono cgr-bk-status" : "mono cgr-bk-status is-no"} role="status">
              {status}
            </p>
            <label className="uf">
              <span className="uf-l mono">the occasion</span>
              <input
                type="text"
                placeholder="Debut, 7 Nov in Imus"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              />
            </label>
            <label className="uf">
              <span className="uf-l mono">anything we should know</span>
              <input
                type="text"
                placeholder="Need it hemmed for 5'2&quot;"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            {error ? (
              <p className="cgr-bk-err" role="alert">
                {error}
              </p>
            ) : null}
            <div className="cgr-bk-actions">
              <button type="submit" className="btn btn-hot" disabled={!canSave}>
                Save hold request
              </button>
              <Link className="ulink" href={`${CGR_BASE}/gown/${gown.slug}`}>
                back to the gown
              </Link>
            </div>
            <p className="mono cgr-bk-note">
              saves a sample hold in this browser with a CGR-XXXX reference. nothing is sent to the shop.
            </p>
          </form>

          <aside className="cgr-bk-side" aria-label="Your hold">
            <div className="cgr-bk-photo dark">
              <img src={`${CGR_ASSET}/${img.file}.webp`} alt="" width={img.w} height={img.h} decoding="async" />
            </div>
            <div className="cgr-hold">
              <p className="cgr-hold-t ext">Your hold</p>
              <p className="mono cgr-hold-s">
                {gown.name.toLowerCase()}, no.{no}
              </p>
              <dl className="cgr-hold-dl">
                <div>
                  <dt>Pickup</dt>
                  <dd>{eventDate ? humanDate(eventDate) : "–"}</dd>
                </div>
                <div>
                  <dt>Return</dt>
                  <dd>{returnDate && validDates ? humanDate(returnDate) : "–"}</dd>
                </div>
                <div>
                  <dt>
                    {days ?? "–"} {days === 1 ? "day" : "days"} at {formatPhp(gown.pricePerDay)}
                  </dt>
                  <dd>{total !== null ? formatPhp(total) : "–"}</dd>
                </div>
              </dl>
              <p className="cgr-hold-total">
                <span>Total, example</span>
                <b className="ext" data-total={total ?? ""}>
                  {total !== null ? formatPhp(total) : "–"}
                </b>
              </p>
              <p className="mono cgr-hold-n">a hold request, not a payment. example rates.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
