"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { ownerDay, ownerDayTime, ownerTime, ownerWeek } from "@/lib/cgr-owner-format";
import type { OwnerDashboard } from "@/lib/cgr-supabase";
import { setStatus } from "@/app/demos/cgr-rentals/owner/actions";

/**
 * r8.4b owner home (design-r8.4b/src/owner.html): Today, Coming up, This
 * week, then links. One action per row:
 * - fitting Pending -> Confirm, Confirmed -> Came in (D3, DEFAULT);
 * - pickup -> Picked up; return due today -> Returned (D7, DEFAULT).
 * Pickup and return days are only what the shop typed in; the rule is not
 * set yet (D2), so those rows say "Rule to be set" and nothing is guessed.
 * "This week" = made Mon-Sun, Manila time, cancelled left out (D6).
 */

type Kind = "fitting" | "pickup" | "return";
type TodayRow = { kind: Kind; ref: string; name: string; gown: string | null; status: string; slot?: string };
type Undo = { text: string; ref: string; kind: Kind; prev: string } | null;

const Tick = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.4" />
  </svg>
);

function plan(r: TodayRow, status: string): { label: string; next: string; cls: string; aria: string } | { done: string } | { note: string } {
  if (status === "cancelled") return { note: "Cancelled" };
  if (r.kind === "fitting") {
    if (status === "pending") return { label: "Confirm", next: "confirmed", cls: "btn-wine", aria: `Confirm ${r.name}'s fitting` };
    if (status === "confirmed") return { label: "Came in", next: "came_in", cls: "btn-line", aria: `${r.name} came in` };
    if (status === "came_in") return { done: "Came in" };
    if (status === "no_show") return { note: "No-show" };
    return { note: status };
  }
  if (r.kind === "pickup") {
    if (status === "out" || status === "returned") return { done: "Picked up" };
    return { label: "Picked up", next: "out", cls: "btn-line", aria: `${r.name} picked up` };
  }
  if (status === "returned") return { done: "Returned" };
  if (status === "out") return { label: "Returned", next: "returned", cls: "btn-line", aria: `${r.name} returned` };
  return { note: "Not picked up yet" };
}

