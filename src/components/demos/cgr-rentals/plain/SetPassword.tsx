"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useMemo, useState } from "react";
import { CGR_BASE } from "@/lib/cgr-rentals";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const MIN = 8;

function Card({ state, children }: { state: string; children: React.ReactNode }) {
  return (
    <section className="sec card wrap" data-setpw={state} style={{ marginTop: 0 }}>
      {children}
    </section>
  );
}

type Stage =
  | { s: "checking" }
  | { s: "ready"; email: string }
  | { s: "no_link"; why: string }
  | { s: "expired" }
  | { s: "done"; email: string };

/**
 * r8.4: reads the invite link Supabase sent (tokens in the URL hash, or a
 * token_hash in the query), starts that session in cookies (so /owner works
 * right after), and lets the owner choose a password. The tokens are wiped
 * from the address bar straight away. Nothing here is logged or stored
 * beyond Supabase's own session cookies.
 */
export function SetPassword() {
  const sb = useMemo(
    () => createBrowserClient(SB_URL, SB_KEY, { auth: { detectSessionInUrl: false } }),
    [],
  );
  const [stage, setStage] = useState<Stage>({ s: "checking" });
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const query = new URLSearchParams(window.location.search);
      if (window.location.hash || query.has("token_hash")) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      const linkError = hash.get("error_description") || query.get("error_description");
      if (linkError) {
        if (live) setStage({ s: "expired" });
        return;
      }
      const at = hash.get("access_token");
      const rt = hash.get("refresh_token");
      const th = query.get("token_hash");
      if (at && rt) await sb.auth.setSession({ access_token: at, refresh_token: rt });
      else if (th) await sb.auth.verifyOtp({ token_hash: th, type: "invite" });
      const { data } = await sb.auth.getUser();
      if (!live) return;
      if (data.user?.email) setStage({ s: "ready", email: data.user.email });
      else setStage({ s: "no_link", why: "Open this page from the invite email the shop sent you." });
    })().catch(() => live && setStage({ s: "no_link", why: "Couldn't check the invite. Please try the link again." }));
    return () => {
      live = false;
    };
  }, [sb]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (stage.s !== "ready") return;
    if (pw.length < MIN) return setErr(`Use at least ${MIN} characters. This one has ${pw.length}.`);
    if (pw !== pw2) return setErr("The two passwords don't match.");
    setErr("");
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    setPw("");
    setPw2("");
    if (error) {
      const weak = /weak|short|characters/i.test(error.message ?? "");
      setErr(weak ? "Pick a longer password that is harder to guess." : "Couldn't set your password. Check your connection and try again.");
      return;
    }
    setStage({ s: "done", email: stage.email });
  }

  if (stage.s === "checking") {
    return (
      <Card state="checking">
        <h1 aria-busy="true">Set your password</h1>
        <p className="sub">Checking your invite…</p>
      </Card>
    );
  }
  if (stage.s === "expired") {
    return (
      <Card state="expired">
        <h1>This invite link has expired</h1>
        <p className="sub" role="alert">
          Invite links only work for a limited time. Ask the admin for a new invite.
        </p>
        <p style={{ marginTop: 16 }}>Already set your password?</p>
        <div className="acts" style={{ marginTop: 8 }}>
          <a className="btn btn-wine" href={`${CGR_BASE}/owner`}>
            Sign in
          </a>
        </div>
      </Card>
    );
  }
  if (stage.s === "no_link") {
    return (
      <Card state="no-link">
        <h1>Set your password</h1>
        <p className="alert" role="alert">
          {stage.why}
        </p>
        <p style={{ marginTop: 12 }}>Ask the admin to send a new invite.</p>
        <div className="acts">
          <a className="btn btn-plain" href={`${CGR_BASE}/owner`}>
            Go to owner sign-in
          </a>
        </div>
      </Card>
    );
  }
  if (stage.s === "done") {
    return (
      <Card state="done">
        <p className="done" role="status">
          ✓ Password set
        </p>
        <h1>You&rsquo;re signed in</h1>
        <p className="sub">
          Signed in as <strong>{stage.email}</strong>. Next time, sign in with this email and password.
        </p>
        <div className="acts">
          <a className="btn btn-wine" href={`${CGR_BASE}/owner`}>
            Go to the owner view
          </a>
        </div>
      </Card>
    );
  }
  const short = err.startsWith("Use at least");
  const nomatch = err.startsWith("The two");
  return (
    <Card state="ready">
      <h1>Set your password</h1>
      <p className="sub">
        For <strong>{stage.email}</strong>. You&rsquo;ll use it to sign in to the owner view.
      </p>
      <form onSubmit={save} noValidate style={{ marginTop: 16 }}>
        {err && !short && !nomatch ? (
          <p className="alert" role="alert">
            {err}
          </p>
        ) : null}
        <label className="f" htmlFor="sp-new">
          New password
        </label>
        <div className="pwrow">
          <input
            id="sp-new"
            className={short ? "pw bad" : "pw"}
            type={show1 ? "text" : "password"}
            autoComplete="new-password"
            minLength={MIN}
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            aria-describedby={short ? "sp-err sp-rules" : "sp-rules"}
            aria-invalid={short || undefined}
          />
          <button type="button" className="btn btn-plain" aria-pressed={show1} onClick={() => setShow1(!show1)}>
            {show1 ? "Hide" : "Show"}
          </button>
        </div>
        {short ? (
          <p id="sp-err" className="ferr" role="alert">
            {err}
          </p>
        ) : null}
        <ul id="sp-rules" className="rules">
          <li>At least {MIN} characters.</li>
          <li>Don&rsquo;t reuse a password from another site.</li>
        </ul>
        <label className="f" htmlFor="sp-again" style={{ marginTop: 16 }}>
          Type it again
        </label>
        <div className="pwrow">
          <input
            id="sp-again"
            className={nomatch ? "pw bad" : "pw"}
            type={show2 ? "text" : "password"}
            autoComplete="new-password"
            required
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            aria-describedby={nomatch ? "sp-err2" : undefined}
            aria-invalid={nomatch || undefined}
          />
          <button type="button" className="btn btn-plain" aria-pressed={show2} onClick={() => setShow2(!show2)}>
            {show2 ? "Hide" : "Show"}
          </button>
        </div>
        {nomatch ? (
          <p id="sp-err2" className="ferr" role="alert">
            {err}
          </p>
        ) : null}
        <div className="acts">
          <button type="submit" className="btn btn-wine" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Saving…" : "Set password"}
          </button>
        </div>
      </form>
    </Card>
  );
}
