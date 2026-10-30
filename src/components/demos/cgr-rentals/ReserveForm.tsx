"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CGR_BASE, SLUG_ALIASES, formatPhp, type Gown } from "@/lib/cgr-rentals";
import { addBooking, loadBookings, useBookings, useToday } from "@/components/demos/cgr-rentals/bookings";
import { Side, Steps, useStepFocus } from "@/components/demos/cgr-rentals/FlowBits";
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
  const ready = today !== null && rows !== null;
  const taken = ready && from ? takenDays(gown.slug, from, to, gown.bookedDates, rows, SLUG_ALIASES) : [];
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
    step === "details" ? "Details · Reserve" : state === "taken" ? "Taken · Reserve" : state === "past" ? "Past date · Reserve" : "Date · Reserve";
  const h1Ref = useStepFocus(stateKey, title);

  useEffect(() => {
    if (tries && errCount) alertRef.current?.focus();
  }, [tries, errCount]);

  const gownHref = `${CGR_BASE}/gown/${gown.slug}${from ? `?from=${from}&to=${to}` : ""}#dates`;
  const qs = (s?: string) => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (s) p.set("step", s);
    return `${pathname}?${p.toString()}`;
  };

  const days = from ? rentalDays(from, to) : null;
  const total = from ? customerTotal(gown.pricePerDay, from, to) : null;
  // Rows come from the URL dates alone (not the async check), so the
  // summary never grows after load (CLS 0).
  const sideRows: [string, string][] =
    from && total !== null
      ? [
          ["Event day", humanDate(from)],
          ["Return", humanDate(to)],
          [`${days} days at ${formatPhp(gown.pricePerDay)}`, total !== null ? formatPhp(total) : ""],
        ]
      : [];
  const mob = from && total !== null ? `${rangeLabel(from, to)} · ${formatPhp(total)}` : `${formatPhp(gown.pricePerDay)} a day`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errs = {};
    if (!f.name.trim()) next.name = "Please add your name.";
    if (!f.contact.trim()) next.contact = "Please add a mobile number or Messenger name.";
    setErrs(next);
    setTries((t) => t + 1);
    if (Object.keys(next).length) return;
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
        ) : null}
        <div className="r11-row">
          <div className="r11-field">
            <label htmlFor={ids.n}>Your name</label>
            <input
              id={ids.n}
              name="name"
              autoComplete="name"
              placeholder="Ana Santos"
              value={f.name}
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
            placeholder="Debut, size M, I’d like it hemmed"
            value={f.notes}
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

  return (
    <section className="r11-fl" aria-label={`Reserve ${gown.name}`}>
      <div className="r11-main">
        <Steps labels={["Date", "Details", "Done"]} at={step === "details" ? 1 : 0} label="Reserve steps" />
        {main}
      </div>
      <Side gown={gown} rows={sideRows} mob={mob} note="Example rates. No payment now." />
    </section>
  );
}
