"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { signIn, signOut, type SignInState } from "@/app/demos/cgr-rentals/owner/actions";

/**
 * r8.3: the owner sign-in screens. No bookings are sent to the browser until
 * the server has checked the session and the owners list. No sign-up here:
 * owner accounts are added by the shop in Supabase.
 */
export function OwnerSignIn() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  return (
    <section className="r11-rec" aria-labelledby="own-h" data-owner="signed-out">
      <p className="r11-kick">Owner view</p>
      <h1 id="own-h">Sign in to see bookings.</h1>
      <p className="r11-sub" style={{ marginTop: 0 }}>
        For the shop&rsquo;s owners only. Accounts are added by the shop; there is no sign-up here.
      </p>
      <form action={action} className="own-form" noValidate>
        {state.error ? (
          <div className="r11-alert" role="alert">
            {state.error}
          </div>
        ) : null}
        <div className="r11-field">
          <label htmlFor="own-email">Email</label>
          <input
            id="own-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            required
            defaultValue={state.email ?? ""}
          />
        </div>
        <div className="r11-field">
          <label htmlFor="own-pass">Password</label>
          <input id="own-pass" name="password" type="password" autoComplete="current-password" required />
        </div>
        <div className="r11-acts">
          <button type="submit" className="r11-btn r11-wine" aria-disabled={pending} disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
          <Link className="r11-link" href={`${CGR_BASE}#rail`}>
            Back to the gowns
          </Link>
        </div>
      </form>
    </section>
  );
}

export function SignOutButton({ className = "r11-link" }: { className?: string }) {
  return (
    <form action={signOut} style={{ display: "inline" }}>
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}

export function OwnerNotOwner({ email }: { email: string }) {
  return (
    <section className="r11-rec" aria-labelledby="own-h" data-owner="not-owner">
      <p className="r11-kick">Owner view</p>
      <h1 id="own-h">This account isn&rsquo;t an owner.</h1>
      <p className="r11-sub" style={{ marginTop: 0 }}>
        You&rsquo;re signed in as <strong>{email}</strong>. Bookings are shown only to the shop&rsquo;s owner
        accounts. If this is a mistake, ask the shop to add your email.
      </p>
      <div className="r11-acts">
        <SignOutButton className="r11-btn r11-wine" />
        <Link className="r11-link" href={`${CGR_BASE}#rail`}>
          Back to the gowns
        </Link>
      </div>
    </section>
  );
}

export function OwnerUnavailable() {
  return (
    <section className="r11-rec" aria-labelledby="own-h" data-owner="unavailable">
      <p className="r11-kick">Owner view</p>
      <h1 id="own-h">Bookings are resting for a moment.</h1>
      <p className="r11-sub" style={{ marginTop: 0 }}>
        The bookings database can&rsquo;t be reached right now. Nothing was changed. Please try again in a little
        while.
      </p>
      <div className="r11-acts">
        <button type="button" className="r11-btn r11-wine" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    </section>
  );
}
