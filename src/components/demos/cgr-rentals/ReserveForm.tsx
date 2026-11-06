"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CGR_BASE, SLUG_ALIASES, type Gown } from "@/lib/cgr-rentals";
import { addBooking, loadBookings, useBookings, useToday } from "@/components/demos/cgr-rentals/bookings";
import { Side, Steps, useStepFocus } from "@/components/demos/cgr-rentals/FlowBits";
import { BookingUnavailable, Honeypot } from "@/components/demos/cgr-rentals/DbBits";
import { DB_ON, dbCreateReservation, dbMessage, dbTakenDays, useDbRead } from "@/components/demos/cgr-rentals/db";
import {
  customerTotal,
  defaultReturn,
  humanDate,
  rangeLabel,
  rentalDays,
  reserveState,
  takenDays,
  takenSentence,
} from "@/components/demos/cgr-rentals/reserveMath";

type Fields = { name: string; contact: string; notes: string };
const EMPTY: Fields = { name: "", contact: "", notes: "" };
const KEY = (slug: string) => `cgr-reserve-v2:${slug}`;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * r7.11 Reserve flow (spec §5): 01 Date · 02 Details · 03 Done.
 * 01 shows the dates picked on the gown page and re-checks them on entry
 * (states: free, taken, past, missing). 02 asks name, contact and an
 * optional note (the occasion folds in here, CGR_FLAGS.occasionField off);
 * example values are placeholders only. Errors show on submit, never on
 * blur. The save re-checks the dates, writes a record (kind "reserve") and
 * opens Done (/confirmation?ref=). Customer total = rate x days; the
 * commission never shows here. The step lives in ?step= so Back works.
 *
 * r8.2: with the database on (DB_ON) the dates are checked with taken_days
 * and saved with create_reservation, which re-checks under a lock; a lost
 * race shows the taken state with the server's days. Stays are 30 days at
 * most and up to a year ahead. A paused or unreachable database shows the
 * calm "unavailable" state. Without the env vars nothing changes.
 */
