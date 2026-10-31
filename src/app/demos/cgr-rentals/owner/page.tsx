import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { OwnerView } from "@/components/demos/cgr-rentals/OwnerView";
import { OwnerNotOwner, OwnerSignIn, OwnerUnavailable } from "@/components/demos/cgr-rentals/OwnerAuth";
import { OwnerDb } from "@/components/demos/cgr-rentals/OwnerDb";
import { loadOwnerData, ownerSession, OWNER_DB_ON } from "@/lib/cgr-supabase";

export const dynamic = "force-dynamic";

/**
 * r8.3: with the Supabase env vars, /owner checks the session on the server
 * (cookies via @supabase/ssr) before sending any booking: signed out shows
 * the sign-in form, a non-owner sees "not an owner", owners get the
 * database view. Without the env vars it stays the device-only view.
 */
export default async function OwnerPage() {
  if (!OWNER_DB_ON) {
    return (
      <CgrShell current="Owner">
        <OwnerView />
      </CgrShell>
    );
  }
  const s = await ownerSession();
  let body: React.ReactNode;
  if (s.state === "signed_out") body = <OwnerSignIn />;
  else if (s.state === "not_owner") body = <OwnerNotOwner email={s.email} />;
  else if (s.state === "unavailable") body = <OwnerUnavailable />;
  else {
    const data = await loadOwnerData(s.sb);
    body = data ? <OwnerDb email={s.email} rows={data.rows} slots={data.slots} /> : <OwnerUnavailable />;
  }
  return <CgrShell current="Owner">{body}</CgrShell>;
}
