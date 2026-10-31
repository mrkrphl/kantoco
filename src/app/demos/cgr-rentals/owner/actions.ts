"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { ownerClient, ownerSession, OWNER_DB_ON } from "@/lib/cgr-supabase";

const OWNER_PATH = `${CGR_BASE}/owner`;
const REF = /^CGR-[A-HJ-NP-Z2-9]{4}$/;
const SLOT = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const STATUSES = ["pending", "confirmed", "out", "returned", "cancelled"] as const;

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
  if (!REF.test(ref) || !(STATUSES as readonly string[]).includes(status) || (kind !== "reserve" && kind !== "fitting")) {
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
  revalidatePath(OWNER_PATH);
  return { ok: true, message: `${ref} saved.` };
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
  revalidatePath(OWNER_PATH);
  return { ok: true, message: "Fitting times saved." };
}
