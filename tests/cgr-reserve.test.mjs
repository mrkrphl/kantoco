// CGR r7.7 money and date logic. Run: npm run test:cgr (Node 22.6+ strips the TS types).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rentalDays,
  customerTotal,
  addDaysIso,
  humanDate,
  rangeLabel,
  defaultReturn,
  REF_PATTERN,
  ownerCommission,
} from "../src/components/demos/cgr-rentals/reserveMath.ts";

test("rentalDays counts both dates", () => {
  assert.equal(rentalDays("2026-11-06", "2026-11-06"), 1);
  assert.equal(rentalDays("2026-11-06", "2026-11-07"), 2);
  assert.equal(rentalDays("2026-10-30", "2026-11-02"), 4);
  assert.equal(rentalDays("2026-12-31", "2027-01-01"), 2);
});

test("rentalDays rejects reversed or malformed dates", () => {
  assert.equal(rentalDays("2026-11-07", "2026-11-06"), null);
  assert.equal(rentalDays("", "2026-11-06"), null);
  assert.equal(rentalDays("6 Nov", "7 Nov"), null);
});

test("customer total is rate x days, no commission", () => {
  assert.equal(customerTotal(2200, "2026-11-06", "2026-11-07"), 4400);
  assert.equal(customerTotal(3200, "2026-11-06", "2026-11-06"), 3200);
  assert.equal(customerTotal(1200, "2026-11-06", "2026-11-09"), 4800);
  assert.equal(customerTotal(2200, "2026-11-07", "2026-11-06"), null);
});

test("dates: add days, labels, default return", () => {
  assert.equal(addDaysIso("2026-10-31", 1), "2026-11-01");
  assert.equal(addDaysIso("2028-02-28", 1), "2028-02-29");
  assert.equal(humanDate("2026-11-06"), "Fri 6 Nov");
  assert.equal(rangeLabel("2026-11-06", "2026-11-07"), "Fri 6 – Sat 7 Nov");
  assert.equal(rangeLabel("2026-10-31", "2026-11-01"), "Sat 31 Oct – Sun 1 Nov");
  assert.equal(defaultReturn("2026-11-06"), "2026-11-07");
  assert.equal(defaultReturn(""), "");
});

test("CGR reference format", () => {
  assert.match("CGR-9DKE", REF_PATTERN);
  assert.doesNotMatch("CGR-0OI1", REF_PATTERN);
  assert.doesNotMatch("CGR-ABC", REF_PATTERN);
});

test("owner commission: ₱200 per confirmed, out or returned; pending and cancelled ₱0", () => {
  assert.equal(ownerCommission([], 200), 0);
  assert.equal(ownerCommission(["pending", "cancelled"], 200), 0);
  assert.equal(ownerCommission(["confirmed", "out", "returned", "pending"], 200), 600);
});

/* ---------- r7.11 ---------- */
import {
  manilaToday,
  reserveState,
  takenDays,
  fittingDayState,
  slotTaken,
  exampleTakenFor,
  slotLabel,
  gapPhrase,
  holdsGown,
  recordsCommission,
  sortRecords,
  takenSentence,
} from "../src/components/demos/cgr-rentals/reserveMath.ts";

test("today is Manila's day, not the browser's", () => {
  // 31 Oct 2026, 17:30 UTC = 1 Nov 01:30 in Manila (UTC+8).
  assert.equal(manilaToday(new Date("2026-10-31T17:30:00Z")), "2026-11-01");
  // 31 Oct 2026, 15:59 UTC = 31 Oct 23:59 in Manila.
  assert.equal(manilaToday(new Date("2026-10-31T15:59:00Z")), "2026-10-31");
  // Midnight Manila exactly rolls over.
  assert.equal(manilaToday(new Date("2026-10-31T16:00:00Z")), "2026-11-01");
});

test("reserve: past event day is refused", () => {
  assert.equal(reserveState("2026-10-30", "2026-10-31", "2026-10-31", []), "past");
  assert.equal(reserveState("2026-10-31", "2026-11-01", "2026-10-31", []), "ok"); // today is fine
});

test("reserve: missing or backwards dates", () => {
  assert.equal(reserveState("", "", "2026-10-31", []), "missing");
  assert.equal(reserveState("2026-11-10", "2026-11-09", "2026-10-31", []), "missing");
});

