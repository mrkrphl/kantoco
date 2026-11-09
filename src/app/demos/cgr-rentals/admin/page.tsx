import type { Metadata } from "next";
import { AdminPanel } from "@/components/demos/cgr-rentals/plain/AdminPanel";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { ownerSession, OWNER_DB_ON, type AdminOwner } from "@/lib/cgr-supabase";
import { SignOutButton } from "@/components/demos/cgr-rentals/OwnerAuth";
import { PlainShell } from "@/components/demos/cgr-rentals/plain/PlainShell";
import "../plain.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Owners · CGR admin", robots: { index: false, follow: false } };

/**
 * r8.4: the admin page. Lists who can open the owner view, adds people,
 * pauses or resumes them, changes roles and removes them. The server checks
 * the session before any list is sent: non-admins get no data. Plain and
 * minimal on purpose until Design's plain re-stamp (.cgr-plain, scoped).
 */
export default async function AdminPage() {
  const s = OWNER_DB_ON ? await ownerSession() : ({ state: "unavailable" } as const);
  let body: React.ReactNode;
  if (s.state === "signed_out") {
    body = (
      <div className="sec card wrap" style={{ marginTop: 0 }} data-admin="signed-out">
        <h1>Owners</h1>
        <p className="sub">Sign in with an admin account to manage owners.</p>
        <div className="acts">
          <a className="btn btn-wine" href={`${CGR_BASE}/owner`}>Go to owner sign-in</a>
        </div>
      </div>
    );
  } else if (s.state === "unavailable") {
    body = (
      <div className="sec card" style={{ marginTop: 0 }} data-admin="unavailable">
        <h1>Owners</h1>
        <p>The owners list can&rsquo;t be reached right now. Nothing was changed. Please try again soon.</p>
      </div>
    );
  } else if (s.state === "not_owner" || s.state === "paused" || s.role !== "admin") {
    const why =
      s.state === "paused"
        ? "Your account is paused."
        : s.state === "not_owner"
          ? "This account isn't on the owners list."
          : "Only admins can manage owners.";
    body = (
      <div className="sec card" style={{ marginTop: 0 }} data-admin="not-admin">
        <h1>Owners</h1>
        <p className="alert" role="alert">
          {why}
        </p>
        <p>
          Signed in as <strong>{s.email}</strong>.
        </p>
        <div className="acts">
          {s.state === "owner" ? <a className="btn btn-plain" href={`${CGR_BASE}/owner`}>Back to the owner view</a> : null}
          <SignOutButton className="btn btn-plain" />
        </div>
      </div>
    );
  } else {
    const { data, error } = await s.sb.rpc("admin_list_owners");
    body = error ? (
      <div className="sec card" style={{ marginTop: 0 }} data-admin="unavailable">
        <h1>Owners</h1>
        <p>The owners list can&rsquo;t be reached right now. Please try again soon.</p>
      </div>
    ) : (
      <AdminPanel owners={(data ?? []) as AdminOwner[]} />
    );
  }
  return (
    <PlainShell
      page="admin"
      current="admin"
      signedIn={s.state !== "signed_out" && s.state !== "unavailable"}
      admin={s.state === "owner" && s.role === "admin"}
    >
      {body}
    </PlainShell>
  );
}
