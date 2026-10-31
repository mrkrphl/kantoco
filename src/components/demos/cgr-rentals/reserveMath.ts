/**
 * Pure reservation math (r7.7). No imports, so `node --test` can load it
 * directly (tests/cgr-reserve.test.mjs). Behaviour is unchanged from r7.6:
 * the customer total is rate x days (both dates count), and the ₱200
 * commission is an owner-side figure only.
 */

/** Days of the rental, inclusive of both ISO dates; null if invalid or reversed. */
export function rentalDays(start: string, end: string): number | null {
  const ok = /^\d{4}-\d{2}-\d{2}$/;
  if (!ok.test(start) || !ok.test(end) || end < start) return null;
  const ms = new Date(`${end}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime();
  return Math.round(ms / 86400000) + 1;
}

/** What the customer sees: rate x days. Never includes the commission. */
export function customerTotal(pricePerDay: number, start: string, end: string): number | null {
  const days = rentalDays(start, end);
  return days === null ? null : days * pricePerDay;
}

/** ISO date plus n days (local noon, so DST never shifts the day). */
export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Fri 6 Nov" from an ISO date (fixed English, no locale drift). */
export function humanDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${WD[d.getDay()]} ${d.getDate()} ${MO[d.getMonth()]}`;
}

/** "Fri 6 – Sat 7 Nov", or "Fri 30 Oct – Sat 1 Nov" across months. */
export function rangeLabel(start: string, end: string): string {
  const a = humanDate(start);
  const b = humanDate(end);
  if (!start || !end) return a || b;
  if (start === end) return a;
  return start.slice(0, 7) === end.slice(0, 7) ? `${a.replace(/ \w+$/, "")} – ${b}` : `${a} – ${b}`;
}

/** Default return day when the gown page only passes the event day. */
export function defaultReturn(eventIso: string): string {
  return eventIso ? addDaysIso(eventIso, 1) : "";
}

/** CGR-XXXX: four characters from an alphabet without 0/O/1/I. */
export const REF_PATTERN = /^CGR-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/;

/** Statuses that earn the commission. Pending and cancelled are ₱0. */
export const COUNTED_STATUSES = ["confirmed", "out", "returned"] as const;

/** Owner-side commission: per-booking fee x bookings in a counted status. */
export function ownerCommission(statuses: readonly string[], perBooking: number): number {
  return statuses.filter((s) => (COUNTED_STATUSES as readonly string[]).includes(s)).length * perBooking;
}

/* ---------- r7.11: date states, fittings, records (pure) ---------- */

/** The shop's time zone: "today" is always Manila's calendar day. */
export const SHOP_TZ = "Asia/Manila";

/** Manila's calendar date for an instant (default now), as YYYY-MM-DD. */
export function manilaToday(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A booking-like row, as far as the date rules need it. */
export type RowLike = {
  ref: string;
  kind?: "reserve" | "fitting";
  gownSlug: string;
  eventDate: string;
  returnDate: string;
  status: string;
  fittingDate?: string;
  slot?: string;
};

export const isFitting = (b: { kind?: string }) => b.kind === "fitting";

/** A row that keeps the gown off the rail: a reservation not cancelled or returned. */
export function holdsGown(b: RowLike): boolean {
  return !isFitting(b) && b.status !== "cancelled" && b.status !== "returned";
}

/** ISO days in [start, end], inclusive. */
export function daysIn(start: string, end: string): string[] {
  const n = rentalDays(start, end);
  if (n === null) return [];
  return Array.from({ length: n }, (_, i) => addDaysIso(start, i));
}

/** Days in [start, end] the gown is already reserved (mock calendar + held reservations). */
export function takenDays(
  gownSlug: string,
  start: string,
  end: string,
  mockBooked: readonly string[],
  rows: readonly RowLike[],
  aliases: Record<string, string> = {},
): string[] {
  return daysIn(start, end).filter(
    (d) =>
      mockBooked.includes(d) ||
      rows.some(
        (b) =>
          (aliases[b.gownSlug] ?? b.gownSlug) === gownSlug &&
          holdsGown(b) &&
          b.eventDate <= d &&
          (b.returnDate || b.eventDate) >= d,
      ),
  );
}

/** r8.2: the database's limits, mirrored on screen. */
export const MAX_STAY_DAYS = 30; // return day - event day
export const HORIZON_DAYS = 366; // furthest bookable day = today + 366

/** Last bookable day (Manila) for a reservation or a fitting. */
export function horizonIso(today: string): string {
  return addDaysIso(today, HORIZON_DAYS);
}

export type ReserveState = "ok" | "missing" | "past" | "too_long" | "too_far" | "taken";

/** Step 01 of the reserve flow: is [event, return] still bookable today (Manila)? */
export function reserveState(
  event: string,
  ret: string,
  today: string,
  taken: readonly string[],
): ReserveState {
  if (!ISO_RE.test(event) || !ISO_RE.test(ret) || ret < event) return "missing";
  if (event < today) return "past";
  if ((rentalDays(event, ret) ?? 0) - 1 > MAX_STAY_DAYS) return "too_long";
  if (event > horizonIso(today)) return "too_far";
  if (taken.length) return "taken";
  return "ok";
}

export type FittingDayState = "ok" | "missing" | "past" | "too_far" | "before-event";

/**
 * A fitting day must be today or later (Manila) and, when it is for a
 * reservation, strictly before that event day. "before-event" names the rule
 * that failed: the day is not before the event.
 */
export function fittingDayState(day: string, today: string, eventDate?: string | null): FittingDayState {
  if (!ISO_RE.test(day)) return "missing";
  if (day < today) return "past";
  if (day > horizonIso(today)) return "too_far";
  if (eventDate && ISO_RE.test(eventDate) && day >= eventDate) return "before-event";
  return "ok";
}

/** Example-taken times for a weekday, from FITTING_SLOTS.exampleTaken. */
export function exampleTakenFor(day: string, table: Record<number, readonly string[]>): readonly string[] {
  const d = new Date(`${day}T12:00:00`);
  return Number.isNaN(d.getTime()) ? [] : (table[d.getDay()] ?? []);
}

/** A slot is taken when another live fitting has the same day and time (or the example data says so). */
export function slotTaken(
  day: string,
  slot: string,
  rows: readonly RowLike[],
  exampleTaken: readonly string[] = [],
  exceptRef?: string,
): boolean {
  if (exampleTaken.includes(slot)) return true;
  return rows.some(
    (b) => isFitting(b) && b.ref !== exceptRef && b.status !== "cancelled" && b.fittingDate === day && b.slot === slot,
  );
}

/** "15:00" -> "3:00 PM". */
export function slotLabel(slot: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(slot);
  if (!m) return slot;
  const h = Number(m[1]);
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

/** "a week before your event" etc.; "" when under 2 days or no event. */
export function gapPhrase(day: string, eventDate?: string | null): string {
  if (!eventDate) return "";
  const n = rentalDays(day, eventDate);
  if (n === null) return "";
  const gap = n - 1;
  if (gap < 2) return "";
  if (gap === 7) return "a week before your event";
  if (gap === 14) return "two weeks before your event";
  return `${gap} days before your event`;
}

/** Records order: soonest first by the fitting day, else the event day. */
export function whenOf(b: RowLike): string {
  return (isFitting(b) ? b.fittingDate : b.eventDate) || b.eventDate || "";
}

export function sortRecords<T extends RowLike>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => whenOf(a).localeCompare(whenOf(b)) || a.ref.localeCompare(b.ref));
}

/** Commission counts reservations only; fittings never earn it. */
export function recordsCommission(rows: readonly RowLike[], perBooking: number): number {
  return ownerCommission(
    rows.filter((b) => !isFitting(b)).map((b) => b.status),
    perBooking,
  );
}

/** "Another client has it reserved on Sun 15 Nov. Sat 14 Nov and Mon 16 Nov are still free." */
export function takenSentence(event: string, ret: string, taken: readonly string[]): string {
  const list = (xs: string[]) =>
    xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
  const t = taken.map(humanDate);
  const free = daysIn(event, ret)
    .filter((d) => !taken.includes(d))
    .map(humanDate);
  const a = `Another client has it reserved on ${list(t)}.`;
  if (!free.length) return a;
  return `${a} ${list(free)} ${free.length === 1 ? "is" : "are"} still free.`;
}
