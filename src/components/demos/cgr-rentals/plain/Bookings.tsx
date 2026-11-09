"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { CGR_BASE } from "@/lib/cgr-rentals";
import {
  FITTING_STATUSES,
  RESERVATION_STATUSES,
  matchesSearch,
  nextReservationLabel,
  nextReservationStatus,
  ownerDay,
  ownerDayTime,
  ownerStamp,
  ownerStatusLabel,
  plural,
  smsHref,
  sortBookings,
  statusTone,
  telHref,
  type SortMode,
} from "@/lib/cgr-owner-format";
import { addonPlain } from "@/components/demos/cgr-rentals/AddonPicker";
import type { AdminCommission, OwnerRow } from "@/lib/cgr-supabase";
import { setHandover, setStatus } from "@/app/demos/cgr-rentals/owner/actions";

/**
 * r8.4b All bookings (design-r8.4b/src/bookings.html): All / Reservations /
 * Fittings, search by customer or gown, sort by date, CSV. Each row opens
 * "Details and changes": contact, reference, notes, status, and the pickup
 * and return days the shop typed in (the rule isn't set yet, D2).
 * The ₱200 commission card shows only for the admin (D1); the numbers come
 * from admin_commission(), which refuses owners.
 */

type Show = "all" | "reserve" | "fitting";

const peso = (n: number) => `₱${n.toLocaleString("en-PH")}`;

function HandoverLine({ label, day }: { label: string; day?: string }) {
  return (
    <div className="pr">
      <b>{label}:</b> {day ? `${ownerDay(day)} · Rule to be set` : "Rule to be set"}
    </div>
  );
}

function Row({ r }: { r: OwnerRow }) {
  const [status, setSt] = useState<string>(r.status);
  const [pick, setPick] = useState(r.pickupOn ?? "");
  const [ret, setRet] = useState(r.returnOn ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, start] = useTransition();
  const id = r.ref.toLowerCase();
  const options = r.kind === "fitting" ? FITTING_STATUSES : RESERVATION_STATUSES;
  return (
    <li data-ref={r.ref} data-kind={r.kind} data-status={r.status}>
      <div className="top">
        <div>
          <div className="n">{r.customerName}</div>
          <div className="g">{r.gownName}</div>
          {r.kind === "reserve" && r.addons?.length ? (
            <div className="addon-line">With {addonPlain(r.addons)}</div>
          ) : null}
        </div>
        <span className={`st ${statusTone(r.status)}`.trim()}>{ownerStatusLabel(r.status)}</span>
      </div>
      <div className="d">
        {r.kind === "fitting"
          ? `Fitting · ${ownerDayTime(r.fittingDate ?? "", r.slot ?? "")}`
          : `Event · ${ownerDay(r.eventDate)}`}
      </div>
      <div className="taps" aria-label="Contact">
        {telHref(r.customerContact) ? (
          <a className="tap wine" href={telHref(r.customerContact)!}>
            Call
          </a>
        ) : null}
        {smsHref(r.customerContact) ? (
          <a className="tap" href={smsHref(r.customerContact)!}>
            Messenger / Text
          </a>
        ) : r.customerContact.toLowerCase().includes("m.me") || r.customerContact.toLowerCase().includes("facebook.com") ? (
          <a className="tap" href={r.customerContact.startsWith("http") ? r.customerContact : `https://${r.customerContact}`} target="_blank" rel="noopener noreferrer">
            Messenger
          </a>
        ) : null}
        {r.kind === "reserve" && nextReservationStatus(status) ? (
          <button
            type="button"
            className="tap wine"
            disabled={busy}
            onClick={() =>
              start(async () => {
                const n = nextReservationStatus(status)!;
                const a = await setStatus(r.kind, r.ref, n);
                if (a.ok) {
                  setSt(n);
                  setMsg({ ok: true, text: `Marked ${nextReservationLabel(status)}.` });
                } else setMsg({ ok: false, text: a.message });
              })
            }
          >
            Mark {nextReservationLabel(status)}
          </button>
        ) : null}
        {r.kind === "reserve" && status !== "cancelled" && status !== "returned" ? (
          <button
            type="button"
            className="tap"
            disabled={busy}
            onClick={() =>
              start(async () => {
                const a = await setStatus(r.kind, r.ref, "cancelled");
                if (a.ok) {
                  setSt("cancelled");
                  setMsg({ ok: true, text: "Cancelled." });
                } else setMsg({ ok: false, text: a.message });
              })
            }
          >
            Cancel
          </button>
        ) : null}
      </div>
      {r.kind === "reserve" ? (
        <>
          <HandoverLine label="Pickup" day={r.pickupOn} />
          <HandoverLine label="Return" day={r.returnOn} />
        </>
      ) : null}
      <details>
        <summary>Details and changes</summary>
        <div className="more">
          <dl>
            <dt>Contact</dt>
            <dd>{r.customerContact || "None given"}</dd>
            <dt>Reference</dt>
            <dd>{r.ref}</dd>
            {r.linkedRef ? (
              <>
                <dt>For reservation</dt>
                <dd>{r.linkedRef}</dd>
              </>
            ) : null}
            <dt>Booked</dt>
            <dd>{ownerStamp(r.createdAt)}</dd>
            <dt>Notes</dt>
            <dd>{r.notes || "None"}</dd>
          </dl>
          <div className="fld">
            <label htmlFor={`st-${id}`}>Status</label>
            <select id={`st-${id}`} className="sel" value={status} onChange={(e) => setSt(e.target.value)}>
              {options.map((o) => (
                <option key={o} value={o}>
                  {ownerStatusLabel(o)}
                </option>
              ))}
            </select>
          </div>
          {r.kind === "reserve" ? (
            <>
              <p className="sub" style={{ marginTop: 12 }}>
                The pickup and return rule isn&rsquo;t set yet. Type the days you agreed with the customer, or leave
                them blank.
              </p>
              <div className="two">
                <div className="fld">
                  <label htmlFor={`pk-${id}`}>Pickup day</label>
                  <input id={`pk-${id}`} type="date" value={pick} onChange={(e) => setPick(e.target.value)} />
                </div>
                <div className="fld">
                  <label htmlFor={`rt-${id}`}>Return day</label>
                  <input id={`rt-${id}`} type="date" value={ret} onChange={(e) => setRet(e.target.value)} />
                </div>
              </div>
            </>
          ) : null}
          <div className="acts" style={{ marginTop: 14 }}>
            <button
              type="button"
              className="btn btn-wine"
              disabled={busy}
              aria-disabled={busy}
              onClick={() =>
                start(async () => {
                  const out: string[] = [];
                  let ok = true;
                  if (status !== r.status) {
                    const a = await setStatus(r.kind, r.ref, status);
                    ok = ok && a.ok;
                    if (!a.ok) out.push(a.message);
                  }
                  if (r.kind === "reserve" && (pick !== (r.pickupOn ?? "") || ret !== (r.returnOn ?? ""))) {
                    const b = await setHandover(r.ref, pick, ret);
                    ok = ok && b.ok;
                    if (!b.ok) out.push(b.message);
                  }
                  setMsg(ok ? { ok, text: `Saved for ${r.customerName}.` } : { ok, text: out.join(" ") });
                })
              }
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
          {msg ? (
            <p className={`msg ${msg.ok ? "ok" : "no"}`} role={msg.ok ? "status" : "alert"}>
              {msg.text}
            </p>
          ) : null}
        </div>
      </details>
    </li>
  );
}

