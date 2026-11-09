"use client";

import { useEffect, useRef, useState } from "react";
import { humanDate } from "@/components/demos/cgr-rentals/reserveMath";

const HEAD = ["S", "M", "T", "W", "T", "F", "S"];
const HEAD_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CELLS = 42; // six rows always: the grid never changes height (CLS 0)

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

type Ym = { y: number; m: number };
const ymOf = (d: string): Ym | null => {
  const r = /^(\d{4})-(\d{2})-\d{2}$/.exec(d);
  return r ? { y: Number(r[1]), m: Number(r[2]) - 1 } : null;
};
const shift = ({ y, m }: Ym, k: number): Ym => {
  const t = y * 12 + m + k;
  return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 };
};
const ymKey = (v: Ym) => v.y * 12 + v.m;

function addDays(d: string, k: number): string {
  const t = new Date(`${d}T12:00:00`);
  t.setDate(t.getDate() + k);
  return iso(t.getFullYear(), t.getMonth(), t.getDate());
}

export type DayKind = "open" | "booked" | "off";

/**
 * r7.11 calendar (Design r7.11 kit.css .cal): month and two 44px arrows,
 * seven columns, 42 cells. Struck-out days are taken, faded days are past
 * (or not allowed here); both stay focusable with aria-disabled so a tap
 * can say why. Arrow keys move a day or a week (crossing months), Home/End
 * go to the week's ends, PageUp/PageDown change month. Months before
 * today's are not shown.
 */
export function Calendar({
  value,
  today,
  kindOf,
  onPick,
  label,
  offLabel = "past",
}: {
  value: string;
  today: string | null;
  kindOf: (d: string) => DayKind;
  onPick: (d: string) => void;
  label: string;
  offLabel?: string;
}) {
  const [view, setView] = useState<Ym | null>(null);
  const [focusDay, setFocusDay] = useState<string>("");
  const want = useRef<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const shown: Ym | null = view ?? ymOf(value) ?? (today ? ymOf(today) : null);
  const min: Ym | null = today ? ymOf(today) : null;

  useEffect(() => {
    if (!want.current || !gridRef.current) return;
    const el = gridRef.current.querySelector<HTMLButtonElement>(`[data-day="${want.current}"]`);
    want.current = null;
    el?.focus();
  });

  if (!shown) {
    return (
      <div className="r11-cal" aria-busy="true">
        <div className="r11-cal-top">
          <p className="r11-cal-month">&nbsp;</p>
          <div className="r11-cal-nav">
            <span className="r11-arr" aria-hidden="true" />
            <span className="r11-arr" aria-hidden="true" />
          </div>
        </div>
        <div className="r11-cal-grid">
          {HEAD.map((h, i) => (
            <span key={i} className="r11-cal-h" aria-hidden="true">
              {h}
            </span>
          ))}
          {Array.from({ length: CELLS }, (_, i) => (
            <span key={i} className="r11-d pad" />
          ))}
        </div>
      </div>
    );
  }

  const lead = new Date(shown.y, shown.m, 1).getDay();
  const count = new Date(shown.y, shown.m + 1, 0).getDate();
  const inView = (d: string) => {
    const v = ymOf(d);
    return !!v && ymKey(v) === ymKey(shown);
  };
  const tabDay =
    (focusDay && inView(focusDay) && focusDay) ||
    (value && inView(value) && value) ||
    (today && inView(today) && today) ||
    iso(shown.y, shown.m, 1);
  const canPrev = !min || ymKey(shown) > ymKey(min);

  const moveTo = (d: string) => {
    const v = ymOf(d)!;
    if (min && ymKey(v) < ymKey(min)) return;
    if (!inView(d)) setView(v);
    setFocusDay(d);
    want.current = d;
  };

  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, d: string) => {
    const dow = new Date(`${d}T12:00:00`).getDay();
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -dow, End: 6 - dow };
    if (e.key in map) {
      e.preventDefault();
      moveTo(addDays(d, map[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      const t = new Date(`${d}T12:00:00`);
      t.setMonth(t.getMonth() + (e.key === "PageUp" ? -1 : 1));
      moveTo(iso(t.getFullYear(), t.getMonth(), Math.min(t.getDate(), new Date(`${d}T12:00:00`).getDate())));
    }
  };

  const title = `${MONTH[shown.m]} ${shown.y}`;
  return (
    <div className="r11-cal">
      <div className="r11-cal-top">
        <p className="r11-cal-month" aria-live="polite">
          {title}
        </p>
        <div className="r11-cal-nav">
          <button
            type="button"
            className="r11-arr"
            aria-label="Previous month"
            disabled={!canPrev}
            onClick={() => setView(shift(shown, -1))}
          >
            ←
          </button>
          <button type="button" className="r11-arr" aria-label="Next month" onClick={() => setView(shift(shown, 1))}>
            →
          </button>
        </div>
      </div>
      <div ref={gridRef} className="r11-cal-grid" role="group" aria-label={`${label}, ${title}`}>
        {HEAD.map((h, i) => (
          <abbr key={i} className="r11-cal-h" title={HEAD_LONG[i]} aria-hidden="true" style={{ textDecoration: "none" }}>
            {h}
          </abbr>
        ))}
        {Array.from({ length: CELLS }, (_, i) => {
          const n = i - lead + 1;
          if (n < 1 || n > count) return <span key={i} className="r11-d pad" />;
          const d = iso(shown.y, shown.m, n);
          const k = kindOf(d);
          const on = d === value;
          const why = k === "booked" ? ", reserved" : k === "off" ? `, ${offLabel}` : "";
          return (
            <button
              key={i}
              type="button"
              data-day={d}
              className={`r11-d${k === "booked" ? " bk" : ""}${k === "off" ? " off" : ""}`}
              aria-pressed={on}
              aria-disabled={k !== "open" ? true : undefined}
              aria-label={`${humanDate(d)}${why}${d === today ? ", today" : ""}`}
              tabIndex={d === tabDay ? 0 : -1}
              onKeyDown={(e) => onKey(e, d)}
              onFocus={() => setFocusDay(d)}
              onClick={() => onPick(d)}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
