"use client";

import { useSyncExternalStore } from "react";
import {
  BOOKINGS_KEY,
  SLUG_ALIASES,
  type Booking,
  type BookingStatus,
} from "@/lib/cgr-rentals";

function safeParse(raw: string | null): Booking[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Booking[];
    if (!Array.isArray(data)) return [];
    return data.filter((b) => b && typeof b.ref === "string");
  } catch {
    return [];
  }
}

export function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(BOOKINGS_KEY));
}

const listeners = new Set<() => void>();

export function saveBookings(list: Booking[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === BOOKINGS_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

let cacheRaw: string | null | undefined;
let cacheList: Booking[] = [];
function snapshot(): Booking[] {
  const raw = window.localStorage.getItem(BOOKINGS_KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cacheList = safeParse(raw);
  }
  return cacheList;
}

/** Local bookings; null during SSR / hydration so server and first client paint match. */
export function useBookings(): Booking[] | null {
  return useSyncExternalStore<Booking[] | null>(
    subscribe,
    snapshot,
    () => null,
  );
}

const noSubscribe = () => () => {};

/** Today's local ISO date; null during SSR / hydration. */
export function useToday(): string | null {
  return useSyncExternalStore<string | null>(noSubscribe, todayIso, () => null);
}

export function makeRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const arr = new Uint32Array(4);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 4; i++) arr[i] = Math.floor(Math.random() * 1e9);
  }
  for (let i = 0; i < 4; i++) {
    code += alphabet[arr[i] % alphabet.length];
  }
  return `CGR-${code}`;
}

export function addBooking(
  partial: Omit<Booking, "ref" | "createdAt" | "status" | "sample"> & {
    status?: BookingStatus;
  },
): Booking {
  const list = loadBookings();
  let ref = makeRef();
  while (list.some((b) => b.ref === ref)) ref = makeRef();
  const booking: Booking = {
    ...partial,
    ref,
    status: partial.status ?? "pending",
    createdAt: new Date().toISOString(),
    sample: true,
  };
  list.unshift(booking);
  saveBookings(list);
  return booking;
}

export function updateBookingStatus(
  ref: string,
  status: BookingStatus,
): Booking | null {
  const list = loadBookings();
  const i = list.findIndex((b) => b.ref === ref);
  if (i < 0) return null;
  list[i] = { ...list[i], status };
  saveBookings(list);
  return list[i];
}

export function getBooking(ref: string): Booking | null {
  return loadBookings().find((b) => b.ref === ref) ?? null;
}

export function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function holds(b: Booking): boolean {
  return b.status !== "cancelled" && b.status !== "returned";
}

/** True if the gown is free on the given ISO date (mock calendar + local bookings, whole held range). */
export function isDateFree(
  gownSlug: string,
  isoDate: string,
  mockBooked: string[],
  bookings: Booking[],
): boolean {
  return isRangeFree(gownSlug, isoDate, isoDate, mockBooked, bookings);
}

/** True if no mock-booked day or held local booking overlaps [start, end] (ISO dates, inclusive). */
export function isRangeFree(
  gownSlug: string,
  start: string,
  end: string,
  mockBooked: string[],
  bookings: Booking[],
): boolean {
  if (mockBooked.some((d) => d >= start && d <= end)) return false;
  return !bookings.some(
    (b) =>
      (SLUG_ALIASES[b.gownSlug] ?? b.gownSlug) === gownSlug &&
      holds(b) &&
      b.eventDate <= end &&
      (b.returnDate || b.eventDate) >= start,
  );
}
