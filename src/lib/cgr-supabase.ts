/**
 * r8.3: server-side Supabase for the owner pages (sign-in, bookings, CSV).
 * Session cookies come from @supabase/ssr; every check runs on the server
 * with auth.getUser(), which asks Supabase to verify the session. Owner
 * status is whatever row-level security returns from public.owners: owners
 * see the list, everyone else gets nothing back. Only the publishable key
 * is used here, read from env (never in code).
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
  | { state: "owner"; email: string; sb: OwnerClient };

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
    const owners = await sb.from("owners").select("email").limit(1);
    if (owners.error) return { state: "unavailable" };
    if (!owners.data || owners.data.length === 0) return { state: "not_owner", email };
    return { state: "owner", email, sb };
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
  status: "pending" | "confirmed" | "out" | "returned" | "cancelled";
  createdAt: string;
};

export type OwnerSlot = { slot: string; active: boolean };

export type OwnerData = { rows: OwnerRow[]; slots: OwnerSlot[] };

/** Reads every booking and fitting time. RLS returns rows to owners only. */
export async function loadOwnerData(sb: OwnerClient): Promise<OwnerData | null> {
  const [res, fit, gowns, slots] = await Promise.all([
    sb
      .from("reservations")
      .select("ref,gown_slug,event_date,return_date,customer_name,customer_contact,notes,status,created_at"),
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
