// CGR r8.4: invite-owner (Supabase Edge Function, project cgr-rentals).
//
// Sends a Supabase invite email so a new owner can set their own password.
// Mark's pick (31 Oct 2026): real invites through Supabase's built-in email
// sender. No custom SMTP. Public sign-up stays off.
//
// Who can call it: a signed-in user whose owners row is role "admin" and
// status "active". The caller's own JWT is checked here (auth.getUser), then
// owner_me() and admin_list_owners() run AS THE CALLER, so the database's
// own admin checks apply too. The invitee must already be on the owners
// list (the admin page adds them first).
//
// Keys: the service-role key is read only inside this function, from the
// SUPABASE_SERVICE_ROLE_KEY env that Supabase sets for every Edge Function.
// It is never returned, logged, or copied to the app, Vercel or the repo.

import { createClient } from "npm:@supabase/supabase-js@2";

// ALLOWLIST: until Mark approves the pitch, invites go ONLY to these
// addresses, whatever the admin page sends. This lifts after pitch approval
// (then remove this check and rely on the admin + owners-list checks above).
const INVITE_ALLOWLIST = new Set<string>([
  "kantoco.ph@gmail.com",
  "kantoco.ph+cgr-invite-test@gmail.com", // test inbox (same Gmail inbox, own login)
]);

// Where the invite link lands: the set-password page on the KantoCo
// previews, or the local QA server. Anything else is refused.
const SET_PASSWORD_PATH = "/demos/cgr-rentals/owner/set-password";
const ORIGIN_OK = /^(https:\/\/kantoco(-[a-z0-9-]+)?\.vercel\.app|http:\/\/localhost:3083)$/;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "method" });

  const authz = req.headers.get("Authorization") ?? "";
  const jwt = authz.startsWith("Bearer ") ? authz.slice(7) : "";
  if (!jwt) return json(401, { ok: false, error: "not_signed_in" });

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const caller = createClient(url, anon, {
    global: { headers: { Authorization: authz } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const who = await caller.auth.getUser(jwt);
  if (who.error || !who.data.user) return json(401, { ok: false, error: "not_signed_in" });

  const me = await caller.rpc("owner_me");
  const row = (me.data ?? null) as { role?: string; status?: string } | null;
  if (me.error || !row || row.role !== "admin" || row.status !== "active") {
    return json(403, { ok: false, error: "not_admin" });
  }

  let body: { email?: unknown; origin?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "bad_request" });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const origin = String(body.origin ?? "").replace(/\/+$/, "");
  if (!EMAIL_OK.test(email)) return json(400, { ok: false, error: "bad_email" });
  if (!INVITE_ALLOWLIST.has(email)) return json(403, { ok: false, error: "not_allowlisted" });
  if (!ORIGIN_OK.test(origin)) return json(400, { ok: false, error: "bad_origin" });

  // The invitee must be on the owners list already (read as the caller: admins only).
  const list = await caller.rpc("admin_list_owners");
  if (list.error) return json(403, { ok: false, error: "not_admin" });
  const target = ((list.data ?? []) as { email: string; has_login: boolean }[]).find((o) => o.email === email);
  if (!target) return json(404, { ok: false, error: "not_found" });
  if (target.has_login) return json(409, { ok: false, error: "has_login" });

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const sent = await admin.auth.admin.inviteUserByEmail(email, { redirectTo: origin + SET_PASSWORD_PATH });
  if (sent.error) {
    const status = (sent.error as { status?: number }).status ?? 500;
    const msg = (sent.error.message ?? "").toLowerCase();
    if (status === 429 || msg.includes("rate")) return json(429, { ok: false, error: "rate_limited" });
    if (msg.includes("already") && msg.includes("registered")) return json(409, { ok: false, error: "has_login" });
    if (msg.includes("not authorized") || msg.includes("not allowed")) {
      return json(502, { ok: false, error: "sender_refused" });
    }
    return json(502, { ok: false, error: "send_failed" });
  }
  return json(200, { ok: true, email });
});
