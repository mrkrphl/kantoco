"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CGR_BASE, STATUS_LABEL, cgr, getGown, type Booking } from "@/lib/cgr-rentals";
import { useBookings } from "@/components/demos/cgr-rentals/bookings";
import { Side, Steps } from "@/components/demos/cgr-rentals/FlowBits";
import { BookingUnavailable } from "@/components/demos/cgr-rentals/DbBits";
import { DB_ON, dbSummary, summaryToBooking, useDbRead } from "@/components/demos/cgr-rentals/db";
import {
  REF_PATTERN,
  customerTotal,
  gapPhrase,
  humanDate,
  isFitting,
  rangeLabel,
  rentalDays,
  slotLabel,
} from "@/components/demos/cgr-rentals/reserveMath";

/** 1x1 transparent GIF: the placeholder photo takes the real photo's fixed height. */
const SPACER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Record card used on Done (both flows). */
export function RecordCard({ b, linkedTo }: { b: Booking; linkedTo?: string }) {
  const fit = isFitting(b);
  return (
    <div className="r11-record" data-ref={b.ref}>
      <span className={fit ? "r11-tag fit" : "r11-tag"}>{fit ? "Fitting" : "Reserve"}</span>
      <span className="r">
        {fit ? `${humanDate(b.fittingDate ?? "")}, ${slotLabel(b.slot ?? "")}` : b.gownName}
      </span>
      <span className="s">{STATUS_LABEL[b.status]}</span>
      <span />
      <span className="s" style={{ gridColumn: "2 / -1" }}>
        {fit
          ? linkedTo
            ? `For reservation ${linkedTo} · ${b.gownName}`
            : [b.gownName, b.customerName].filter(Boolean).join(" · ")
          : [rangeLabel(b.eventDate, b.returnDate || b.eventDate), b.customerName].filter(Boolean).join(" · ")}
      </span>
    </div>
  );
}

/**
 * r7.11 Done (spec §5 03 Done and §6 f3). One page for both flows, by ref:
 * old refs and old rows (no `kind`) open as reservations. The code is big
 * and selectable; the record card mirrors what the owner sees.
 *
 * r8.2: codes saved on this device open first (older on-device codes still
 * work). Otherwise, with the database on, booking_summary looks the code up:
 * status and dates only, never a name or contact.
 */
