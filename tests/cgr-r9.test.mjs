// CGR r9: commission, deletion, status flow, phone search, attribution.
// Run: npm run test:cgr (Node 22.6+ strips the TS types).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  monthlyCommission,
  canRemoveGown,
  sourceFromSearch,
  slugify,
} from "../src/lib/cgr-catalogue.ts";
import {
  nextReservationStatus,
  nextReservationLabel,
  phoneDigits,
  matchesSearch,
  ownerDayTime,
  ownerStatusLabel,
} from "../src/lib/cgr-owner-format.ts";

test("commission math: count × ₱200", () => {
  assert.deepEqual(monthlyCommission(0), { count: 0, per_php: 200, total_php: 0 });
  assert.deepEqual(monthlyCommission(3), { count: 3, per_php: 200, total_php: 600 });
  assert.deepEqual(monthlyCommission(-2), { count: 0, per_php: 200, total_php: 0 });
});

test("deletion blocked when a live booking holds the gown", () => {
  assert.equal(canRemoveGown([]), true);
  assert.equal(canRemoveGown(["returned", "cancelled"]), true);
  assert.equal(canRemoveGown(["pending"]), false);
  assert.equal(canRemoveGown(["confirmed"]), false);
  assert.equal(canRemoveGown(["out"]), false);
});

test("status flow New → Confirmed → Picked up → Returned", () => {
  assert.equal(ownerStatusLabel("pending"), "New");
  assert.equal(nextReservationStatus("pending"), "confirmed");
  assert.equal(nextReservationLabel("pending"), "Confirmed");
  assert.equal(nextReservationStatus("confirmed"), "out");
  assert.equal(nextReservationLabel("confirmed"), "Picked up");
  assert.equal(nextReservationStatus("out"), "returned");
  assert.equal(nextReservationStatus("returned"), null);
});

test("Manila day-time stamp stays on the stored calendar day", () => {
  assert.equal(ownerDayTime("2026-11-07", "14:00"), "Sat, Nov 7 · 2:00 PM");
});

test("phone search matches digits in the contact", () => {
  assert.equal(phoneDigits("+63 917 115 9718"), "639171159718");
  const row = { ref: "CGR-ABCD", customerName: "Ana", customerContact: "0917 555 1212", gownName: "Wine gown" };
  assert.equal(matchesSearch(row, "5551212"), true);
  assert.equal(matchesSearch(row, "999"), false);
});

test("attribution from query string", () => {
  const a = sourceFromSearch(new URLSearchParams("src=qr&utm_medium=qr&utm_source=shop"));
  assert.equal(a.source, "qr");
  const b = sourceFromSearch(new URLSearchParams("utm_source=facebook&utm_medium=social"));
  assert.equal(b.source, "facebook");
  const c = sourceFromSearch(new URLSearchParams(""));
  assert.equal(c.source, "direct");
});

test("slugify keeps a stable catalogue slug", () => {
  assert.equal(slugify("Wine Sequin Slit Gown"), "wine-sequin-slit-gown");
});
