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