export function OwnerHome({ dash }: { dash: OwnerDashboard }) {
  const [over, setOver] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [undo, setUndo] = useState<Undo>(null);
  const [err, setErr] = useState("");
  const [, start] = useTransition();

  const today: TodayRow[] = [
    ...dash.fittings_today.map((f) => ({ kind: "fitting" as const, ...f })),
    ...dash.pickups_today.map((p) => ({ kind: "pickup" as const, ...p })),
    ...(dash.returns_today ?? []).map((p) => ({ kind: "return" as const, ...p })),
  ];
  const statusOf = (r: { ref: string; status: string }) => over[r.ref] ?? r.status;

  const change = (r: TodayRow, next: string, prev: string, say: string | null) => {
    setBusy(r.ref);
    setErr("");
    start(async () => {
      const res = await setStatus(r.kind === "fitting" ? "fitting" : "reserve", r.ref, next);
      setBusy("");
      if (!res.ok) {
        setErr(`Couldn’t save that for ${r.name}. ${res.message}`);
        return;
      }
      setOver((o) => ({ ...o, [r.ref]: next }));
      setUndo(say ? { text: say, ref: r.ref, kind: r.kind, prev } : null);
    });
  };

  const words = (r: TodayRow, next: string) =>
    next === "confirmed"
      ? `${r.name}’s fitting is confirmed.`
      : next === "came_in"
        ? `${r.name} came in.`
        : next === "out"
          ? `${r.name} picked up the gown.`
          : `${r.name} returned the gown.`;

  const wk = dash.this_week;
  const up = dash.next_7_days;
  return (
    <>
      <section className="sec" aria-labelledby="h-today" data-owner="today" style={{ marginTop: 0 }}>
        <header>
          <h1 id="h-today">Today</h1>
          <p className="sub">{ownerDay(dash.today)}</p>
        </header>
        {today.length === 0 ? (
          <p className="none">Nothing booked for today.</p>
        ) : (
          <ul className="rows today">
            {today.map((r) => {
              const st = statusOf(r);
              const p = plan(r, st);
              return (
                <li key={`${r.kind}-${r.ref}`} data-ref={r.ref} data-kind={r.kind} data-status={st}>
                  <span className="t">
                    {r.kind === "fitting" ? (
                      ownerTime(r.slot ?? "")
                    ) : (
                      <>
                        {r.kind === "pickup" ? "Pickup" : "Return"}
                        <span className="rule">Rule to be set</span>
                      </>
                    )}
                  </span>
                  <div className="grow">
                    <div className="n">{r.name}</div>
                    <div className="g">
                      {r.kind === "fitting" ? (r.gown ? `Fitting · ${r.gown}` : "Fitting") : (r.gown ?? "")}
                    </div>
                  </div>
                  {"label" in p ? (
                    <button
                      type="button"
                      className={`btn ${p.cls}`}
                      aria-label={p.aria}
                      disabled={busy === r.ref}
                      aria-disabled={busy === r.ref}
                      onClick={() => change(r, p.next, st, words(r, p.next))}
                    >
                      {busy === r.ref ? "Saving…" : p.label}
                    </button>
                  ) : "done" in p ? (
                    <span className="done" role="status">
                      <Tick />
                      {p.done}
                    </span>
                  ) : (
                    <span className="g">{p.note}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {err ? (
        <p className="alert" role="alert">
          {err}
        </p>
      ) : null}
      {undo ? (
        <p className="toast" role="status">
          <span>{undo.text}</span>
          <button
            type="button"
            className="tbtn"
            onClick={() => {
              const r = today.find((x) => x.ref === undo.ref && x.kind === undo.kind);
              if (r) change(r, undo.prev, statusOf(r), null);
            }}
          >
            Undo
          </button>
        </p>
      ) : null}

      <section className="sec" aria-labelledby="h-up" data-owner="coming-up">
        <header>
          <h2 id="h-up">Coming up</h2>
          <p className="sub">Next 7 days</p>
        </header>
        {up.length === 0 ? (
          <p className="none">Nothing in the next 7 days yet.</p>
        ) : (
          <ul className="rows up">
            {up.map((u) => (
              <li key={`${u.kind}-${u.ref}`} data-ref={u.ref}>
                <div className="grow">
                  <div className="n">{u.name}</div>
                  <div>
                    {u.kind === "fitting"
                      ? `Fitting · ${ownerDayTime(u.day, u.slot ?? "")}`
                      : `${u.kind === "pickup" ? "Pickup" : "Return"} · ${ownerDay(u.day)} · Rule to be set`}
                  </div>
                  {u.gown ? <div className="g">{u.gown}</div> : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="sec" aria-labelledby="h-wk" data-owner="this-week">
        <header>
          <h2 id="h-wk">This week</h2>
          <p className="sub">Bookings made {ownerWeek(dash.week_start, dash.week_end)}</p>
        </header>
        {wk.reservations === 0 && wk.fittings === 0 ? (
          <p className="none">No reservations or fittings yet this week.</p>
        ) : (
          <ul className="rows nums">
            <li>
              <span className="big">{wk.reservations}</span>
              <span>{wk.reservations === 1 ? "reservation made this week" : "reservations made this week"}</span>
            </li>
            <li>
              <span className="big">{wk.fittings}</span>
              <span>{wk.fittings === 1 ? "fitting booked this week" : "fittings booked this week"}</span>
            </li>
          </ul>
        )}
      </section>

      <nav className="sec links" aria-label="More">
        <Link href={`${CGR_BASE}/owner/bookings`}>
          All bookings <span aria-hidden="true">›</span>
        </Link>
        <Link href={`${CGR_BASE}/owner/times`}>
          Fitting times <span aria-hidden="true">›</span>
        </Link>
      </nav>
    </>
  );
}
