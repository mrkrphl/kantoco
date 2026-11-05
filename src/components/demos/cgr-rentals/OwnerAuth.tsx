"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { signIn, signOut, type SignInState } from "@/app/demos/cgr-rentals/owner/actions";

/**
 * r8.3: the owner sign-in screens. No bookings are sent to the browser until
 * the server has checked the session and the owners list. No sign-up here:
 * owners join by an admin's invite.
 * r8.4b: plain style (design-r8.4b), inside .cgr-plain.
 */
export function OwnerSignIn() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  return (
    <section className="sec card wrap" aria-labelledby="own-h" data-owner="signed-out" style={{ marginTop: 0 }}>
      <h1 id="own-h">Sign in</h1>
      <p className="sub">For the shop&rsquo;s owners. You join by an invite from the admin; there is no sign-up.</p>
      <form action={action} noValidate style={{ marginTop: 16 }}>
        {state.error ? (
          <p className="alert" role="alert" style={{ margin: "0 0 14px" }}>
            {state.error}
          </p>
        ) : null}
        <label className="f" htmlFor="own-email">
          Email
        </label>
        <input
          id="own-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          required
          defaultValue={state.email ?? ""}
        />
        <label className="f" htmlFor="own-pass" style={{ marginTop: 16 }}>
          Password
        </label>
        <input id="own-pass" name="password" type="password" className="pw" autoComplete="current-password" required />
        <div className="acts">
          <button type="submit" className="btn btn-wine" aria-disabled={pending} disabled={pending} style={{ width: "100%" }}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function SignOutButton({ className = "out" }: { className?: string }) {
  return (
    <form action={signOut} style={{ display: "inline-flex" }}>
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}

export function OwnerNotOwner({ email }: { email: string }) {
  return (
    <section className="sec card" aria-labelledby="own-h" data-owner="not-owner" style={{ marginTop: 0 }}>
      <h1 id="own-h">This account isn&rsquo;t an owner</h1>
      <p style={{ marginTop: 8 }}>
        You&rsquo;re signed in as <strong>{email}</strong>. Only the shop&rsquo;s owners see bookings. If this is a
        mistake, ask the admin for an invite.
      </p>
      <div className="acts">
        <SignOutButton className="btn btn-wine" />
        <Link className="btn btn-plain" href={CGR_BASE}>
          Back to the gowns
        </Link>
      </div>
    </section>
  );
}

/** r8.4: an admin paused this account. No bookings are sent; the database refuses too. */
export function OwnerPaused({ email }: { email: string }) {
  return (
    <section className="sec card" aria-labelledby="own-h" data-owner="paused" style={{ marginTop: 0 }}>
      <h1 id="own-h">Your account is paused</h1>
      <p style={{ marginTop: 8 }}>
        You&rsquo;re signed in as <strong>{email}</strong>. The admin paused this account, so bookings are hidden.
        Ask the admin to resume it.
      </p>
      <div className="acts">
        <SignOutButton className="btn btn-wine" />
      </div>
    </section>
  );
}

export function OwnerUnavailable() {
  return (
    <section className="sec card" aria-labelledby="own-h" data-owner="unavailable" style={{ marginTop: 0 }}>
      <h1 id="own-h">Bookings can&rsquo;t load right now</h1>
      <p style={{ marginTop: 8 }}>
        The bookings database can&rsquo;t be reached. Nothing was changed. Please try again in a little while.
      </p>
      <div className="acts">
        <button type="button" className="btn btn-wine" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    </section>
  );
}