export function Confirmation({ refCode }: { refCode: string }) {
  const rows = useBookings();
  const want = refCode.trim().toUpperCase();
  const local = rows?.find((x) => x.ref === want) ?? null;
  const askDb = DB_ON && rows !== null && !local && REF_PATTERN.test(want);
  const sum = useDbRead(askDb ? `sum|${want}` : null, () => dbSummary(want));
  const remote = sum && sum !== "unavailable" ? summaryToBooking(sum) : null;
  const b: Booking | null = local ?? remote;
  const fit = b ? isFitting(b) : false;
  const gown = b ? getGown(b.gownSlug) : undefined;
  const linkWant = fit && b?.linkedRef && !rows?.some((x) => x.ref === b.linkedRef) ? b.linkedRef : "";
  const linkSum = useDbRead(DB_ON && linkWant ? `sum|${linkWant}` : null, () => dbSummary(linkWant));
  // Wait for the linked reservation too, so the event line doesn't pop in late.
  const pending = (askDb && sum === undefined) || (DB_ON && !!linkWant && linkSum === undefined);

  useEffect(() => {
    if (!rows || pending) return;
    document.title = `${b ? (fit ? "Fitting booked" : "Reserved") : "Code not found"} · Cavite Gown Rentals`;
  }, [rows, pending, b, fit]);

  if (askDb && sum === "unavailable") return <BookingUnavailable what="Looking up your code" />;

  if (!rows || pending) {
    // r8.2: the database lookup is async, so the placeholder keeps Done's
    // shape (steps, script line, and an invisible summary of the same size,
    // which sits above the text on phones): nothing moves when it lands (CLS 0).
    return (
      <section className="r11-fl" aria-busy="true">
        <div className="r11-main r11-done" key="wait">
          <div aria-hidden="true" style={{ visibility: "hidden" }}>
            <Steps labels={["Date", "Details", "Done"]} at={2} label="Steps" />
          </div>
          <p className="r11-script" aria-hidden="true" style={{ visibility: "hidden" }}>
            Thank you
          </p>
          <h1>Opening your booking…</h1>
        </div>
        {REF_PATTERN.test(want) ? (
          <div className="r11-side" aria-hidden="true" style={{ visibility: "hidden" }}>
            <figure className="r11-mat">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SPACER} alt="" />
            </figure>
            <div>
              <p className="nm">&nbsp;</p>
              <p className="mob">&nbsp;</p>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  if (!b) {
    return (
      <section className="r11-fl">
        <div className="r11-main">
          <h1 tabIndex={-1}>We can’t find that code.</h1>
          <p className="r11-sub" style={{ marginTop: 0 }}>
            {!refCode
              ? "No code was given."
              : DB_ON
                ? `${refCode} doesn’t match a booking. Check the code (it looks like CGR-7KQ2), or message the shop.`
                : `${refCode} is not saved in this browser. Bookings are saved in this browser only, so open it on the phone you booked with.`}
          </p>
          <Link className="r11-btn r11-wine" href={`${CGR_BASE}#rail`}>
            Back to the gowns
          </Link>
        </div>
      </section>
    );
  }

  const linked =
    fit && b.linkedRef
      ? (rows.find((x) => x.ref === b.linkedRef) ??
        (linkSum && linkSum !== "unavailable" && linkSum.kind === "reserve" ? summaryToBooking(linkSum) : undefined))
      : undefined;
  const event = linked?.eventDate ?? (fit ? b.eventDate : "");
  const days = !fit ? rentalDays(b.eventDate, b.returnDate || b.eventDate) : null;
  const total = !fit && gown ? customerTotal(gown.pricePerDay, b.eventDate, b.returnDate || b.eventDate) : null;
  const noun = gown?.category === "accessory" ? "piece" : "gown";

  const sideRows: [string, string][] = fit
    ? [
        ["Fitting", `${humanDate(b.fittingDate ?? "")}, ${slotLabel(b.slot ?? "")}`],
        ...(event ? ([["Event day", humanDate(event)]] as [string, string][]) : []),
      ]
    : [
        ["Event day", humanDate(b.eventDate)],
        ["Return", humanDate(b.returnDate || b.eventDate)],
        // r8.0: total (rate x days) stays internal; customers see the days only.
        ...(gown && total !== null ? ([["Rental", `${days} ${days === 1 ? "day" : "days"}`]] as [string, string][]) : []),
      ];
  const gap = fit ? gapPhrase(b.fittingDate ?? "", event) : "";

  return (
    <section className="r11-fl" aria-label={fit ? "Fitting booked" : "Reservation done"}>
      <div className="r11-main r11-done">
        <Steps labels={fit ? ["Day", "Time", "Done"] : ["Date", "Details", "Done"]} at={2} label={fit ? "Fitting steps" : "Reserve steps"} />
        <p className="r11-script" aria-hidden="true">
          {fit ? "See you soon" : "Thank you"}
        </p>
        <h1 tabIndex={-1}>{fit ? "Your fitting is booked." : `Your ${noun} is reserved.`}</h1>
        <p className="r11-sub" style={{ marginTop: 0 }}>
          {fit
            ? `${humanDate(b.fittingDate ?? "")}, ${slotLabel(b.slot ?? "")} at the shop${gap ? `, ${gap}` : ""}. The shop will message you to confirm.`
            : b.customerContact
              ? `The shop will message you on ${b.customerContact} to confirm. Keep this code for the fitting and pickup.`
              : "The shop will message you to confirm. Keep this code for the fitting and pickup."}
        </p>
        <p className="r11-ref" aria-label={`Your code: ${b.ref.split("").join(" ")}`}>
          {b.ref}
        </p>
        <RecordCard b={b} linkedTo={fit ? b.linkedRef : undefined} />
        <div className="r11-acts">
          {fit ? (
            <>
              <Link className="r11-btn r11-wine" href={`${CGR_BASE}#rail`}>
                Back to the gowns
              </Link>
              <a className="r11-link" href={cgr.maps} target="_blank" rel="noopener noreferrer">
                Get directions
              </a>
            </>
          ) : (
            <>
              <Link className="r11-btn r11-wine" href={`${CGR_BASE}/fitting?ref=${encodeURIComponent(b.ref)}`}>
                Book your fitting
              </Link>
              <Link className="r11-link" href={`${CGR_BASE}#rail`}>
                Back to the gowns
              </Link>
            </>
          )}
        </div>
      </div>
      {gown ? (
        <Side
          gown={gown}
          rows={sideRows}
          mob={fit ? `Fitting ${humanDate(b.fittingDate ?? "")}, ${slotLabel(b.slot ?? "")}` : rangeLabel(b.eventDate, b.returnDate || b.eventDate)}
          note="No payment on this site."
        />
      ) : null}
    </section>
  );
}