export function Bookings({
  rows,
  today,
  commission,
}: {
  rows: OwnerRow[];
  today: string;
  commission: AdminCommission | null;
}) {
  const [show, setShow] = useState<Show>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortMode>("upcoming");
  const nRes = rows.filter((r) => r.kind === "reserve").length;
  const nFit = rows.length - nRes;
  const list = useMemo(
    () =>
      sortBookings(
        rows.filter((r) => (show === "all" || r.kind === show) && matchesSearch(r, q)),
        sort,
        today,
      ),
    [rows, show, q, sort, today],
  );
  return (
    <>
      <Link className="back" href={`${CGR_BASE}/owner`}>
        ‹ Back to today
      </Link>
      <h1>All bookings</h1>
      <p className="sub">
        {rows.length
          ? `${plural(rows.length, "booking")}: ${plural(nRes, "reservation")} and ${plural(nFit, "fitting")}.`
          : "Reservations and fittings show here."}
      </p>

      {commission ? (
        <section className="sec com" aria-labelledby="h-com" data-admin-only="commission">
          <div className="h">
            <span className="badge">ADMIN ONLY</span>
            <h2 id="h-com" style={{ fontSize: 18 }}>
              Commission
            </h2>
          </div>
          <p>
            {(commission.month ? `Month ${commission.month} (Manila): ` : "")}
            {peso(commission.per_php)} × {plural(commission.count, "site booking")} = {peso(commission.total_php)}.
            Fittings never count.
          </p>
          <p className="sub">Owners never see this line. Export includes source for attribution.</p>
          <div className="acts">
            <a className="btn btn-plain" href={`${CGR_BASE}/owner/export?kind=commission`}>
              Download CSV
            </a>
          </div>
        </section>
      ) : null}

      <section className="sec" aria-label="Bookings">
        <div className="seg" role="group" aria-label="Show">
          {(
            [
              ["all", "All"],
              ["reserve", "Reservations"],
              ["fitting", "Fittings"],
            ] as const
          ).map(([k, w]) => (
            <button key={k} type="button" aria-pressed={show === k} onClick={() => setShow(k)}>
              {w}
            </button>
          ))}
        </div>
        <div className="ctl">
          <div className="fld">
            <label htmlFor="bk-q">Search</label>
            <input
              id="bk-q"
              type="search"
              placeholder="Customer, phone or gown"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="fld" style={{ flex: "0 1 200px" }}>
            <label htmlFor="bk-o">Sort by date</label>
            <select id="bk-o" className="sel" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}>
              <option value="upcoming">Upcoming first</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
        <p className="sr" role="status">
          {rows.length ? `Showing ${plural(list.length, "booking")}.` : ""}
        </p>
        {rows.length === 0 ? (
          <p className="none" style={{ paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            No bookings yet. New reservations and fittings show here.
          </p>
        ) : list.length === 0 ? (
          <div style={{ borderTop: "1px solid var(--line)", padding: "16px 20px 20px" }} data-owner="no-results">
            <p>{q.trim() ? `No bookings match “${q.trim()}”.` : "No bookings of this kind yet."}</p>
            {q.trim() ? (
              <button type="button" className="btn btn-plain" style={{ marginTop: 12 }} onClick={() => setQ("")}>
                Clear search
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="rows bk" style={{ borderTop: "1px solid var(--line)" }}>
            {list.map((r) => (
              <Row key={`${r.kind}-${r.ref}-${r.status}-${r.pickupOn ?? ""}-${r.returnOn ?? ""}`} r={r} />
            ))}
          </ul>
        )}
        {rows.length ? (
          <div className="csv">
            <a className="tbtn" href={`${CGR_BASE}/owner/export`} download>
              Download CSV
            </a>
          </div>
        ) : null}
      </section>
    </>
  );
}
