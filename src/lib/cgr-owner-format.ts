/**
 * r8.4: plain, readable words for the owner and admin pages (Mark's ask:
 * full dates and times in Manila time, names not IDs, status as plain words,
 * a search over customer, gown and reference). No React and no imports, so
 * `npm run test:cgr` can load it straight into Node.
 */

export type DbStatus = "pending" | "confirmed" | "out" | "returned" | "cancelled" | "came_in" | "no_show";

/**
 * DB value -> the word owners see (spec r8.4b). came_in and no_show are
 * fitting statuses (D4, DEFAULT). The DB values and CGR-XXXX references are
 * unchanged.
 */
export const OWNER_STATUS_LABEL: Record<DbStatus, string> = {
  pending: "New",
  confirmed: "Confirmed",
  out: "Picked up",
  returned: "Returned",
  cancelled: "Cancelled",
  came_in: "Came in",
  no_show: "No-show",
};

/** Choices in a reservation's status menu, in the order a booking moves. */
export const RESERVATION_STATUSES: DbStatus[] = ["pending", "confirmed", "out", "returned", "cancelled"];
/** A fitting is never picked up or returned; it can be "Came in" or "No-show". */
export const FITTING_STATUSES: DbStatus[] = ["pending", "confirmed", "came_in", "no_show", "cancelled"];

export function ownerStatusLabel(status: string): string {
  return (OWNER_STATUS_LABEL as Record<string, string>)[status] ?? status;
}

/**
 * The status chip's look. The word always carries the meaning: "on" (filled)
 * = in progress, "" (outline) = Reserved, "muted" (grey) = finished or no-show.
 */
export function statusTone(status: string): "on" | "" | "muted" {
  if (status === "confirmed" || status === "came_in" || status === "out") return "on";
  if (status === "pending") return "";
  return "muted";
}

const TZ = "Asia/Manila";
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

/** Node's newer ICU puts a narrow no-break space before AM/PM; owners get a plain space. */
const tidy = (s: string) => s.replace(/[\u202f\u00a0]/g, " ");

function yearIn(tz: string, d: Date): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric" }).format(d));
}

/**
 * A calendar day as stored ("2026-11-07") -> "Sat, Nov 7". A stored day is
 * already the Manila day, so it is read as-is (never shifted by a time zone).
 * The year is added when it isn't the current Manila year.
 */
export function ownerDay(iso: string, now: Date = new Date()): string {
  const m = DAY_RE.exec(iso ?? "");
  if (!m) return iso ?? "";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12));
  const opts: Intl.DateTimeFormatOptions = { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" };
  if (Number(m[1]) !== yearIn(TZ, now)) opts.year = "numeric";
  return tidy(new Intl.DateTimeFormat("en-US", opts).format(d));
}