export function ReserveForm({ gown, initialDate, initialReturn = "" }: { gown: Gown; initialDate: string; initialReturn?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const today = useToday();
  const rows = useBookings();
  const noun = gown.category === "accessory" ? "piece" : "gown";

  const from = ISO.test(initialDate) ? initialDate : "";
  const to = from ? (ISO.test(initialReturn) && initialReturn >= from ? initialReturn : defaultReturn(from)) : "";
  // r8.2: database mode reads taken days from the server; local rows stay on-device only.
  const [lost, setLost] = useState<{ k: string; days: string[] } | null>(null);
  const lostDays = lost && lost.k === `${from}|${to}` ? lost.days : null;
  const [down, setDown] = useState(false);
  const [sendErr, setSendErr] = useState("");
  const [website, setWebsite] = useState("");
  const pre = today !== null ? reserveState(from, to, today, []) : null;
  const dbTaken = useDbRead(DB_ON && pre === "ok" ? `${gown.slug}|${from}|${to}` : null, () =>
    dbTakenDays(gown.slug, from, to),
  );
  const ready = today !== null && (DB_ON ? pre !== "ok" || dbTaken !== undefined : rows !== null);
  const fixed = from ? takenDays(gown.slug, from, to, gown.bookedDates, [], SLUG_ALIASES) : [];
  const taken =
    !ready || !from
      ? []
      : DB_ON
        ? [...new Set([...fixed, ...(lostDays ?? (Array.isArray(dbTaken) ? dbTaken : []))])].sort()
        : takenDays(gown.slug, from, to, gown.bookedDates, rows ?? [], SLUG_ALIASES);
  const state = ready ? reserveState(from, to, today, taken) : null;
  const wantDetails = params.get("step") === "2";
  const step: "date" | "details" = state === "ok" && wantDetails ? "details" : "date";

  const [f, setF] = useState<Fields>(EMPTY);
  const [errs, setErrs] = useState<Partial<Record<"name" | "contact", string>>>({});
  const [tries, setTries] = useState(0);
  const [saving, setSaving] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(KEY(gown.slug));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setF({ ...EMPTY, ...(JSON.parse(raw) as Partial<Fields>) });
    } catch {
      /* ignore */
    }
  }, [gown.slug]);
  const set = (k: keyof Fields, v: string) => {
    const next = { ...f, [k]: v };
    setF(next);
    try {
      window.sessionStorage.setItem(KEY(gown.slug), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const errCount = Object.keys(errs).length;
  const stateKey = `${step}:${state ?? "load"}`;
  const title =
    step === "details"
      ? "Details · Reserve"
      : state === "taken"
        ? "Taken · Reserve"
        : state === "past"
          ? "Past date · Reserve"
          : state === "too_long" || state === "too_far"
            ? "Dates · Reserve"
            : "Date · Reserve";
  const h1Ref = useStepFocus(stateKey, title);

  useEffect(() => {
    if ((tries && errCount) || sendErr) alertRef.current?.focus();
  }, [tries, errCount, sendErr]);

  const gownHref = `${CGR_BASE}/gown/${gown.slug}${from ? `?from=${from}&to=${to}` : ""}#dates`;
  const qs = (s?: string) => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (s) p.set("step", s);
    return `${pathname}?${p.toString()}`;
  };

  const days = from ? rentalDays(from, to) : null;
  // r8.0: the customer total stays rate x days (customerTotal) but no
  // amount is shown to customers; the summary shows the days only.
  const total = from ? customerTotal(gown.pricePerDay, from, to) : null;
  // Rows come from the URL dates alone (not the async check), so the
  // summary never grows after load (CLS 0).
  const sideRows: [string, string][] =
    from && total !== null
      ? [
          ["Event day", humanDate(from)],
          ["Return", humanDate(to)],
          ["Rental", `${days} ${days === 1 ? "day" : "days"}`],
        ]
      : [];
  const mob = from && total !== null ? `${rangeLabel(from, to)} · ${days} ${days === 1 ? "day" : "days"}` : "Pick your dates";

  const submitDb = async () => {
    setSaving(true);
    setSendErr("");
    const r = await dbCreateReservation({
      slug: gown.slug,
      event: from,
      ret: to,
      name: f.name.trim(),
      contact: f.contact.trim(),
      notes: f.notes.trim(),
      website,
    });
    if (r.ok) {
      try {
        window.sessionStorage.removeItem(KEY(gown.slug));
      } catch {
        /* ignore */
      }
      router.push(`${CGR_BASE}/confirmation?ref=${encodeURIComponent(r.ref)}`);
      return;
    }
    setSaving(false);
    if (r.error === "unavailable") setDown(true);
    else if (r.error === "taken") {
      setLost({ k: `${from}|${to}`, days: r.days && r.days.length ? r.days : [from] });
      router.replace(qs());
    } else if (r.error === "past" || r.error === "missing") router.replace(qs());
    else setSendErr(dbMessage(r.error, noun));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const next: typeof errs = {};
    if (!f.name.trim()) next.name = "Please add your name.";
    if (!f.contact.trim()) next.contact = "Please add a mobile number or Messenger name.";
    setErrs(next);
    setTries((t) => t + 1);
    if (Object.keys(next).length) return;
    if (DB_ON) {
      void submitDb();
      return;
    }
    // Re-check the dates against everything saved, right now.
    const latest = loadBookings();
    const t2 = takenDays(gown.slug, from, to, gown.bookedDates, latest, SLUG_ALIASES);
    if (reserveState(from, to, today ?? "", t2) !== "ok") {
      router.replace(qs());
      return;
    }
    setSaving(true);
    const b = addBooking({
      kind: "reserve",
      gownSlug: gown.slug,
      gownName: gown.name,
      eventDate: from,
      returnDate: to,
      customerName: f.name.trim(),
      customerContact: f.contact.trim(),
      notes: f.notes.trim(),
    });
    try {
      window.sessionStorage.removeItem(KEY(gown.slug));
    } catch {
      /* ignore */
    }
    router.push(`${CGR_BASE}/confirmation?ref=${encodeURIComponent(b.ref)}`);
  };

  let main: React.ReactNode;
  if (saving) {
    main = (
      <h1 ref={h1Ref} tabIndex={-1}>
        Reserving…
      </h1>
    );
  } else if (state === null) {
    main = (
      <h1 ref={h1Ref} tabIndex={-1}>
        Checking your date…
      </h1>
    );
  } else if (step === "details") {
    const ids = { n: "r-name", c: "r-contact", o: "r-notes" };
    main = (
      <form onSubmit={submit} noValidate className="r11-main" style={{ maxWidth: "none", width: "100%" }}>
        <h1 ref={h1Ref} tabIndex={-1}>
          Who should the shop <em>message?</em>
        </h1>
        <p className="r11-sub">The shop messages you to confirm your {noun} and dates.</p>
        {errCount ? (
          <div ref={alertRef} className="r11-alert" role="alert" tabIndex={-1}>
            {errCount === 2
              ? "Two details are missing. Please check the fields marked below."
              : "One detail is missing. Please check the field marked below."}
          </div>
        ) : sendErr ? (
          <div ref={alertRef} className="r11-alert" role="alert" tabIndex={-1} data-db-error="">
            {sendErr}
          </div>
        ) : null}
        <Honeypot value={website} onChange={setWebsite} />
        <div className="r11-row">
          <div className="r11-field">
            <label htmlFor={ids.n}>Your name</label>
            <input
              id={ids.n}
              name="name"
              autoComplete="name"
              placeholder="Ana Santos"
              value={f.name}
              maxLength={80}
              required
              aria-invalid={errs.name ? true : undefined}
              aria-describedby={errs.name ? `${ids.n}-e` : undefined}
              onChange={(e) => set("name", e.target.value)}
            />
            {errs.name ? (
              <p className="msg" id={`${ids.n}-e`}>
                {errs.name}
              </p>
            ) : null}
          </div>
          <div className="r11-field">
            <label htmlFor={ids.c}>Mobile or Messenger</label>
            <input
              id={ids.c}
              name="contact"
              autoComplete="tel"
              placeholder="0917 000 0000"
              value={f.contact}
              maxLength={80}
              required
              aria-invalid={errs.contact ? true : undefined}
              aria-describedby={`${ids.c}-h${errs.contact ? ` ${ids.c}-e` : ""}`}
              onChange={(e) => set("contact", e.target.value)}
            />
            <p className="hint" id={`${ids.c}-h`}>
              Only used to confirm this reservation.
            </p>
            {errs.contact ? (
              <p className="msg" id={`${ids.c}-e`}>
                {errs.contact}
              </p>
            ) : null}
          </div>
        </div>
        <div className="r11-field">
          <label htmlFor={ids.o}>
            Anything the shop should know? <span>(optional)</span>
          </label>
          <textarea
            id={ids.o}
            name="notes"
            placeholder="Debut, I’d like it hemmed"
            value={f.notes}
            maxLength={500}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
        <div className="r11-acts">
          <button type="submit" className="r11-btn r11-wine">
            Reserve your {noun}
          </button>
          <Link className="r11-link" href={qs()}>
            Back
          </Link>
        </div>
        <p className="r11-note">No payment now. Nothing is final until the shop messages you.</p>
      </form>
    );
  } else if (state === "ok") {
    main = (
      <>
        <h1 ref={h1Ref} tabIndex={-1}>
          Your {noun} is <em>free</em> on your day.
        </h1>
        <dl className="r11-datecard">
          <div>
            <dt>Event day</dt>
            <dd>{humanDate(from)}</dd>
          </div>
          <div>
            <dt>Return</dt>
            <dd>{humanDate(to)}</dd>
          </div>
          <Link className="r11-link" href={gownHref}>
            Change dates
          </Link>
        </dl>
        <Link className="r11-btn r11-wine" href={qs("2")}>
          Continue
        </Link>
      </>
    );
  } else {
    const copy =
      state === "taken"
        ? { h: `Sorry, this ${noun} is taken that day.`, p: takenSentence(from, to, taken) }
        : state === "past"
          ? { h: "That date has already passed.", p: `Pick a day from today onward on the ${noun}’s calendar.` }
          : state === "too_long"
            ? { h: "That stay is too long.", p: "Online reservations can be up to 30 days. For longer, message the shop." }
            : state === "too_far"
              ? { h: "That date is too far ahead.", p: "Online reservations open up to a year ahead. Please pick an earlier day." }
              : { h: "Pick your date first.", p: `Tap your event day on the ${noun}’s calendar.` };
    main = (
      <>
        <h1 ref={h1Ref} tabIndex={-1} data-state={state}>
          {copy.h}
        </h1>
        <p className="r11-sub" style={{ marginTop: 0 }}>
          {copy.p}
        </p>
        <Link className="r11-btn r11-wine" href={gownHref}>
          {state === "missing" ? "Pick your date" : "Pick another date"}
        </Link>
      </>
    );
  }

  if (DB_ON && (down || dbTaken === "unavailable")) return <BookingUnavailable what="Booking" />;

  return (
    <section className="r11-fl" aria-label={`Reserve ${gown.name}`}>
      <div className="r11-main">
        <Steps labels={["Date", "Details", "Done"]} at={step === "details" ? 1 : 0} label="Reserve steps" />
        {main}
      </div>
      <Side gown={gown} rows={sideRows} mob={mob} note="No payment on this site." />
    </section>
  );
}
