import { PlainShell } from "@/components/demos/cgr-rentals/plain/PlainShell";
import { OwnerNotOwner, OwnerPaused, OwnerSignIn, OwnerUnavailable } from "@/components/demos/cgr-rentals/OwnerAuth";
import { ownerSession, type OwnerSession } from "@/lib/cgr-supabase";

type Owner = Extract<OwnerSession, { state: "owner" }>;

/**
 * r8.4b: every plain owner page asks the server first. Signed out, not an
 * owner, paused or offline -> that screen and no booking data; an active
 * owner or admin -> the session to load rows with.
 */
export async function ownerGate(page: string): Promise<{ owner: Owner } | { screen: React.ReactNode }> {
  const s = await ownerSession();
  if (s.state === "owner") return { owner: s };
  const signedIn = s.state === "not_owner" || s.state === "paused";
  const body =
    s.state === "signed_out" ? (
      <OwnerSignIn />
    ) : s.state === "not_owner" ? (
      <OwnerNotOwner email={s.email} />
    ) : s.state === "paused" ? (
      <OwnerPaused email={s.email} />
    ) : (
      <OwnerUnavailable />
    );
  return {
    screen: (
      <PlainShell page={page} signedIn={signedIn}>
        {body}
      </PlainShell>
    ),
  };
}
