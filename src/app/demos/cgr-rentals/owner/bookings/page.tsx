import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OwnerUnavailable } from "@/components/demos/cgr-rentals/OwnerAuth";
import { Bookings } from "@/components/demos/cgr-rentals/plain/Bookings";
import { PlainShell } from "@/components/demos/cgr-rentals/plain/PlainShell";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { manilaToday } from "@/lib/cgr-owner-format";
import { loadAdminCommission, loadOwnerData, OWNER_DB_ON } from "@/lib/cgr-supabase";
import { ownerGate } from "../gate";
import "../../plain.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "All bookings · CGR owners", robots: { index: false, follow: false } };

/** r8.4b: every reservation and fitting. The commission card is fetched and sent only for the admin (D1). */
export default async function BookingsPage() {
  if (!OWNER_DB_ON) redirect(`${CGR_BASE}/owner`);
  const g = await ownerGate("bookings");
  if ("screen" in g) return g.screen;
  const s = g.owner;
  const admin = s.role === "admin";
  const [data, commission] = await Promise.all([
    loadOwnerData(s.sb),
    admin ? loadAdminCommission(s.sb) : Promise.resolve(null),
  ]);
  return (
    <PlainShell page="bookings" current="bookings" admin={admin} signedIn>
      {data ? (
        <Bookings rows={data.rows} today={manilaToday()} commission={admin ? commission : null} />
      ) : (
        <OwnerUnavailable />
      )}
    </PlainShell>
  );
}
