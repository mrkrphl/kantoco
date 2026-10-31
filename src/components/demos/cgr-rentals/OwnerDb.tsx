"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  CGR_BASE,
  COMMISSION_PHP,
  STATUS_LABEL,
  STATUS_OPTIONS,
  formatPhp,
  type BookingStatus,
} from "@/lib/cgr-rentals";
import type { OwnerRow, OwnerSlot } from "@/lib/cgr-supabase";
import { saveSlot, setStatus } from "@/app/demos/cgr-rentals/owner/actions";
import { SignOutButton } from "@/components/demos/cgr-rentals/OwnerAuth";
import {
  humanDate,
  isFitting,
  rangeLabel,
  recordsCommission,
  slotLabel,
  sortRecords,
} from "@/components/demos/cgr-rentals/reserveMath";

type Filter = "all" | "reserve" | "fitting";

function when(b: OwnerRow): string {
  return isFitting(b)
    ? `${humanDate(b.fittingDate ?? "")}, ${slotLabel(b.slot ?? "")}`
    : rangeLabel(b.eventDate, b.returnDate || b.eventDate);
}

/**
 * r8.3: the signed-in owner view, read from Supabase on the server (RLS:
 * owners only). Same layout as the device-only view: chips, a table at 1366
 * and cards at 390, a status select per row. Each change goes through a
 * server action that checks the owner again. The ₱200 commission line
 * counts reservations that are confirmed, out or returned; fittings never.
 */
