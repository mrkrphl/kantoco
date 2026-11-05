import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OwnerUnavailable } from "@/components/demos/cgr-rentals/OwnerAuth";
import { FittingTimes } from "@/components/demos/cgr-rentals/plain/FittingTimes";
import { PlainShell } from "@/components/demos/cgr-rentals/plain/PlainShell";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { loadOwnerData, OWNER_DB_ON } from "@/lib/cgr-supabase";
import { ownerGate } from "../gate";
import "../../plain.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Fitting times · CGR owners", robots: { index: false, follow: false } };

/** r8.4b: the fitting times customers can pick. Owners and the admin can edit them. */
export default async function TimesPage() {
  if (!OWNER_DB_ON) redirect(`${CGR_BASE}/owner`);
  const g = await ownerGate("times");
  if ("screen" in g) return g.screen;
  const s = g.owner;
  const data = await loadOwnerData(s.sb);
  return (
    <PlainShell page="times" current="owner" admin={s.role === "admin"} signedIn>
      {data ? <FittingTimes slots={data.slots} /> : <OwnerUnavailable />}
    </PlainShell>
  );
}
