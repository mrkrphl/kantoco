"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CGR_BASE, CGR_FLAGS, FITTING_SLOTS, getGown, type Booking } from "@/lib/cgr-rentals";
import { addBooking, loadBookings, useBookings, useToday } from "@/components/demos/cgr-rentals/bookings";
import { Calendar, type DayKind } from "@/components/demos/cgr-rentals/Calendar";
import { Side, Steps, useStepFocus } from "@/components/demos/cgr-rentals/FlowBits";
import { BookingUnavailable, Honeypot } from "@/components/demos/cgr-rentals/DbBits";
import {
  DB_ON,
  dbCreateFitting,
  dbFittingTimes,
  dbMessage,
  dbSummary,
  dbTakenSlots,
  summaryToBooking,
  useDbRead,
  type Summary,
} from "@/components/demos/cgr-rentals/db";
import {
  REF_PATTERN,
  horizonIso,
  exampleTakenFor,
  fittingDayState,
  humanDate,
  isFitting,
  slotLabel,
  slotTaken,
} from "@/components/demos/cgr-rentals/reserveMath";

type Errs = Partial<Record<"code" | "name" | "contact", string>>;

/**
 * r7.11 fitting flow (spec §6): 01 Day · 02 Time · 03 Done.
 * Opened from Done (?ref=, linked to that reservation) or from a gown
 * page's "Book a fitting" (?gown=). The reservation code is optional
 * (CGR_FLAGS.fittingCodeRequired = false); without one we ask a name and a
 * contact. Days: from today (Manila) and before the event; states past and
 * before-event. Times are a radiogroup of four unlabelled
 * slots (r8.0: no "example" note); a slot is taken only when a saved fitting
 * has the same day and time (FITTING_SLOTS.exampleTaken is empty), re-checked on submit (state "slot taken"). Fittings
 * never hold a gown and never count toward the commission.
 *
 * r8.2: with the database on (DB_ON) the times come from fitting_times, a
 * slot is taken per taken_slots(day), and the save is create_fitting (which
 * re-checks under a lock; a lost race shows "just taken"). A code is looked
 * up on this device first (older on-device codes still work), then with
 * booking_summary. Days are open up to a year ahead.
 */
