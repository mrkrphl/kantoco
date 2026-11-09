// CGR r8.4 owner and admin wording: Manila dates and times, status words, search.
// Run: npm run test:cgr (Node 22.6+ strips the TS types).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ownerDay,
  ownerTime,
  ownerDayTime,
  ownerStamp,
  ownerRange,
  ownerStatusLabel,
  OWNER_STATUS_LABEL,
  FITTING_STATUSES,
  matchesSearch,
  sortByDate,
  sortBookings,
  statusTone,
  ownerWeek,
  manilaToday,
  plural,
} from "../src/lib/cgr-owner-format.ts";

const NOW = new Date("2026-10-31T09:00:00Z"); // Sat 31 Oct 2026, 5:00 PM in Manila

test("a stored day reads as a full weekday date", () => {
  assert.equal(ownerDay("2026-11-07", NOW), "Sat, Nov 7");
  assert.equal(ownerDay("2026-12-31", NOW), "Thu, Dec 31");
  assert.equal(ownerDay("2027-01-01", NOW), "Fri, Jan 1, 2027");
  assert.equal(ownerDay("not a day", NOW), "not a day");
});

test("a stored day never shifts with the machine's time zone", () => {
  const before = process.env.TZ;
  for (const tz of ["America/Los_Angeles", "Pacific/Kiritimati", "UTC", "Asia/Manila"]) {
    process.env.TZ = tz;
    assert.equal(ownerDay("2026-11-07", NOW), "Sat, Nov 7", tz);
  }
  process.env.TZ = before;
});

test("fitting times read as 12-hour clock times", () => {
  assert.equal(ownerTime("14:00"), "2:00 PM");
  assert.equal(ownerTime("10:30"), "10:30 AM");
  assert.equal(ownerTime("00:15"), "12:15 AM");
  assert.equal(ownerTime("12:00:00"), "12:00 PM");
  assert.equal(ownerDayTime("2026-11-07", "14:00", NOW), "Sat, Nov 7 · 2:00 PM");
});

test("moments are shown in Manila time, not UTC", () => {
  // 06:30 UTC on 31 Oct is 2:30 PM in Manila (UTC+8).
  assert.equal(ownerStamp("2026-10-31T06:30:00Z", NOW), "Sat, Oct 31 · 2:30 PM");
  // 17:10 UTC on 31 Oct is already Sunday 1 Nov, 1:10 AM in Manila.
  assert.equal(ownerStamp("2026-10-31T17:10:00Z", NOW), "Sun, Nov 1 · 1:10 AM");
  // Postgres-style offset.
  assert.equal(ownerStamp("2026-10-31 09:02:30.28+00", NOW), "Sat, Oct 31 · 5:02 PM");
  // New Year's in Manila comes 8 hours before UTC's.
  assert.equal(ownerStamp("2026-12-31T16:30:00Z", NOW), "Fri, Jan 1, 2027 · 12:30 AM");
  assert.equal(ownerStamp("", NOW), "");
});

test("ranges read as from-to, or one day", () => {
  assert.equal(ownerRange("2026-11-07", "2026-11-08", NOW), "Sat, Nov 7 to Sun, Nov 8");
  assert.equal(ownerRange("2026-11-07", "2026-11-07", NOW), "Sat, Nov 7");
  assert.equal(ownerRange("2026-11-07", "", NOW), "Sat, Nov 7");
});

test("status words map from the DB values", () => {
  assert.deepEqual(OWNER_STATUS_LABEL, {
    pending: "New",
    confirmed: "Confirmed",
    out: "Picked up",
    returned: "Returned",
    cancelled: "Cancelled",
    came_in: "Came in",
    no_show: "No-show",
  });
  assert.equal(ownerStatusLabel("out"), "Picked up");
  assert.equal(ownerStatusLabel("pending"), "New");
  assert.equal(ownerStatusLabel("weird"), "weird");
  assert.ok(!FITTING_STATUSES.includes("out") && !FITTING_STATUSES.includes("returned"));
  for (const word of Object.values(OWNER_STATUS_LABEL)) assert.ok(!/hold/i.test(word));
});

