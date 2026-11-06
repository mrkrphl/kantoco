"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { ownerClient, ownerSession, OWNER_DB_ON } from "@/lib/cgr-supabase";

const OWNER_PATH = `${CGR_BASE}/owner`;
const REF = /^CGR-[A-HJ-NP-Z2-9]{4}$/;
const SLOT = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
/** r8.4c: each kind has its own statuses. Fittings: Came in / No-show (D4, DEFAULT). */
const STATUSES: Record<"reserve" | "fitting", readonly string[]> = {
  reserve: ["pending", "confirmed", "out", "returned", "cancelled"],
  fitting: ["pending", "confirmed", "came_in", "no_show", "cancelled"],
};

/** Every owner page reads the same rows, so a change refreshes all of them. */
const refresh = () => revalidatePath(OWNER_PATH, "layout");

export type SignInState = { error?: string; email?: string };

/** Email and password only. There is no sign-up: accounts are added by the shop. */
export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!OWNER_DB_ON) return { error: "Owner sign-in isn't set up on this site yet.", email };
  if (!email || !password) return { error: "Enter your email and password.", email };
  const sb = await ownerClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    const status = (error as { status?: number }).status;
    if (status === 429) return { error: "Too many tries. Please wait a few minutes and try again.", email };
    if (!status || status >= 500) return { error: "Sign-in is resting for a moment. Please try again soon.", email };
    return { error: "That email and password don't match. Please check and try again.", email };
  }
  revalidatePath(OWNER_PATH);
  redirect(OWNER_PATH);
}

export async function signOut(): Promise<void> {
  if (OWNER_DB_ON) {
    const sb = await ownerClient();
    await sb.auth.signOut({ scope: "local" });
  }
  revalidatePath(OWNER_PATH);
  redirect(OWNER_PATH);
}

export type ActionResult = { ok: boolean; message: string };

export async function setStatus(kind: string, ref: string, status: string): Promise<ActionResult> {
  if (!REF.test(ref) || (kind !== "reserve" && kind !== "fitting") || !STATUSES[kind].includes(status)) {
    return { ok: false, message: "That change wasn't valid." };
  }
  const s = await ownerSession();
  if (s.state !== "owner") return { ok: false, message: "Please sign in again as an owner." };
  const table = kind === "fitting" ? "fittings" : "reservations";
  const { data, error } = await s.sb.from(table).update({ status }).eq("ref", ref).select("ref");
  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Another live fitting already has that day and time." };
    }
    return { ok: false, message: "Couldn't save that change. Please try again." };
  }
  if (!data || data.length === 0) return { ok: false, message: "That booking wasn't found." };
  refresh();
  return { ok: true, message: "Saved." };
}

/** Add a fitting time (from = null) or change one: its time and whether customers see it. */
export async function saveSlot(from: string | null, slot: string, active: boolean): Promise<ActionResult> {
  if (!SLOT.test(slot) || (from !== null && !SLOT.test(from))) {
    return { ok: false, message: "Use a time like 10:00 or 15:30." };
  }
  const s = await ownerSession();
  if (s.state !== "owner") return { ok: false, message: "Please sign in again as an owner." };
  const q =
    from === null
      ? s.sb.from("fitting_slots").insert({ slot, active: true }).select("slot")
      : s.sb.from("fitting_slots").update({ slot, active: Boolean(active) }).eq("slot", from).select("slot");
  const { data, error } = await q;
  if (error) {
    if (error.code === "23505") return { ok: false, message: "That time is already on the list." };
    return { ok: false, message: "Couldn't save that time. Please try again." };
  }
  if (!data || data.length === 0) return { ok: false, message: "That time wasn't found." };
  refresh();
  return { ok: true, message: "Fitting times saved." };
}

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * r8.4: the pickup and return days the owner agreed with the client. Either
 * can be blank. PLACEHOLDER, rule from Mark pending: nothing is worked out
 * from the event date; the owner types both days in.
 */
export async function setHandover(ref: string, pickupOn: string, returnOn: string): Promise<ActionResult> {
  if (!REF.test(ref) || (pickupOn && !DAY.test(pickupOn)) || (returnOn && !DAY.test(returnOn))) {
    return { ok: false, message: "Use a full date for pickup and return." };
  }
  if (pickupOn && returnOn && returnOn < pickupOn) {
    return { ok: false, message: "Return can't be before pickup." };
  }
  const s = await ownerSession();
  if (s.state !== "owner") return { ok: false, message: "Please sign in again as an owner." };
  const { data, error } = await s.sb
    .from("reservations")
    .update({ pickup_on: pickupOn || null, return_on: returnOn || null })
    .eq("ref", ref)
    .select("ref");
  if (error) {
    if (error.code === "23514") return { ok: false, message: "Return can't be before pickup." };
    return { ok: false, message: "Couldn't save those dates. Please try again." };
  }
  if (!data || data.length === 0) return { ok: false, message: "That reservation wasn't found." };
  refresh();
  return { ok: true, message: "Pickup and return days saved." };
}