export function FittingFlow({ refCode, gownSlug }: { refCode: string; gownSlug: string }) {
  const router = useRouter();
  const rows = useBookings();
  const today = useToday();
  const [step, setStep] = useState<"day" | "time">("day");
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [code, setCode] = useState("");
  const [linkRef, setLinkRef] = useState(refCode.trim().toUpperCase());
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [errs, setErrs] = useState<Errs>({});
  const [lost, setLost] = useState(""); // f2x: the slot that was just taken
  const [tries, setTries] = useState(0);
  const [saving, setSaving] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // r8.2 database mode
  const [down, setDown] = useState(false);
  const [sendErr, setSendErr] = useState("");
  const [website, setWebsite] = useState("");
  const [typed, setTyped] = useState<Summary | null>(null); // a code typed on step 01
  const [bump, setBump] = useState(0);
  const [looking, setLooking] = useState(false);

  const localLinked: Booking | undefined =
    rows && linkRef ? rows.find((b) => b.ref === linkRef && !isFitting(b)) : undefined;
  const askDb = DB_ON && rows !== null && !!linkRef && !localLinked && REF_PATTERN.test(linkRef) && typed?.ref !== linkRef;
  const fromUrl = useDbRead(askDb ? `sum|${linkRef}` : null, () => dbSummary(linkRef));
  const sum = typed?.ref === linkRef ? typed : fromUrl && fromUrl !== "unavailable" ? fromUrl : null;
  const dbLinked = sum && sum.kind === "reserve" ? summaryToBooking(sum) : undefined;
  const linked: Booking | undefined = localLinked ?? dbLinked;
  const gown = getGown(linked?.gownSlug ?? gownSlug);
  const event = linked?.eventDate ?? "";
  const linkPending = askDb && fromUrl === undefined;
  const refMissing = !!(rows && refCode && !linked && !linkPending && linkRef === refCode.trim().toUpperCase());

  const dbTimes = useDbRead(DB_ON ? "times" : null, () => dbFittingTimes());
  const times: readonly string[] =
    DB_ON && Array.isArray(dbTimes) && dbTimes.length ? dbTimes : FITTING_SLOTS.times;
  const dbSlots = useDbRead(DB_ON && step === "time" && day ? `slots|${day}|${bump}` : null, () => dbTakenSlots(day));

  const dState = today ? fittingDayState(day, today, event) : "missing";
  const exTaken = day ? exampleTakenFor(day, FITTING_SLOTS.exampleTaken) : [];
  const isTaken = (s: string) =>
    DB_ON ? Array.isArray(dbSlots) && dbSlots.includes(s) : slotTaken(day, s, rows ?? [], exTaken);
  const free: string[] = times.filter((s) => !isTaken(s));
  const errCount = Object.keys(errs).length;

  const title = step === "time" ? (lost ? "Slot taken · Fitting" : "Time · Fitting") : dState === "before-event" ? "Before your event · Fitting" : "Day · Fitting";
  const h1Ref = useStepFocus(`${step}`, title);
  useEffect(() => {
    if ((tries && (errCount || lost)) || sendErr) alertRef.current?.focus();
  }, [tries, errCount, lost, sendErr]);

  if (DB_ON && (down || fromUrl === "unavailable" || dbTimes === "unavailable" || dbSlots === "unavailable")) {
    return <BookingUnavailable what="Fitting booking" />;
  }
  if (!rows || !today || linkPending || (DB_ON && dbTimes === undefined)) {
    return (
      <section className="r11-fl">
        <div className="r11-main">
          <h1>Opening the fitting calendar…</h1>
        </div>
      </section>
    );
  }
  if (!gown) {
    return (
      <section className="r11-fl">
        <div className="r11-main">
          <Steps labels={["Day", "Time", "Done"]} at={0} label="Fitting steps" />
          <h1 ref={h1Ref} tabIndex={-1}>
            Choose a gown first.
          </h1>
          <p className="r11-sub" style={{ marginTop: 0 }}>
            Open a gown and tap “Book a fitting”, or reserve one first.
          </p>
          <Link className="r11-btn r11-wine" href={`${CGR_BASE}#rail`}>
            See the gowns
          </Link>
        </div>
      </section>
    );
  }

  const last = horizonIso(today);
  const kindOf = (d: string): DayKind => (d < today || d > last || (event && d >= event) ? "off" : "open");

  const toTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (looking) return;
    const c = code.trim().toUpperCase();
    if (!linked && c) {
      let hit: Booking | undefined = rows.find((b) => b.ref === c && !isFitting(b));
      if (!hit && DB_ON && REF_PATTERN.test(c)) {
        setLooking(true);
        const r = await dbSummary(c);
        setLooking(false);
        if (!r.ok) {
          setDown(true);
          return;
        }
        if (r.data && r.data.kind === "reserve") {
          setTyped(r.data);
          hit = summaryToBooking(r.data);
        }
      }
      if (!REF_PATTERN.test(c) || !hit) {
        setErrs({
          code: DB_ON
            ? "We can’t find that reservation code. Check it, or leave it empty."
            : "That code is not saved in this browser. Check it, or leave it empty.",
        });
        setTries((t) => t + 1);
        return;
      }
      setLinkRef(c);
      if (day >= hit.eventDate) {
        setErrs({});
        return; // the status line now says "before your event"
      }
    }
    if (dState !== "ok") return;
    setErrs({});
    setSendErr("");
    setStep("time");
  };

  const bookDb = async () => {
    setSaving(true);
    setSendErr("");
    // A code saved only on this device isn't in the database: send its name
    // and contact. A database code: the database copies them itself.
    const r = await dbCreateFitting({
      day,
      slot,
      name: localLinked ? localLinked.customerName : linked ? "" : name.trim(),
      contact: localLinked ? localLinked.customerContact : linked ? "" : contact.trim(),
      linkedRef: linked?.ref ?? null,
      slug: gown.slug,
      website,
    });
    if (r.ok) {
      router.push(`${CGR_BASE}/confirmation?ref=${encodeURIComponent(r.ref)}`);
      return;
    }
    setSaving(false);
    if (r.error === "unavailable") setDown(true);
    else if (r.error === "taken") {
      setLost(slot);
      setSlot("");
      setBump((n) => n + 1);
    } else if (r.error === "past" || r.error === "before-event" || r.error === "too_far" || r.error === "missing") {
      setStep("day");
      setSendErr(dbMessage(r.error));
    } else setSendErr(dbMessage(r.error));
  };

  const book = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const next: Errs = {};
    if (!linked) {
      if (!name.trim()) next.name = "Please add your name.";
      if (!contact.trim()) next.contact = "Please add a mobile number or Messenger name.";
    }
    setErrs(next);
    setTries((t) => t + 1);
    if (Object.keys(next).length || !slot) return;
    if (DB_ON) {
      void bookDb();
      return;
    }
    const latest = loadBookings();
    if (slotTaken(day, slot, latest, exTaken)) {
      setLost(slot);
      setSlot("");
      return;
    }
    if (fittingDayState(day, today, event) !== "ok") {
      setStep("day");
      return;
    }
    setSaving(true);
    const b = addBooking({
      kind: "fitting",
      fittingDate: day,
      slot,
      linkedRef: linked?.ref,
      gownSlug: gown.slug,
      gownName: gown.name,
      eventDate: linked?.eventDate ?? "",
      returnDate: linked?.returnDate ?? "",
      customerName: linked?.customerName ?? name.trim(),
      customerContact: linked?.customerContact ?? contact.trim(),
      notes: "",
    });
    router.push(`${CGR_BASE}/confirmation?ref=${encodeURIComponent(b.ref)}`);
  };

  const onSlotKey = (e: React.KeyboardEvent, s: string) => {
    const k = e.key;
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(k) || !free.length) return;
    e.preventDefault();
    const at = free.indexOf(s);
    const nextIdx =
      k === "Home" ? 0 : k === "End" ? free.length - 1 : (Math.max(at, 0) + (k === "ArrowRight" || k === "ArrowDown" ? 1 : -1) + free.length) % free.length;
    const ns = free[nextIdx];
    setSlot(ns);
    setLost("");
    slotRefs.current[times.indexOf(ns)]?.focus();
  };

  const side = (
    <Side
      gown={gown}
      rows={[
        ...(linked ? ([["Reservation", linked.ref], ["Event day", humanDate(event)]] as [string, string][]) : []),
        ...(day && dState === "ok" ? ([["Fitting", `${humanDate(day)}${slot ? `, ${slotLabel(slot)}` : ""}`]] as [string, string][]) : []),
      ]}
      mob={linked ? `${linked.ref} · event ${humanDate(event)}` : "Fitting at the shop"}
      note="Nothing is final until the shop messages you."
    />
  );

  if (saving) {
    return (
      <section className="r11-fl">
        <div className="r11-main">
          <h1>Booking your fitting…</h1>
        </div>
      </section>
    );
  }

  if (step === "day") {
    let status = "Tap a day for your fitting.";
    let tone = "";
    if (dState === "ok") {
      status = `${humanDate(day)} works.`;
      tone = "ok";
    } else if (dState === "before-event") {
      status = `Fittings happen before the event. Please pick a day before ${humanDate(event)}.`;
      tone = "no";
    } else if (dState === "past") {
      status = "That day has already passed. Please pick a day from today onward.";
      tone = "no";
    } else if (dState === "too_far") {
      status = "Fittings open up to a year ahead. Please pick an earlier day.";
      tone = "no";
    }
    return (
      <section className="r11-fl" aria-label="Book a fitting">
        <form className="r11-main" onSubmit={toTime} noValidate>
          <Steps labels={["Day", "Time", "Done"]} at={0} label="Fitting steps" />
          <h1 ref={h1Ref} tabIndex={-1}>
            Pick a day for your <em>fitting.</em>
          </h1>
          <p className="r11-sub">
            {event ? `Any day before your event on ${humanDate(event)}.` : "Any day from today, before your event."}
          </p>
          {refMissing ? (
            <p className="r11-alert" role="status">
              {DB_ON ? `We can’t find ${refCode}.` : `${refCode} is not saved in this browser.`} You can still book a
              fitting.
            </p>
          ) : null}
          {sendErr ? (
            <p className="r11-alert" role="status" data-db-error="">
              {sendErr}
            </p>
          ) : null}
          {errs.code ? (
            <div ref={alertRef} className="r11-alert" role="alert" tabIndex={-1}>
              One detail needs a look. Please check the field marked below.
            </div>
          ) : null}
          {!linked ? (
            <div className="r11-field" style={{ maxWidth: 360 }}>
              <label htmlFor="f-code">
                Reservation code{" "}
                {CGR_FLAGS.fittingCodeRequired ? null : <span>(optional)</span>}
              </label>
              <input
                id="f-code"
                name="code"
                placeholder="CGR-7KQ2"
                autoComplete="off"
                autoCapitalize="characters"
                value={code}
                aria-invalid={errs.code ? true : undefined}
                aria-describedby={`f-code-h${errs.code ? " f-code-e" : ""}`}
                onChange={(e) => setCode(e.target.value)}
              />
              <p className="hint" id="f-code-h">
                Links this fitting to your reservation.
              </p>
              {errs.code ? (
                <p className="msg" id="f-code-e">
                  {errs.code}
                </p>
              ) : null}
            </div>
          ) : null}
          <div style={{ width: "100%", maxWidth: 480 }}>
            <Calendar
              value={day}
              today={today}
              kindOf={kindOf}
              label="Fitting day"
              offLabel="not available"
              onPick={(d) => {
                setDay(d);
                setSlot("");
                setLost("");
              }}
            />
            <p className={`r11-status ${tone}`} role="status">
              {status}
            </p>
          </div>
          {dState === "ok" ? (
            <button type="submit" className="r11-btn r11-wine" aria-busy={looking || undefined}>
              {looking ? "Checking your code…" : "Continue"}
            </button>
          ) : (
            <button type="button" className="r11-btn r11-wine" disabled aria-disabled="true">
              {dState === "before-event" || dState === "too_far"
                ? "Pick an earlier day"
                : dState === "past"
                  ? "Pick another day"
                  : "Pick a day"}
            </button>
          )}
        </form>
        {side}
      </section>
    );
  }

  const cta = slot ? `Book ${humanDate(day)}, ${slotLabel(slot)}` : "Choose a time";
  const tabSlot = slot || free[0] || "";
  return (
    <section className="r11-fl" aria-label="Book a fitting">
      <form className="r11-main" onSubmit={book} noValidate>
        <Steps labels={["Day", "Time", "Done"]} at={1} label="Fitting steps" />
        <h1 ref={h1Ref} tabIndex={-1}>
          Choose a <em>time.</em>
        </h1>
        <p className="r11-sub">
          {humanDate(day)} at the shop.{" "}
          <button
            type="button"
            className="r11-link"
            style={{ background: "none", border: 0, padding: 0, font: "inherit", cursor: "pointer" }}
            onClick={() => {
              setStep("day");
              setLost("");
            }}
          >
            Change day
          </button>
        </p>
        {lost || errCount || sendErr ? (
          <div ref={alertRef} className="r11-alert" role="alert" tabIndex={-1} data-db-error={sendErr ? "" : undefined}>
            {lost
              ? `Sorry, ${slotLabel(lost)} was just taken. Please choose another time.`
              : errCount === 2
                ? "Two details are missing. Please check the fields marked below."
                : errCount
                  ? "One detail is missing. Please check the field marked below."
                  : sendErr}
          </div>
        ) : null}
        <Honeypot value={website} onChange={setWebsite} />
        <div style={{ width: "100%" }}>
          <p id="slots-l" className="sr-only">
            Fitting times
          </p>
          <div
            className="r11-slots"
            role="radiogroup"
            aria-labelledby="slots-l"
            aria-busy={DB_ON && dbSlots === undefined ? true : undefined}
          >
            {times.map((s, i) => {
              const tk = isTaken(s);
              return (
                <button
                  key={s}
                  ref={(el) => {
                    slotRefs.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  className={tk ? "r11-slot tk" : "r11-slot"}
                  aria-checked={slot === s}
                  aria-disabled={tk ? true : undefined}
                  tabIndex={!tk && s === tabSlot ? 0 : -1}
                  onKeyDown={(e) => onSlotKey(e, s)}
                  onClick={() => {
                    if (tk || (DB_ON && dbSlots === undefined)) return;
                    setSlot(s);
                    setLost("");
                  }}
                >
                  <span className="t">{slotLabel(s)}</span>
                  {tk ? <small>Taken</small> : null}
                </button>
              );
            })}
          </div>
        </div>
        {!linked ? (
          <div className="r11-row">
            <div className="r11-field">
              <label htmlFor="f-name">Your name</label>
              <input
                id="f-name"
                autoComplete="name"
                placeholder="Ana Santos"
                value={name}
                maxLength={80}
                aria-invalid={errs.name ? true : undefined}
                aria-describedby={errs.name ? "f-name-e" : undefined}
                onChange={(e) => setName(e.target.value)}
              />
              {errs.name ? (
                <p className="msg" id="f-name-e">
                  {errs.name}
                </p>
              ) : null}
            </div>
            <div className="r11-field">
              <label htmlFor="f-contact">Mobile or Messenger</label>
              <input
                id="f-contact"
                autoComplete="tel"
                placeholder="0917 000 0000"
                value={contact}
                maxLength={80}
                aria-invalid={errs.contact ? true : undefined}
                aria-describedby={`f-contact-h${errs.contact ? " f-contact-e" : ""}`}
                onChange={(e) => setContact(e.target.value)}
              />
              <p className="hint" id="f-contact-h">
                Only used to confirm this fitting.
              </p>
              {errs.contact ? (
                <p className="msg" id="f-contact-e">
                  {errs.contact}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        {slot ? (
          <button type="submit" className="r11-btn r11-wine">
            {cta}
          </button>
        ) : (
          <button type="button" className="r11-btn r11-wine" disabled aria-disabled="true">
            {cta}
          </button>
        )}
      </form>
      {side}
    </section>
  );
}
