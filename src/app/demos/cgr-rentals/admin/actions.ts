"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { cgrCode, ownerSession } from "@/lib/cgr-supabase";

/**
 * r8.4: the admin page's server actions. Each one checks the session again,
 * and the database checks again (admin + active, last-admin and self rules
 * in RPCs and a trigger), so a hand-made request gets nowhere. Invites go
 * through the invite-owner Edge Function, which holds the only key that can
 * send them; this app never sees that key.
 */

const ADMIN_PATH = `${CGR_BASE}/admin`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mirrors the allowlist inside the invite-owner function (the function is
// the one that enforces it). Lifts after pitch approval.
const INVITE_ALLOWLIST = ["kantoco.ph@gmail.com", "kantoco.ph+cgr-invite-test@gmail.com"];

export type AdminResult = { ok: boolean; message: string; field?: string; invited?: boolean };

const SAY: Record<string, string> = {
  bad_email: "Enter a full email address, like name@gmail.com.",
  bad_role: "Pick Owner or Admin.",
  exists: "That email is already on the list.",
  self: "You can't do that to your own account. Ask another admin.",
  last_admin: "There must always be at least one active admin. Make someone else an admin first.",
  not_found: "That email isn't on the list any more.",
  not_admin: "Only an active admin can do that. Please sign in again.",
};

function say(err: { message?: string } | null, fallback: string): string {
  return SAY[cgrCode(err)] ?? fallback;
}

async function admin() {
  const s = await ownerSession();
  return s.state === "owner" && s.role === "admin" ? s : null;
}

async function origin(): Promise<string> {
  const h = await headers();
  const o = h.get("origin");
  if (o) return o;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const INVITE_SAY: Record<string, string> = {
  not_allowlisted: "Invites are limited to the shop's own test addresses until the pitch is approved.",
  has_login: "This person already has a login. They can sign in now.",
  rate_limited: "Too many invite emails just now. Please try again in an hour.",
  not_found: "Add this email to the list first.",
  not_admin: "Only an active admin can send invites. Please sign in again.",
  bad_origin: "Invites can only be sent from the shop's own site.",
  sender_refused: "The email service refused to send to that address.",
};

async function invite(sb: NonNullable<Awaited<ReturnType<typeof admin>>>["sb"], email: string): Promise<AdminResult> {
  const { error } = await sb.functions.invoke("invite-owner", { body: { email, origin: await origin() } });
  if (!error) return { ok: true, invited: true, message: `Invite sent to ${email}. They show as Invited until they set a password.` };
  let code = "";
  try {
    const ctx = (error as { context?: Response }).context;
    code = ctx ? String(((await ctx.json()) as { error?: string }).error ?? "") : "";
  } catch {
    code = "";
  }
  return { ok: false, message: INVITE_SAY[code] ?? "Couldn't send the invite. Please try again." };
}

export async function addOwner(_prev: AdminResult | null, form: FormData): Promise<AdminResult> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const role = String(form.get("role") ?? "owner");
  if (!EMAIL.test(email)) return { ok: false, field: "email", message: SAY.bad_email };
  if (role !== "owner" && role !== "admin") return { ok: false, field: "role", message: SAY.bad_role };
  const s = await admin();
  if (!s) return { ok: false, message: SAY.not_admin };
  const { error } = await s.sb.rpc("admin_add_owner", { p_email: email, p_role: role });
  if (error) {
    const c = cgrCode(error);
    return { ok: false, field: c === "bad_email" || c === "exists" ? "email" : undefined, message: say(error, "Couldn't add that email. Please try again.") };
  }
  revalidatePath(ADMIN_PATH);
  const who = role === "admin" ? "an admin" : "an owner";
  if (!INVITE_ALLOWLIST.includes(email)) {
    return {
      ok: true,
      message: `${email} was added as ${who}. No invite was sent: invites are limited to the shop's own test addresses until the pitch is approved.`,
    };
  }
  const inv = await invite(s.sb, email);
  return inv.ok
    ? { ok: true, invited: true, message: `${email} was added as ${who}. ${inv.message}` }
    : { ok: true, message: `${email} was added as ${who}, but the invite didn't go out: ${inv.message}` };
}

export async function sendInvite(email: string): Promise<AdminResult> {
  if (!EMAIL.test(email)) return { ok: false, message: SAY.bad_email };
  const s = await admin();
  if (!s) return { ok: false, message: SAY.not_admin };
  return invite(s.sb, email.toLowerCase());
}

export async function setOwnerStatus(email: string, status: "active" | "paused"): Promise<AdminResult> {
  if (!EMAIL.test(email) || (status !== "active" && status !== "paused")) return { ok: false, message: "That change wasn't valid." };
  const s = await admin();
  if (!s) return { ok: false, message: SAY.not_admin };
  const { error } = await s.sb.rpc("admin_set_status", { p_email: email, p_status: status });
  if (error) return { ok: false, message: say(error, "Couldn't save that change. Please try again.") };
  revalidatePath(ADMIN_PATH);
  return {
    ok: true,
    message: status === "paused" ? `${email} is paused and can't see bookings.` : `${email} is active again.`,
  };
}

export async function setOwnerRole(email: string, role: "owner" | "admin"): Promise<AdminResult> {
  if (!EMAIL.test(email) || (role !== "owner" && role !== "admin")) return { ok: false, message: "That change wasn't valid." };
  const s = await admin();
  if (!s) return { ok: false, message: SAY.not_admin };
  const { error } = await s.sb.rpc("admin_set_role", { p_email: email, p_role: role });
  if (error) return { ok: false, message: say(error, "Couldn't save that change. Please try again.") };
  revalidatePath(ADMIN_PATH);
  return { ok: true, message: `${email} is now ${role === "admin" ? "an admin" : "an owner"}.` };
}

export async function removeOwner(email: string): Promise<AdminResult> {
  if (!EMAIL.test(email)) return { ok: false, message: "That change wasn't valid." };
  const s = await admin();
  if (!s) return { ok: false, message: SAY.not_admin };
  const { error } = await s.sb.rpc("admin_remove_owner", { p_email: email });
  if (error) return { ok: false, message: say(error, "Couldn't remove that email. Please try again.") };
  revalidatePath(ADMIN_PATH);
  return { ok: true, message: `${email} was removed from the list and can't see bookings.` };
}

/**
 * r8.4b (D9): invite = put them on the list as invited + send the real
 * invite email through invite-owner. There is no add-without-invite path.
 * Until the pitch is approved, only the allowlisted test inboxes can be
 * invited; anything else is refused before the list changes.
 */
export async function inviteOwner(_prev: AdminResult | null, form: FormData): Promise<AdminResult> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const role = String(form.get("role") ?? "owner");
  if (!EMAIL.test(email)) return { ok: false, field: "email", message: "Couldn't send the invite. Check the email and try again." };
  if (role !== "owner" && role !== "admin") return { ok: false, field: "role", message: SAY.bad_role };
  const s = await admin();
  if (!s) return { ok: false, message: SAY.not_admin };
  if (!INVITE_ALLOWLIST.includes(email)) return { ok: false, field: "email", message: INVITE_SAY.not_allowlisted };
  const { error } = await s.sb.rpc("admin_add_owner", { p_email: email, p_role: role });
  if (error && cgrCode(error) !== "exists") {
    const c = cgrCode(error);
    return { ok: false, field: c === "bad_email" ? "email" : undefined, message: say(error, "Couldn't send the invite. Please try again.") };
  }
  revalidatePath(ADMIN_PATH);
  const inv = await invite(s.sb, email);
  return inv.ok
    ? { ok: true, invited: true, message: `Invite sent to ${email}. They show as Invited until they set a password.` }
    : { ok: false, message: `${email} is on the list, but the invite didn't go out: ${inv.message}` };
}
