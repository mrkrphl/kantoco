import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { OwnerView } from "@/components/demos/cgr-rentals/OwnerView";
import { OwnerUnavailable } from "@/components/demos/cgr-rentals/OwnerAuth";
import { OwnerHome } from "@/components/demos/cgr-rentals/plain/OwnerHome";
import { PlainShell } from "@/components/demos/cgr-rentals/plain/PlainShell";
import { loadOwnerDashboard, OWNER_DB_ON } from "@/lib/cgr-supabase";
import { ownerGate } from "./gate";
import "../plain.css";

export const dynamic = "force-dynamic";

/**
 * r8.3: with the Supabase env vars, /owner checks the session on the server
 * (cookies via @supabase/ssr) before sending any booking. Without them it
 * stays the device-only view.
 * r8.4: a paused owner sees "paused" and gets no data (the database refuses
 * too); the role decides the admin-only bits.
 * r8.4b: plain owner home (design-r8.4b): Today, Coming up, This week.
 */
export default async function OwnerPage() {
  if (!OWNER_DB_ON) {
    return (
      <CgrShell current="Owner">
        <OwnerView />
      </CgrShell>
    );
  }
  const g = await ownerGate("owner");
  if ("screen" in g) return g.screen;
  const s = g.owner;
  const dash = await loadOwnerDashboard(s.sb);
  return (
    <PlainShell page="owner" current="today" admin={s.role === "admin"} signedIn>
      {dash ? <OwnerHome dash={dash} /> : <OwnerUnavailable />}
    </PlainShell>
  );
}
