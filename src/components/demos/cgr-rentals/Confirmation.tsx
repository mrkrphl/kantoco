"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CGR_BASE, STATUS_LABEL, cgr, getGown, type Booking } from "@/lib/cgr-rentals";
import { useBookings } from "@/components/demos/cgr-rentals/bookings";
import { Side, Steps } from "@/components/demos/cgr-rentals/FlowBits";
import {
  customerTotal,
  gapPhrase,
  humanDate,
  isFitting,
  rangeLabel,
  rentalDays,
  slotLabel,
} from "@/components/demos/cgr-rentals/reserveMath";

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
            : `${b.gownName} · ${b.customerName}`
          : `${rangeLabel(b.eventDate, b.returnDate || b.eventDate)} · ${b.customerName}`}
      </span>
    </div>
  );
}

/**
 * r7.11 Done (spec §5 03 Done and §6 f3). One page for both flows, by ref:
 * old refs and old rows (no `kind`) open as reservations. The code is big
 * and selectable; the record card mirrors what the owner sees.
 */
export function Confirmation({ refCode }: { refCode: string }) {
  const rows = useBookings();
  const b = rows?.find((x) => x.ref === refCode.trim().toUpperCase()) ?? null;
  const fit = b ? isFitting(b) : false;
  const gown = b ? getGown(b.gownSlug) : undefined;

  useEffect(() => {
    if (!rows) return;
    document.title = `${b ? (fit ? "Fitting booked" : "Reserved") : "Code not found"} · Cavite Gown Rentals`;
  }, [rows, b, fit]);

  if (!rows) {
    return (
      <section className="r11-fl">
        <div className="r11-main">
          <h1>Opening your booking…</h1>
        </div>
      </section>
    );
  }

  if (!b) {
    return (
      <section className="r11-fl">
        <div className="r11-main">
          <h1 tabIndex={-1}>We can’t find that code.</h1>
          <p className="r11-sub" style={{ marginTop: 0 }}>
            {refCode ? `${refCode} is not saved in this browser.` : "No code was given."} Bookings are saved in this
            browser only, so open it on the phone you booked with.
          </p>
          <Link className="r11-btn r11-wine" href={`${CGR_BASE}#rail`}>
            Back to the gowns
          </Link>
        </div>
      </section>
    );
  }

  const linked = fit && b.linkedRef ? rows.find((x) => x.ref === b.linkedRef) : undefined;
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
            : `The shop will message you on ${b.customerContact} to confirm. Keep this code for the fitting and pickup.`}
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