test("reserve: a taken day anywhere in the range blocks it", () => {
  const rows = [
    { ref: "CGR-AAAA", gownSlug: "g", eventDate: "2026-11-20", returnDate: "2026-11-21", status: "pending" },
    { ref: "CGR-BBBB", gownSlug: "g", eventDate: "2026-11-25", returnDate: "2026-11-25", status: "cancelled" },
    { ref: "CGR-CCCC", kind: "fitting", gownSlug: "g", eventDate: "2026-11-27", returnDate: "", fittingDate: "2026-11-26", slot: "15:00", status: "pending" },
  ];
  // mock booked 15th: return day of 14->15 is taken
  assert.deepEqual(takenDays("g", "2026-11-14", "2026-11-15", ["2026-11-15"], rows), ["2026-11-15"]);
  assert.equal(reserveState("2026-11-14", "2026-11-15", "2026-10-31", ["2026-11-15"]), "taken");
  // held reservation
  assert.deepEqual(takenDays("g", "2026-11-19", "2026-11-20", [], rows), ["2026-11-20"]);
  // cancelled and fittings never hold
  assert.deepEqual(takenDays("g", "2026-11-25", "2026-11-27", [], rows), []);
  // other gown
  assert.deepEqual(takenDays("h", "2026-11-20", "2026-11-21", [], rows), []);
  // aliases resolve old slugs
  assert.deepEqual(takenDays("g", "2026-11-20", "2026-11-20", [], [{ ...rows[0], gownSlug: "old" }], { old: "g" }), ["2026-11-20"]);
  assert.equal(
    takenSentence("2026-11-14", "2026-11-16", ["2026-11-15"]),
    "Another client has it reserved on Sun 15 Nov. Sat 14 Nov and Mon 16 Nov are still free.",
  );
});

test("fitting: must be today or later and before the event", () => {
  const today = "2026-10-31";
  assert.equal(fittingDayState("2026-10-30", today, "2026-11-20"), "past");
  assert.equal(fittingDayState("2026-10-31", today, "2026-11-20"), "ok");
  assert.equal(fittingDayState("2026-11-20", today, "2026-11-20"), "before-event"); // same day is too late
  assert.equal(fittingDayState("2026-11-22", today, "2026-11-20"), "before-event");
  assert.equal(fittingDayState("2026-11-19", today, "2026-11-20"), "ok");
  assert.equal(fittingDayState("2026-12-01", today, null), "ok"); // no reservation: any future day
  assert.equal(fittingDayState("", today, null), "missing");
});

test("fitting: slot taken by another fitting or the example data", () => {
  const rows = [
    { ref: "CGR-F111", kind: "fitting", gownSlug: "g", eventDate: "", returnDate: "", fittingDate: "2026-11-13", slot: "15:00", status: "pending" },
    { ref: "CGR-F222", kind: "fitting", gownSlug: "g", eventDate: "", returnDate: "", fittingDate: "2026-11-13", slot: "10:00", status: "cancelled" },
    { ref: "CGR-R333", gownSlug: "g", eventDate: "2026-11-13", returnDate: "2026-11-14", status: "pending", slot: "13:00" },
  ];
  assert.equal(slotTaken("2026-11-13", "15:00", rows), true);
  assert.equal(slotTaken("2026-11-13", "15:00", rows, [], "CGR-F111"), false);
  assert.equal(slotTaken("2026-11-13", "10:00", rows), false); // cancelled frees it
  assert.equal(slotTaken("2026-11-13", "13:00", rows), false); // reservations are not fittings
  assert.deepEqual(exampleTakenFor("2026-11-14", { 6: ["13:00"] }), ["13:00"]); // Saturday
  assert.equal(slotTaken("2026-11-14", "13:00", [], exampleTakenFor("2026-11-14", { 6: ["13:00"] })), true);
  assert.equal(slotLabel("15:00"), "3:00 PM");
  assert.equal(slotLabel("10:00"), "10:00 AM");
  assert.equal(slotLabel("12:00"), "12:00 PM");
});

test("fitting gap phrase drops under two days", () => {
  assert.equal(gapPhrase("2026-11-13", "2026-11-20"), "a week before your event");
  assert.equal(gapPhrase("2026-11-17", "2026-11-20"), "3 days before your event");
  assert.equal(gapPhrase("2026-11-19", "2026-11-20"), "");
  assert.equal(gapPhrase("2026-11-19", ""), "");
});

test("records: fittings never hold or earn commission; soonest first", () => {
  const rows = [
    { ref: "CGR-R1", gownSlug: "g", eventDate: "2026-11-20", returnDate: "2026-11-21", status: "confirmed" },
    { ref: "CGR-F1", kind: "fitting", gownSlug: "g", eventDate: "2026-11-20", returnDate: "", fittingDate: "2026-11-13", slot: "15:00", status: "confirmed" },
  ];
  assert.equal(holdsGown(rows[0]), true);
  assert.equal(holdsGown(rows[1]), false);
  assert.equal(recordsCommission(rows, 200), 200);
  assert.deepEqual(sortRecords(rows).map((r) => r.ref), ["CGR-F1", "CGR-R1"]);
});

test("rate x days: customer total for a reserved range", () => {
  assert.equal(customerTotal(3500, "2026-11-14", "2026-11-15"), 7000);
  assert.equal(customerTotal(2800, "2026-11-13", "2026-11-13"), 2800);
  assert.equal(customerTotal(250, "2026-11-01", "2026-11-03"), 750);
});
