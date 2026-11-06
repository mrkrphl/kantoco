"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { AdminOwner } from "@/lib/cgr-supabase";
import { plural } from "@/lib/cgr-owner-format";
import {
  inviteOwner,
  removeOwner,
  sendInvite,
  setOwnerRole,
  setOwnerStatus,
  type AdminResult,
} from "@/app/demos/cgr-rentals/admin/actions";

type Note = { text: string; ok: boolean; undo?: { email: string; status: "active" | "paused" } } | null;
type Shown = "active" | "invited" | "paused" | "none";

/** Active = has a login; Invited = an invite went out, no password yet; none = not invited yet. */
function shown(o: AdminOwner): Shown {
  if (o.status === "paused") return "paused";
  if (o.has_login) return "active";
  return o.invited_at ? "invited" : "none";
}
const WORD: Record<Shown, string> = { active: "Active", invited: "Invited", paused: "Paused", none: "Not invited yet" };
const ICON: Record<Shown, string> = { active: "✓", invited: "✉", paused: "❚❚", none: "" };

/**
 * r8.4b admin (design-r8.4b Screen 2): the owners list, invites (D9, real
 * email via invite-owner), pause with Undo, change role, remove (asks first).
 * Every change runs a server action and the database has the last word.
 */
export function AdminPanel({ owners }: { owners: AdminOwner[] }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [sent, inviteAction, inviting] = useActionState<AdminResult | null, FormData>(async (prev, fd) => {
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    setTyped(email);
    const r = await inviteOwner(prev, fd);
    if (r.ok) {
      setOpen(false);
      setFresh(email);
    }
    setNote({ text: r.message, ok: r.ok });
    return r;
  }, null);
  const [busy, start] = useTransition();
  const [removing, setRemoving] = useState<string | null>(null);
  const [roleFor, setRoleFor] = useState<AdminOwner | null>(null);
  const rmDlg = useRef<HTMLDialogElement>(null);
  const roleDlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (removing) rmDlg.current?.showModal();
    else rmDlg.current?.close();
  }, [removing]);
  useEffect(() => {
    if (roleFor) roleDlg.current?.showModal();
    else roleDlg.current?.close();
  }, [roleFor]);

  const run = (fn: () => Promise<AdminResult>, undo?: NonNullable<Note>["undo"]) =>
    start(async () => {
      const r = await fn();
      setNote({ text: r.message, ok: r.ok, undo: r.ok ? undo : undefined });
    });

  const counts = { active: 0, invited: 0, paused: 0, none: 0 } as Record<Shown, number>;
  for (const o of owners) counts[shown(o)]++;
  const others = owners.filter((o) => !o.is_you);
  const bad = sent && !sent.ok && sent.field === "email";

  return (
    <div data-admin="list" data-count={owners.length}>
      <div className="hd">
        <div>
          <h1>Owners</h1>
          <p className="sub">People who can sign in to the owner view.</p>
        </div>
        {!open ? (
          <button type="button" className="btn btn-wine" onClick={() => setOpen(true)} data-admin="invite-open">
            Invite an owner
          </button>
        ) : null}
      </div>

      <div role="status" aria-live="polite">
        {note ? (
          <p className={note.ok ? "toast" : "alert"} data-note={note.ok ? "ok" : "error"} data-admin={sent?.invited && note.ok ? "sent" : undefined}>
            {note.text}
            {note.undo ? (
              <button
                type="button"
                className="tbtn"
                disabled={busy}
                onClick={() => run(() => setOwnerStatus(note.undo!.email, note.undo!.status))}
              >
                Undo
              </button>
            ) : null}
          </p>
        ) : null}
      </div>

      {open ? (
        <section className="sec" aria-labelledby="inv-h" data-admin="invite">
          <header>
            <h2 id="inv-h">Invite an owner</h2>
          </header>
          <form
            className="form"
            action={inviteAction}
            noValidate
          >
            {sent && !sent.ok && !bad ? (
              <p className="alert" role="alert">
                {sent.message}
              </p>
            ) : null}
            <label className="f" htmlFor="inv-email">
              Email
            </label>
            <input
              id="inv-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="off"
              required
              defaultValue={bad ? typed : ""}
              className={bad ? "bad" : undefined}
              aria-invalid={bad || undefined}
              aria-describedby={bad ? "inv-err" : undefined}
            />
            {bad ? (
              <p id="inv-err" className="ferr" role="alert">
                {sent!.message === "Couldn't send the invite. Check the email and try again."
                  ? "Couldn't send the invite. Check the email and try again. Enter a full email, like name@example.com."
                  : sent!.message}
              </p>
            ) : null}
            <fieldset>
              <legend>Role</legend>
              <label className="radio">
                <input type="radio" name="role" value="owner" defaultChecked />
                <span>
                  Owner<small>Sees today, coming up and all bookings. Can update a booking.</small>
                </span>
              </label>
              <label className="radio">
                <input type="radio" name="role" value="admin" />
                <span>
                  Admin<small>Everything an owner can do, plus this page.</small>
                </span>
              </label>
            </fieldset>
            <p className="sub" style={{ marginTop: 8 }}>
              They get an email with a link to set their own password. You never see or set it.
            </p>
            <div className="acts">
              <button type="submit" className="btn btn-wine" disabled={inviting}>
                {inviting ? "Sending…" : "Send invite"}
              </button>
              <button type="button" className="btn btn-plain" onClick={() => setOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="sec" aria-labelledby="ppl-h">
        <header>
          <h2 id="ppl-h">{plural(owners.length, "person", "people")}</h2>
          <p className="sub">
            {[
              `${counts.active} active`,
              `${counts.invited} invited`,
              `${counts.paused} paused`,
              ...(counts.none ? [`${counts.none} not invited yet`] : []),
            ].join(" · ")}
          </p>
        </header>
        {others.length === 0 ? (
          <p className="none" data-admin-empty="only-you">
            No other owners yet. Invite someone to help with bookings.
          </p>
        ) : null}
        <ul className="rows own" aria-label="People who can sign in to the owner view">
          {owners.map((o) => {
            const st = shown(o);
            return (
              <li
                key={o.email}
                className={fresh === o.email ? "new" : undefined}
                data-email={o.email}
                data-status={st}
                data-role={o.role}
              >
                <div className="grow">
                  <p className="em">
                    {o.email.includes("@") ? (
                      <>
                        <span>{o.email.slice(0, o.email.indexOf("@") + 1)}</span>
                        <wbr />
                        <span>{o.email.slice(o.email.indexOf("@") + 1)}</span>
                      </>
                    ) : (
                      o.email
                    )}
                  </p>
                  <p className="role">
                    {o.role === "admin" ? "Admin" : "Owner"}
                    {o.is_you ? " · You" : ""}
                  </p>
                </div>
                <span className={`chip ${st}`}>
                  {ICON[st] ? <span aria-hidden="true">{ICON[st]}</span> : null}
                  {WORD[st]}
                </span>
                {o.is_you ? (
                  <p className="mine">You can&rsquo;t pause or remove yourself.</p>
                ) : (
                  <div className="ac">
                    {st === "invited" || st === "none" ? (
                      <button type="button" className="tbtn" disabled={busy} onClick={() => run(() => sendInvite(o.email))}>
                        {st === "invited" ? "Resend invite" : "Send invite"}
                      </button>
                    ) : st === "active" ? (
                      <button
                        type="button"
                        className="tbtn"
                        disabled={busy}
                        onClick={() =>
                          run(() => setOwnerStatus(o.email, "paused"), { email: o.email, status: "active" })
                        }
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="tbtn"
                        disabled={busy}
                        onClick={() =>
                          run(() => setOwnerStatus(o.email, "active"), { email: o.email, status: "paused" })
                        }
                      >
                        Resume
                      </button>
                    )}
                    <button type="button" className="tbtn" disabled={busy} onClick={() => setRoleFor(o)}>
                      Change role
                    </button>
                    <button type="button" className="tbtn red" disabled={busy} onClick={() => setRemoving(o.email)}>
                      Remove
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <p className="sub" style={{ marginTop: 16 }}>
        Removing an owner stops their access. Their bookings stay.
      </p>

      <dialog ref={rmDlg} className="dlg" role="alertdialog" onClose={() => setRemoving(null)} aria-labelledby="rm-h">
        <h2 id="rm-h">Remove {removing}?</h2>
        <p>They lose access to the owner view straight away. Bookings stay. You can invite them again later.</p>
        <div className="acts">
          <button type="button" className="btn btn-plain" onClick={() => setRemoving(null)}>
            Keep
          </button>
          <button
            type="button"
            className="btn btn-red"
            disabled={busy}
            onClick={() => {
              const who = removing;
              setRemoving(null);
              if (who) run(() => removeOwner(who));
            }}
          >
            Remove
          </button>
        </div>
      </dialog>

      <dialog ref={roleDlg} className="dlg" onClose={() => setRoleFor(null)} aria-labelledby="role-h">
        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            const who = roleFor;
            const role = (new FormData(e.currentTarget).get("nr") as "owner" | "admin") ?? "owner";
            setRoleFor(null);
            if (who && role !== who.role) run(() => setOwnerRole(who.email, role));
          }}
        >
          <h2 id="role-h">Change role</h2>
          <p>{roleFor?.email}</p>
          <fieldset>
            <legend className="sr">Role</legend>
            <label className="radio">
              <input type="radio" name="nr" value="owner" defaultChecked={roleFor?.role !== "admin"} key={`o${roleFor?.email}`} />
              <span>
                Owner<small>Sees today, coming up and all bookings. Can update a booking.</small>
              </span>
            </label>
            <label className="radio">
              <input type="radio" name="nr" value="admin" defaultChecked={roleFor?.role === "admin"} key={`a${roleFor?.email}`} />
              <span>
                Admin<small>Everything an owner can do, plus this page.</small>
              </span>
            </label>
          </fieldset>
          <div className="acts">
            <button type="button" className="btn btn-plain" onClick={() => setRoleFor(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-wine">
              Save role
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
