import type { Metadata } from "next";
import { PlainShell } from "@/components/demos/cgr-rentals/plain/PlainShell";
import { SetPassword } from "@/components/demos/cgr-rentals/plain/SetPassword";
import { OWNER_DB_ON } from "@/lib/cgr-supabase";
import "../../plain.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set your password · CGR owners", robots: { index: false, follow: false } };

/**
 * r8.4: where an invite email lands (Supabase invite -> this page). The new
 * owner chooses their own password here. Plain and unstyled on purpose until
 * Design's plain re-stamp; scoped to .cgr-plain so nothing else changes.
 */
export default function SetPasswordPage() {
  return (
    <PlainShell page="set-password">
      {OWNER_DB_ON ? (
        <SetPassword />
      ) : (
        <section className="sec card wrap" style={{ marginTop: 0 }}>
          <h1>Owner sign-in isn&rsquo;t set up on this site.</h1>
          <p className="sub">Nothing to do here yet.</p>
        </section>
      )}
    </PlainShell>
  );
}
