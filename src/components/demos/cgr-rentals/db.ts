"use client";

import { useEffect, useState } from "react";
import { getGown, type Booking, type BookingStatus } from "@/lib/cgr-rentals";

/**
 * r8.2 bookings database (Supabase project cgr-rentals).
 *
 * The browser calls the public RPCs directly with the publishable key, so the
 * database's per-IP rate limit sees each visitor's own IP (a server action
 * would make every visitor share Vercel's). Both values come from env at
 * build time; when either is missing the site keeps the on-device
 * (localStorage) store in bookings.ts. Never a secret or service-role key.
 */
const DB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const DB_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** True when bookings go to the database (both env vars set). */
export const DB_ON = DB_URL.length > 0 && DB_KEY.length > 0;

/** Error codes the RPCs return, plus "unavailable" for a paused or unreachable project. */
export type DbError =
  | "taken"
  | "past"
  | "missing"
  | "too_far"
  | "details"
  | "unknown_gown"
  | "unknown_slot"
  | "bad_code"
  | "before-event"
  | "slow_down"
  | "rejected"
  | "busy"
  | "unavailable";

export type DbResult<T> = { ok: true; data: T } | { ok: false; error: "unavailable" };

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<DbResult<T>> {
  if (!DB_ON) return { ok: false, error: "unavailable" };
  try {
    const res = await fetch(`${DB_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: DB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    // A paused free project, an outage or a timeout all read as "unavailable".
    if (!res.ok) return { ok: false, error: "unavailable" };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

type CreateOut = { ok: true; ref: string } | { ok: false; error: DbError; days?: string[] };

export async function dbCreateReservation(a: {
  slug: string;
  event: string;
  ret: string;
  name: string;
  contact: string;
  notes: string;
  website: string;
}): Promise<CreateOut> {
  const r = await rpc<CreateOut>("create_reservation", {
    p_slug: a.slug,
    p_event: a.event,
    p_return: a.ret,
    p_name: a.name,
    p_contact: a.contact,
    p_notes: a.notes,
    p_website: a.website,
  });
  return r.ok ? r.data : { ok: false, error: "unavailable" };
}

export async function dbCreateFitting(a: {
  day: string;
  slot: string;
  name: string;
  contact: string;
  linkedRef: string | null;
  slug: string | null;
  website: string;
}): Promise<CreateOut> {
  const r = await rpc<CreateOut>("create_fitting", {
    p_day: a.day,
    p_slot: a.slot,
    p_name: a.name,
    p_contact: a.contact,
    p_linked_ref: a.linkedRef,
    p_slug: a.slug,
    p_notes: "",
    p_website: a.website,
  });
  return r.ok ? r.data : { ok: false, error: "unavailable" };
}

/** Days in [from, to] the gown is held (pending, confirmed or out). */
export async function dbTakenDays(slug: string, from: string, to: string): Promise<DbResult<string[]>> {
  return rpc<string[]>("taken_days", { p_slug: slug, p_from: from, p_to: to });
}

export async function dbTakenSlots(day: string): Promise<DbResult<string[]>> {
  return rpc<string[]>("taken_slots", { p_day: day });
}

export async function dbFittingTimes(): Promise<DbResult<string[]>> {
  return rpc<string[]>("fitting_times", {});
}

/** Status and dates only: never a name, contact or amount. */
export type Summary =
  | {
      kind: "reserve";
      ref: string;
      gown_slug: string;
      event_date: string;
      return_date: string;
      status: string;
    }
  | {
      kind: "fitting";
      ref: string;
      gown_slug: string | null;
      linked_ref: string | null;
      fitting_date: string;
      slot: string;
      status: string;
    };

export async function dbSummary(ref: string): Promise<DbResult<Summary | null>> {
  return rpc<Summary | null>("booking_summary", { p_ref: ref });
}

/**
 * A database row as a Booking for the existing cards. The summary has no
 * name, contact or notes, so those stay empty (`fromDb` marks it).
 */
export function summaryToBooking(s: Summary): Booking & { fromDb: true } {
  const slug = s.gown_slug ?? "";
  const base = {
    ref: s.ref,
    gownSlug: slug,
    gownName: getGown(slug)?.name ?? "",
    customerName: "",
    customerContact: "",
    notes: "",
    status: s.status as BookingStatus,
    createdAt: "",
    sample: true as const,
    fromDb: true as const,
  };
  return s.kind === "reserve"
    ? { ...base, kind: "reserve", eventDate: s.event_date, returnDate: s.return_date }
    : {
        ...base,
        kind: "fitting",
        fittingDate: s.fitting_date,
        slot: s.slot,
        linkedRef: s.linked_ref ?? undefined,
        eventDate: "",
        returnDate: "",
      };
}

/**
 * A database read keyed by `key` (null = nothing to read).
 * undefined = loading, "unavailable" = paused or unreachable.
 */
export function useDbRead<T>(key: string | null, read: () => Promise<DbResult<T>>): T | undefined | "unavailable" {
  const [got, setGot] = useState<{ key: string; v: T | "unavailable" } | null>(null);
  useEffect(() => {
    if (!DB_ON || key === null) return;
    let live = true;
    read().then((r) => {
      if (live) setGot({ key, v: r.ok ? r.data : "unavailable" });
    });
    return () => {
      live = false;
    };
    // `read` closes over the same inputs as `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return got && got.key === key ? got.v : undefined;
}

/** Friendly words for each database answer (taken and unavailable have their own states). */
export function dbMessage(e: DbError, noun = "gown"): string {
  switch (e) {
    case "taken":
      return `Sorry, someone just reserved this ${noun} for those days. Please pick other dates.`;
    case "past":
      return "That date has already passed. Please pick a day from today onward.";
    case "missing":
      return "Please pick your date first.";
    case "too_far":
      return "Bookings can be up to 30 days long and up to a year ahead.";
    case "details":
      return "Please check your name and contact (up to 80 characters each) and keep the note under 500 characters.";
    case "unknown_gown":
      return `This ${noun} can’t be booked online right now. Please message the shop.`;
    case "unknown_slot":
      return "That fitting time is no longer offered. Please choose another time.";
    case "bad_code":
      return "That code doesn’t look right. Codes look like CGR-7KQ2.";
    case "before-event":
      return "Fittings happen before the event. Please pick an earlier day.";
    case "slow_down":
      return "Too many bookings from this connection just now. Please wait a few minutes and try again.";
    case "busy":
      return "That didn’t go through. Please try again.";
    case "rejected":
      return "We couldn’t save that. Please message the shop instead.";
    case "unavailable":
    default:
      return "Online booking is unavailable right now. Please try again later or message the shop.";
  }
}
