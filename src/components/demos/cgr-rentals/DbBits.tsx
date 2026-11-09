"use client";

import Link from "next/link";
import { CGR_BASE, cgr } from "@/lib/cgr-rentals";

/**
 * r8.2: shown when the bookings database can't be reached (a paused free
 * project, an outage, or no connection). Calm, no error code, nothing lost:
 * try again or message the shop.
 */
export function BookingUnavailable({ what = "Booking" }: { what?: string }) {
  return (
    <section className="r11-fl" aria-label={`${what} unavailable`}>
      <div className="r11-main" data-state="unavailable">
        <h1 tabIndex={-1}>{what} is resting for a moment.</h1>
        <p className="r11-sub" style={{ marginTop: 0 }}>
          Online booking is unavailable right now. Nothing was saved. Please try again in a little while, or
          message the shop to reserve your date.
        </p>
        <div className="r11-acts">
          <button type="button" className="r11-btn r11-wine" onClick={() => window.location.reload()}>
            Try again
          </button>
          <a className="r11-link" href={cgr.messenger} target="_blank" rel="noopener noreferrer">
            Message the shop
          </a>
          <Link className="r11-link" href={`${CGR_BASE}#rail`}>
            Back to the gowns
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Hidden spam trap: people never see or fill it; bots that fill every field
 * get a polite refusal from the database ("rejected").
 */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label htmlFor="cgr-website">Website</label>
      <input
        id="cgr-website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
