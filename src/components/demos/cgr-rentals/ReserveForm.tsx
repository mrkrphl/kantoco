"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CGR_BASE, formatPhp, type Gown } from "@/lib/cgr-rentals";
import {
  addBooking,
  isRangeFree,
  useBookings,
  useToday,
} from "@/components/demos/cgr-rentals/bookings";
import { humanDate, ItalicLast } from "@/components/demos/cgr-rentals/GownDetail";

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ReserveForm({
  gown,
  initialDate,
}: {
  gown: Gown;
  initialDate: string;
}) {
  const router = useRouter();
  const today = useToday();
  const bookings = useBookings();
  const [eventPicked, setEventDate] = useState<string | null>(
    initialDate || null,
  );
  const [returnPicked, setReturnDate] = useState<string | null>(null);
  const eventDate = eventPicked ?? (today ? addDaysIso(today, 7) : "");
  const returnDate =
    returnPicked ?? (eventDate ? addDaysIso(eventDate, 1) : "");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isoOk = /^\d{4}-\d{2}-\d{2}$/;
  const validDates =
    isoOk.test(eventDate) && isoOk.test(returnDate) && returnDate >= eventDate;
  const past = today !== null && eventDate < today;
  const free = useMemo(
    () =>
      today !== null &&
      bookings !== null &&
      validDates &&
      isRangeFree(gown.slug, eventDate, returnDate, gown.bookedDates, bookings),
    [
      today,
      bookings,
      validDates,
      gown.slug,
      gown.bookedDates,
      eventDate,
      returnDate,
    ],
  );
  const canSave = free && !past;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !contact.trim()) {
      setError("Name and contact are required.");
      return;
    }
    if (!validDates) {
      setError("Return date must be on or after the event date.");
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
      notes: notes.trim(),
    });
    router.push(
      `${CGR_BASE}/confirmation?ref=${encodeURIComponent(booking.ref)}`,
    );
  }

  const days =
    validDates && eventDate && returnDate
      ? Math.round(
          (new Date(`${returnDate}T12:00:00`).getTime() - new Date(`${eventDate}T12:00:00`).getTime()) /
            86400000,
        ) + 1
      : null;

  return (
    <div className="cgr-wrap cgr-reserve">
      <p className="cgr-crumb cgr-micro">
        <Link href={CGR_BASE}>All gowns</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`${CGR_BASE}/gown/${gown.slug}`}>{gown.name}</Link>
        <span aria-hidden="true"> / </span>
        <span>Request a hold</span>
      </p>

      <ol className="cgr-rsteps" aria-label="Steps">
        <li className="is-done">
          <span className="cgr-rsteps-n" aria-hidden="true">I</span>
          <span className="cgr-micro">Gown and dates</span>
        </li>
        <li className="is-on" aria-current="step">
          <span className="cgr-rsteps-n" aria-hidden="true">II</span>
          <span className="cgr-micro">Your details</span>
        </li>
        <li>
          <span className="cgr-rsteps-n" aria-hidden="true">III</span>
          <span className="cgr-micro">Review</span>
        </li>
      </ol>

      <div className="cgr-reserve-grid">
        <form className="cgr-form" onSubmit={onSubmit} noValidate>
          <h1 className="cgr-h2">
            Request a <em>hold</em>
          </h1>
          <p className="cgr-lead">
            Saves a sample hold in this browser (localStorage) with a CGR-XXXX reference. Nothing is
            sent to the shop.
          </p>
          <label className="cgr-field">
            <span className="cgr-micro">Your name</span>
            <input
              type="text"
              autoComplete="name"
              placeholder="Maria Santos (example)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="cgr-field">
            <span className="cgr-micro">Contact (mobile or Messenger)</span>
            <input
              type="text"
              autoComplete="tel"
              placeholder="0917 000 0000 (example)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </label>
          <div className="cgr-form-row">
            <label className="cgr-field">
              <span className="cgr-micro">Event or pickup date</span>
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
            <label className="cgr-field">
              <span className="cgr-micro">Return date</span>
              <input
                type="date"
                value={returnDate}
                min={eventDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </label>
          </div>
          <p className={canSave ? "cgr-status cgr-avail-ok" : "cgr-status cgr-avail-no"} role="status">
            {today === null || bookings === null
              ? "Checking the sample calendar…"
              : !validDates
                ? "Return date must be on or after the event date."
                : past
                  ? "That date has passed. Pick today or later."
                  : free
                    ? `Sample calendar: free ${humanDate(eventDate)} to ${humanDate(returnDate)}.`
                    : `Sample calendar: ${humanDate(eventDate)} to ${humanDate(returnDate)} overlaps a hold.`}
          </p>
          <label className="cgr-field">
            <span className="cgr-micro">Notes (optional)</span>
            <textarea
              rows={3}
              placeholder="Fitting questions, pickup time (example)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          {error ? (
            <p className="cgr-status cgr-avail-no" role="alert">
              {error}
            </p>
          ) : null}
          <div className="cgr-actions">
            <button type="submit" className="cgr-btn" disabled={!canSave}>
              Save hold request
            </button>
            <Link className="cgr-link" href={`${CGR_BASE}/gown/${gown.slug}`}>
              Back to gown
            </Link>
          </div>
        </form>

        <aside className="cgr-summary ff-frame" aria-label="Summary">
          <p className="cgr-micro">Your hold · Example</p>
          <p className="cgr-summary-name">
            <ItalicLast text={gown.name} />
          </p>
          <dl className="cgr-specs">
            <div>
              <dt className="cgr-micro">Gown</dt>
              <dd>{gown.name}</dd>
            </div>
            <div>
              <dt className="cgr-micro">Dates</dt>
              <dd>
                {eventDate && returnDate && validDates
                  ? `${humanDate(eventDate)} to ${humanDate(returnDate)}`
                  : "Pick your dates"}
              </dd>
            </div>
            <div>
              <dt className="cgr-micro">Daily rate</dt>
              <dd>{formatPhp(gown.pricePerDay)} a day</dd>
            </div>
            <div>
              <dt className="cgr-micro">Days</dt>
              <dd>{days ?? "–"}</dd>
            </div>
          </dl>
          <p className="cgr-summary-note">
            Example rate. The shop confirms the hold and the final price.
          </p>
        </aside>
      </div>
    </div>
  );
}
