/**
 * r8.3: server-side Supabase for the owner pages (sign-in, bookings, CSV).
 * Session cookies come from @supabase/ssr; every check runs on the server
 * with auth.getUser(), which asks Supabase to verify the session. Only the
 * publishable key is used here, read from env (never in code).
 * r8.4: the owners list is admin-only now, so the session asks owner_me()
 * for the caller's own row (role admin|owner, status active|paused). A
 * paused owner gets nothing: RLS and every owner RPC check status too.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** False without the env vars: /owner keeps the device-only view. */
export const OWNER_DB_ON = Boolean(SB_URL && SB_KEY);

export async function ownerClient() {
  const store = await cookies();
  return createServerClient(SB_URL, SB_KEY, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // A server component can't write cookies; proxy.ts refreshes them.
        }
      },
    },
  });
}

export type OwnerClient = Awaited<ReturnType<typeof ownerClient>>;

export type OwnerSession =
  | { state: "signed_out" }
  | { state: "unavailable" }
  | { state: "not_owner"; email: string }
  | { state: "paused"; email: string }
  | { state: "owner"; email: string; role: OwnerRole; sb: OwnerClient };

export type OwnerRole = "admin" | "owner";

export async function ownerSession(): Promise<OwnerSession> {
  try {
    const sb = await ownerClient();
    const { data, error } = await sb.auth.getUser();
    if (error || !data.user) {
      const status = (error as { status?: number } | null)?.status;
      // No status (network) or a server error: the project is unreachable.
      if (error && error.name !== "AuthSessionMissingError" && (!status || status >= 500)) {
        return { state: "unavailable" };
      }
      return { state: "signed_out" };
    }
    const email = data.user.email ?? "";
    const me = await sb.rpc("owner_me");
    if (me.error) return { state: "unavailable" };
    const row = me.data as { role?: string; status?: string } | null;
    if (!row || !row.role) return { state: "not_owner", email };
    if (row.status !== "active") return { state: "paused", email };
    return { state: "owner", email, role: row.role === "admin" ? "admin" : "owner", sb };
  } catch {
    return { state: "unavailable" };
  }
}

/** One owner-view row: a reservation or a fitting, as stored. */
export type OwnerRow = {
  kind: "reserve" | "fitting";
  ref: string;
  gownSlug: string;
  gownName: string;
  eventDate: string;
  returnDate: string;
  fittingDate?: string;
  slot?: string;
  linkedRef?: string;
  customerName: string;
  customerContact: string;
  notes: string;
  status: "pending" | "confirmed" | "out" | "returned" | "cancelled" | "came_in" | "no_show";
  createdAt: string;
  /** r8.4, reservations: the day the client picks up and brings back, set by the owner. */
  pickupOn?: string;
  returnOn?: string;
  /** r9.1 accessory add-ons chosen at reserve */
  addons?: { slug: string; name: string; price_per_day: number | null }[];
};

export type OwnerSlot = { slot: string; active: boolean };

export type OwnerData = { rows: OwnerRow[]; slots: OwnerSlot[] };

/** Reads every booking and fitting time. RLS returns rows to owners only. */
export async function loadOwnerData(sb: OwnerClient): Promise<OwnerData | null> {
  const [res, fit, gowns, slots] = await Promise.all([
    sb
      .from("reservations")
      .select("ref,gown_slug,event_date,return_date,customer_name,customer_contact,notes,status,created_at,pickup_on,return_on,addons"),
    sb
      .from("fittings")
      .select("ref,linked_ref,gown_slug,fitting_date,slot,customer_name,customer_contact,notes,status,created_at"),
    sb.from("gowns").select("slug,name"),
    sb.from("fitting_slots").select("slot,active").order("slot"),
  ]);
  if (res.error || fit.error || gowns.error || slots.error) return null;
  const names = new Map((gowns.data ?? []).map((g) => [g.slug as string, g.name as string]));
  const events = new Map((res.data ?? []).map((r) => [r.ref as string, r.event_date as string]));
  const rows: OwnerRow[] = [
    ...(res.data ?? []).map((r) => ({
      kind: "reserve" as const,
      ref: r.ref,
      gownSlug: r.gown_slug,
      gownName: names.get(r.gown_slug) ?? r.gown_slug,
      eventDate: r.event_date,
      returnDate: r.return_date,
      customerName: r.customer_name,
      customerContact: r.customer_contact,
      notes: r.notes ?? "",
      status: r.status,
      createdAt: r.created_at,
      pickupOn: r.pickup_on ?? undefined,
      returnOn: r.return_on ?? undefined,
      addons: Array.isArray(r.addons) ? r.addons : [],
    })),
    ...(fit.data ?? []).map((f) => ({
      kind: "fitting" as const,
      ref: f.ref,
      gownSlug: f.gown_slug ?? "",
      gownName: f.gown_slug ? (names.get(f.gown_slug) ?? f.gown_slug) : "",
      eventDate: f.linked_ref ? (events.get(f.linked_ref) ?? "") : "",
      returnDate: "",
      fittingDate: f.fitting_date,
      slot: f.slot,
      linkedRef: f.linked_ref ?? undefined,
      customerName: f.customer_name,
      customerContact: f.customer_contact,
      notes: f.notes ?? "",
      status: f.status,
      createdAt: f.created_at,
    })),
  ];
  return { rows, slots: (slots.data ?? []) as OwnerSlot[] };
}

/** r8.4: one row of the admin's owners list (admin_list_owners). */
export type AdminOwner = {
  email: string;
  role: OwnerRole;
  status: "active" | "paused";
  added_at: string;
  paused_at: string | null;
  has_login: boolean;
  /** r8.4d: when Supabase Auth sent the latest invite, or null if none. */
  invited_at: string | null;
  is_you: boolean;
};

/** Maps a "cgr:code" error from the owner/admin RPCs to its code. */
export function cgrCode(err: { message?: string } | null | undefined): string {
  const m = /cgr:([a-z_]+)/.exec(err?.message ?? "");
  return m ? m[1] : "unknown";
}

/**
 * r8.4: owner_dashboard(): today's fittings, pickups and (r8.4c, D7) returns,
 * the next 7 days and this week's counts. Pickup and return days come only
 * from what the shop typed in (pickup_on / return_on); the rule is not set.
 */
export type OwnerDashboard = {
  today: string;
  week_start: string;
  week_end: string;
  fittings_today: { ref: string; slot: string; name: string; gown: string | null; status: string }[];
  pickups_today: { ref: string; name: string; gown: string | null; status: string }[];
  returns_today: { ref: string; name: string; gown: string | null; status: string }[];
  next_7_days: { day: string; kind: "fitting" | "pickup" | "return"; ref: string; name: string; gown: string | null; status: string; slot?: string }[];
  this_week: { reservations: number; fittings: number };
};

export async function loadOwnerDashboard(sb: OwnerClient): Promise<OwnerDashboard | null> {
  const { data, error } = await sb.rpc("owner_dashboard");
  return error || !data ? null : (data as OwnerDashboard);
}

/** r8.4c: the admin-only commission line (D1). Owners get null (the RPC refuses them). */
export type AdminCommission = { count: number; per_php: number; total_php: number; month?: string; rows?: { ref: string; created_at: string; customer_name: string; gown_slug: string; status: string; source: string; commission_php: number }[] };

export async function loadAdminCommission(sb: OwnerClient): Promise<AdminCommission | null> {
  const { data, error } = await sb.rpc("admin_commission");
  return error || !data ? null : (data as AdminCommission);
}