test("search finds customer, gown or reference in any case", () => {
  const row = { ref: "CGR-T8A4", customerName: "Ana Reyes", gownName: "Black and gold Filipiniana", linkedRef: "" };
  assert.ok(matchesSearch(row, ""));
  assert.ok(matchesSearch(row, "ana"));
  assert.ok(matchesSearch(row, "FILIPINIANA"));
  assert.ok(matchesSearch(row, "cgr-t8a4"));
  assert.ok(matchesSearch(row, "t8a4"));
  assert.ok(matchesSearch(row, "reyes gold"));
  assert.ok(!matchesSearch(row, "barong"));
});

test("the list sorts by date, fittings by day and time", () => {
  const rows = [
    { ref: "CGR-BBBB", kind: "reserve", eventDate: "2026-11-07" },
    { ref: "CGR-CCCC", kind: "fitting", eventDate: "", fittingDate: "2026-11-07", slot: "14:00" },
    { ref: "CGR-AAAA", kind: "fitting", eventDate: "", fittingDate: "2026-11-07", slot: "10:00" },
    { ref: "CGR-DDDD", kind: "reserve", eventDate: "2026-11-02" },
  ];
  assert.deepEqual(sortByDate(rows).map((r) => r.ref), ["CGR-DDDD", "CGR-AAAA", "CGR-CCCC", "CGR-BBBB"]);
});

test("counts get words", () => {
  assert.equal(plural(1, "reservation"), "1 reservation");
  assert.equal(plural(0, "fitting"), "0 fittings");
});

test("r8.4b: fittings use Came in and No-show (D4), never pickup words", () => {
  assert.equal(ownerStatusLabel("came_in"), "Came in");
  assert.equal(ownerStatusLabel("no_show"), "No-show");
  assert.deepEqual(FITTING_STATUSES, ["pending", "confirmed", "came_in", "no_show", "cancelled"]);
  assert.ok(!FITTING_STATUSES.includes("out") && !FITTING_STATUSES.includes("returned"));
  for (const label of Object.values(OWNER_STATUS_LABEL)) assert.ok(!/hold/i.test(label));
});

test("r8.4b: status chips carry a tone, the word carries the meaning", () => {
  assert.equal(statusTone("confirmed"), "on");
  assert.equal(statusTone("came_in"), "on");
  assert.equal(statusTone("out"), "on");
  assert.equal(statusTone("pending"), "");
  for (const s of ["returned", "no_show", "cancelled"]) assert.equal(statusTone(s), "muted");
});

test("r8.4b: sort by date: upcoming first, newest, oldest", () => {
  const rows = [
    { ref: "CGR-PAST", kind: "reserve", eventDate: "2026-10-24" },
    { ref: "CGR-OLDR", kind: "reserve", eventDate: "2026-10-01" },
    { ref: "CGR-TDAY", kind: "fitting", eventDate: "", fittingDate: "2026-10-31", slot: "13:00" },
    { ref: "CGR-NEXT", kind: "fitting", eventDate: "", fittingDate: "2026-11-10", slot: "10:00" },
    { ref: "CGR-LATE", kind: "reserve", eventDate: "2026-11-14" },
  ];
  const ids = (m) => sortBookings(rows, m, "2026-10-31").map((r) => r.ref);
  assert.deepEqual(ids("upcoming"), ["CGR-TDAY", "CGR-NEXT", "CGR-LATE", "CGR-PAST", "CGR-OLDR"]);
  assert.deepEqual(ids("oldest"), ["CGR-OLDR", "CGR-PAST", "CGR-TDAY", "CGR-NEXT", "CGR-LATE"]);
  assert.deepEqual(ids("newest"), ["CGR-LATE", "CGR-NEXT", "CGR-TDAY", "CGR-PAST", "CGR-OLDR"]);
});

test("r8.4b: the week line and Manila's today", () => {
  assert.equal(ownerWeek("2026-10-26", "2026-11-01", NOW), "Mon, Oct 26 \u2013 Sun, Nov 1");
  assert.equal(manilaToday(new Date("2026-10-31T16:30:00Z")), "2026-11-01"); // 12:30 AM Sun in Manila
  assert.equal(manilaToday(new Date("2026-10-31T15:59:00Z")), "2026-10-31");
});