export function OwnerDb({ email, rows, slots }: { email: string; rows: OwnerRow[]; slots: OwnerSlot[] }) {
  const [local, setLocal] = useState(rows);
  const [filter, setFilter] = useState<Filter>("all");
  const [note, setNote] = useState("");
  const [, start] = useTransition();
  useEffect(() => setLocal(rows), [rows]);

  const all = sortRecords(local);
  const fits = all.filter(isFitting);
  const resv = all.filter((b) => !isFitting(b));
  const list = filter === "all" ? all : filter === "fitting" ? fits : resv;
  const total = recordsCommission(all, COMMISSION_PHP);
  const chips: [Filter, string, number][] = [
    ["all", "All", all.length],
    ["reserve", "Reservations", resv.length],
    ["fitting", "Fittings", fits.length],
  ];

  function change(b: OwnerRow, status: BookingStatus) {
    const before = b.status;
    setLocal((xs) => xs.map((x) => (x.ref === b.ref ? { ...x, status } : x)));
    setNote(`Saving ${b.ref}…`);
    start(async () => {
      const r = await setStatus(b.kind, b.ref, status);
      if (!r.ok) setLocal((xs) => xs.map((x) => (x.ref === b.ref ? { ...x, status: before } : x)));
      setNote(r.ok ? `${b.ref} is now ${STATUS_LABEL[status]}.` : r.message);
    });
  }

  const select = (b: OwnerRow) => (
    <select aria-label={`Status for ${b.ref}`} value={b.status} onChange={(e) => change(b, e.target.value as BookingStatus)}>
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );

  return (
    <section className="r11-rec" aria-labelledby="rec-h" data-owner="owner">
      <p className="r11-kick">Owner view</p>
      <h1 id="rec-h">Bookings</h1>
      <p className="r11-sub" style={{ marginTop: 0 }}>
        Reservations and fittings from the shop&rsquo;s bookings database, soonest first.
      </p>
      <div className="own-bar">
        <span className="s2">
          Signed in as <strong>{email}</strong>
        </span>
        <a className="r11-link" href={`${CGR_BASE}/owner/export`} download>
          Download CSV
        </a>
        <SignOutButton />
      </div>

      <div className="r11-chips" role="group" aria-label="Show">
        {chips.map(([id, label, n]) => (
          <button key={id} type="button" className="r11-chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {label} <span className="n">{n}</span>
          </button>
        ))}
      </div>

      <p className="own-live" role="status" aria-live="polite">
        {note}
      </p>

      {list.length === 0 ? (
        <div className="r11-empty">
          <p>No bookings yet.</p>
          <Link className="r11-link" href={`${CGR_BASE}#rail`}>
            See the gowns
          </Link>
        </div>
      ) : (
        <>
          <table className="r11-table">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Type</th>
                <th scope="col">Gown</th>
                <th scope="col">Client</th>
                <th scope="col">Ref</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b.ref} data-ref={b.ref} data-kind={b.kind}>
                  <td className="d">{when(b)}</td>
                  <td>
                    <span className={isFitting(b) ? "r11-tag fit" : "r11-tag"}>{isFitting(b) ? "Fitting" : "Reserve"}</span>
                  </td>
                  <td>
                    {b.gownName || "No gown yet"}
                    {isFitting(b) && b.linkedRef ? <div className="s2">For {b.linkedRef}</div> : null}
                  </td>
                  <td>
                    {b.customerName}
                    <div className="s2">{b.customerContact}</div>
                    {b.notes ? <div className="s2">{b.notes}</div> : null}
                  </td>
                  <td>
                    <code>{b.ref}</code>
                  </td>
                  <td>{select(b)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="r11-cards">
            {list.map((b) => (
              <li key={b.ref} className="r11-card2" data-ref={b.ref}>
                <div className="top">
                  <span className={isFitting(b) ? "r11-tag fit" : "r11-tag"}>{isFitting(b) ? "Fitting" : "Reserve"}</span>
                  <code>{b.ref}</code>
                </div>
                <p className="d">{when(b)}</p>
                <p>
                  {b.gownName || "No gown yet"}
                  {isFitting(b) && b.linkedRef ? ` · for ${b.linkedRef}` : ""}
                </p>
                <p className="s2">
                  {b.customerName} · {b.customerContact}
                </p>
                {b.notes ? <p className="s2">{b.notes}</p> : null}
                {select(b)}
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="r11-note" style={{ marginTop: 24 }} data-commission={total}>
        Commission: {formatPhp(COMMISSION_PHP)} per confirmed, out or returned reservation. Fittings never count. Total{" "}
        {formatPhp(total)}.
      </p>

      <FittingTimes slots={slots} />
    </section>
  );
}

function SlotRow({ s }: { s: OwnerSlot }) {
  const [time, setTime] = useState(s.slot);
  const [shown, setShown] = useState(s.active);
  const [msg, setMsg] = useState("");
  const [busy, start] = useTransition();
  const dirty = time !== s.slot || shown !== s.active;
  const id = `own-slot-${s.slot.replace(":", "")}`;
  return (
    <li className="own-slot" data-slot={s.slot} data-active={s.active}>
      <div className="r11-field">
        <label htmlFor={id}>Time</label>
        <input id={id} type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <button
        type="button"
        className="r11-chip own-shown"
        aria-pressed={shown}
        aria-label={`Show ${slotLabel(s.slot)} to customers`}
        onClick={() => setShown((v) => !v)}
      >
        {shown ? "Shown to customers" : "Hidden from customers"}
      </button>
      <button
        type="button"
        className="r11-btn r11-wine own-save"
        disabled={!dirty || busy}
        aria-disabled={!dirty || busy}
        onClick={() =>
          start(async () => {
            const r = await saveSlot(s.slot, time, shown);
            setMsg(r.ok ? "" : r.message);
          })
        }
      >
        {busy ? "Saving…" : "Save"}
      </button>
      {msg ? (
        <p className="msg" role="alert">
          {msg}
        </p>
      ) : null}
    </li>
  );
}

function FittingTimes({ slots }: { slots: OwnerSlot[] }) {
  const [add, setAdd] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, start] = useTransition();
  return (
    <section className="own-times" aria-labelledby="own-times-h">
      <h2 id="own-times-h">Fitting times</h2>
      <p className="s2">
        Customers pick from the times shown here, {slots.filter((s) => s.active).map((s) => slotLabel(s.slot)).join(", ") || "none yet"}.
      </p>
      <ul className="own-slots">
        {slots.map((s) => (
          <SlotRow key={`${s.slot}-${s.active}`} s={s} />
        ))}
      </ul>
      <div className="own-slot own-add">
        <div className="r11-field">
          <label htmlFor="own-slot-new">Add a time</label>
          <input id="own-slot-new" type="time" step={900} value={add} onChange={(e) => setAdd(e.target.value)} />
        </div>
        <button
          type="button"
          className="r11-btn r11-wine own-save"
          disabled={!add || busy}
          aria-disabled={!add || busy}
          onClick={() =>
            start(async () => {
              const r = await saveSlot(null, add, true);
              setMsg(r.ok ? "" : r.message);
              if (r.ok) setAdd("");
            })
          }
        >
          {busy ? "Adding…" : "Add time"}
        </button>
        {msg ? (
          <p className="msg" role="alert">
            {msg}
          </p>
        ) : null}
      </div>
    </section>
  );
}