/** "14:00" -> "2:00 PM". */
export function ownerTime(slot: string): string {
  const m = TIME_RE.exec(slot ?? "");
  if (!m) return slot ?? "";
  const h = Number(m[1]);
  if (h > 23) return slot;
  return `${h % 12 === 0 ? 12 : h % 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

/** A stored day and fitting time -> "Sat, Nov 7 · 2:00 PM". */
export function ownerDayTime(iso: string, slot: string, now: Date = new Date()): string {
  return `${ownerDay(iso, now)} · ${ownerTime(slot)}`;
}

/** A moment (timestamptz, e.g. a booking's created_at) -> Manila "Sat, Oct 31 · 5:02 PM". */
export function ownerStamp(isoInstant: string, now: Date = new Date()): string {
  const d = new Date(isoInstant ?? "");
  if (Number.isNaN(d.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = { timeZone: TZ, weekday: "short", month: "short", day: "numeric" };
  if (yearIn(TZ, d) !== yearIn(TZ, now)) opts.year = "numeric";
  const day = tidy(new Intl.DateTimeFormat("en-US", opts).format(d));
  const time = tidy(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(d),
  );
  return `${day} · ${time}`;
}

/** Two stored days -> "Sat, Nov 7 to Sun, Nov 8", or one day when they match. */
export function ownerRange(start: string, end: string, now: Date = new Date()): string {
  if (!start) return end ? ownerDay(end, now) : "";
  if (!end || end === start) return ownerDay(start, now);
  return `${ownerDay(start, now)} to ${ownerDay(end, now)}`;
}

/** Digits only, for phone search and tel: links. */
export function phoneDigits(s: string): string {
  return (s ?? "").replace(/\D+/g, "");
}

/** Next status in the New → Confirmed → Picked up → Returned flow (plus Cancelled). */
export function nextReservationStatus(status: string): string | null {
  if (status === "pending") return "confirmed";
  if (status === "confirmed") return "out";
  if (status === "out") return "returned";
  return null;
}

export function nextReservationLabel(status: string): string | null {
  const n = nextReservationStatus(status);
  return n ? ownerStatusLabel(n) : null;
}

/** Build a Messenger deep link from a contact string when it looks like a phone. */
export function messengerHref(contact: string): string | null {
  const d = phoneDigits(contact);
  if (d.length < 10) return null;
  // m.me doesn't take phone numbers; use Facebook's share-less wa.me-style fallback: fb-messenger:// or leave null.
  // Owners tap "Message" which opens sms: when Messenger isn't available.
  return null;
}

export function telHref(contact: string): string | null {
  const d = phoneDigits(contact);
  if (d.length < 7) return null;
  return `tel:+${d.startsWith("63") ? d : d.startsWith("0") ? "63" + d.slice(1) : d}`;
}

export function smsHref(contact: string): string | null {
  const d = phoneDigits(contact);
  if (d.length < 7) return null;
  const e164 = d.startsWith("63") ? d : d.startsWith("0") ? "63" + d.slice(1) : d;
  return `sms:+${e164}`;
}

type Searchable = { ref: string; customerName: string; customerContact?: string; gownName: string; linkedRef?: string };

/** Search box: customer, gown or reference (with or without "CGR-"), any case. */
export function matchesSearch(row: Searchable, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const dig = phoneDigits(q);
  if (dig.length >= 3 && phoneDigits(row.customerContact ?? "").includes(dig)) return true;
  const hay = [row.customerName, row.customerContact ?? "", row.gownName, row.ref, row.ref.replace(/^CGR-/i, ""), row.linkedRef ?? ""]
    .join(" \0 ")
    .toLowerCase();
  // Each typed word must start a word in the booking ("a" finds "Client A",
  // not every gown with an "a" in it); the full phrase also counts.
  const words = hay.split(/[^a-z0-9]+/).filter(Boolean);
  if (hay.includes(q)) return true;
  return q.split(/\s+/).every((w) => words.some((t) => t.startsWith(w.replace(/^cgr-/, ""))) || hay.includes(w) && w.length > 2);
}

type Sortable = { ref: string; kind: string; eventDate: string; fittingDate?: string; slot?: string };

/** The bookings list sorts by its date (fitting day and time, or event day), soonest first. */
export function sortByDate<T extends Sortable>(rows: readonly T[]): T[] {
  const key = (r: T) => (r.kind === "fitting" ? `${r.fittingDate ?? ""} ${r.slot ?? ""}` : `${r.eventDate} 99:99`);
  return [...rows].sort((a, b) => key(a).localeCompare(key(b)) || a.ref.localeCompare(b.ref));
}

export type SortMode = "upcoming" | "newest" | "oldest";

/**
 * All bookings' "Sort by date" (spec r8.4b). The date is the fitting day and
 * time, or the event day. Upcoming first: today and later, soonest first,
 * then past bookings, most recent first. Newest / Oldest: by that date.
 */
export function sortBookings<T extends Sortable>(rows: readonly T[], mode: SortMode, today: string): T[] {
  const asc = sortByDate(rows);
  if (mode === "oldest") return asc;
  if (mode === "newest") return [...asc].reverse();
  const day = (r: T) => (r.kind === "fitting" ? (r.fittingDate ?? "") : r.eventDate);
  const next = asc.filter((r) => day(r) >= today);
  const past = asc.filter((r) => day(r) < today).reverse();
  return [...next, ...past];
}

/** "Mon, Nov 2 – Sun, Nov 8". */
export function ownerWeek(start: string, end: string, now: Date = new Date()): string {
  return `${ownerDay(start, now)} \u2013 ${ownerDay(end, now)}`;
}

/** Today's date in Manila as "YYYY-MM-DD". */
export function manilaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** "1 reservation", "3 fittings". */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}
