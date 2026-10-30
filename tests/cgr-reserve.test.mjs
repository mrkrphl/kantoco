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
