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

  return (
    <div className="cgr-wrap cgr-reserve">
      <p className="cgr-crumb">
        <Link href={CGR_BASE}>Catalogue</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`${CGR_BASE}/gown/${gown.slug}`}>{gown.name}</Link>
        <span aria-hidden="true"> / </span>
        <span>Reserve</span>
      </p>

      <div className="cgr-reserve-grid">
        <div>
          <h1 className="cgr-h1 cgr-h1-sm">Reservation request</h1>
          <p className="cgr-lead">
            Saves a sample booking in this browser (localStorage) with a{" "}
            <strong>CGR-XXXX</strong> reference. Nothing is sent to the shop.
          </p>
          <dl className="cgr-specs">
            <div>
              <dt>Item</dt>
              <dd>{gown.name}</dd>
            </div>
            <div>
              <dt>Sample rate</dt>
              <dd>{formatPhp(gown.pricePerDay)} / day</dd>
            </div>
          </dl>
        </div>

        <form className="cgr-form" onSubmit={onSubmit} noValidate>
          <label className="cgr-field">
            <span>Your name</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="cgr-field">
            <span>Contact (mobile or Messenger)</span>
            <input
              type="text"
              autoComplete="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </label>
          <div className="cgr-form-row">
            <label className="cgr-field">
              <span>Event / pickup date</span>
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
              <span>Return date</span>
              <input
                type="date"
                value={returnDate}
                min={eventDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </label>
          </div>
          <p
            className={canSave ? "cgr-avail-ok" : "cgr-avail-no"}
            role="status"
          >
            {today === null || bookings === null
              ? "Checking the sample calendar…"
              : !validDates
                ? "Return date must be on or after the event date."
                : past
                  ? "That date has passed. Pick today or later."
                  : free
                    ? `Sample calendar: free ${eventDate} → ${returnDate}.`
                    : `Sample calendar: ${eventDate} → ${returnDate} overlaps a hold.`}
          </p>
          <label className="cgr-field">
            <span>Notes (optional)</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          {error ? (
            <p className="cgr-avail-no" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="cgr-btn cgr-btn-primary"
            disabled={!canSave}
          >
            Save reservation request
          </button>
        </form>
      </div>
    </div>
  );
}
