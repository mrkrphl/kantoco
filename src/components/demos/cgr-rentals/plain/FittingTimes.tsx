"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { ownerTime, plural } from "@/lib/cgr-owner-format";
import type { OwnerSlot } from "@/lib/cgr-supabase";
import { saveSlot } from "@/app/demos/cgr-rentals/owner/actions";

/** r8.4b: the fitting times customers can pick (Mark's pick 3: owners edit them). Plain style. */

function SlotRow({ s }: { s: OwnerSlot }) {
  const [time, setTime] = useState(s.slot);
  const [shown, setShown] = useState(s.active);
  const [msg, setMsg] = useState("");
  const [busy, start] = useTransition();
  const dirty = time !== s.slot || shown !== s.active;
  const id = `slot-${s.slot.replace(":", "")}`;
  return (
    <li data-slot={s.slot} data-active={s.active}>
      <div className="tm">
        <label className="sr" htmlFor={id}>
          Time, now {ownerTime(s.slot)}
        </label>
        <input id={id} type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <label className="chk grow">
        <input type="checkbox" checked={shown} onChange={(e) => setShown(e.target.checked)} />
        Customers can pick it
      </label>
      <button
        type="button"
        className="btn btn-line"
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
        <p className="ferr" role="alert" style={{ width: "100%" }}>
          {msg}
        </p>
      ) : null}
    </li>
  );
}

export function FittingTimes({ slots }: { slots: OwnerSlot[] }) {
  const [add, setAdd] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, start] = useTransition();
  const shown = slots.filter((s) => s.active);
  return (
    <>
      <Link className="back" href={`${CGR_BASE}/owner`}>
        ‹ Back to today
      </Link>
      <h1>Fitting times</h1>
      <p className="sub">
        {shown.length === 0
          ? "No fitting times are shown to customers yet."
          : `Customers can pick from ${plural(shown.length, "time")}: ${shown.map((s) => ownerTime(s.slot)).join(", ")}.`}
      </p>
      <section className="sec" aria-label="Fitting times">
        {slots.length === 0 ? (
          <p className="none" style={{ paddingTop: 16 }}>
            No fitting times yet. Add the first one below.
          </p>
        ) : (
          <ul className="rows slots">
            {slots.map((s) => (
              <SlotRow key={`${s.slot}-${s.active}`} s={s} />
            ))}
          </ul>
        )}
        <div className="addrow">
          <div className="fld">
            <label htmlFor="slot-new">Add a time</label>
            <input id="slot-new" type="time" step={900} value={add} onChange={(e) => setAdd(e.target.value)} />
          </div>
          <button
            type="button"
            className="btn btn-wine"
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
            <p className="ferr" role="alert" style={{ width: "100%" }}>
              {msg}
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
