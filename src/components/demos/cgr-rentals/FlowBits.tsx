"use client";

import { useEffect, useRef } from "react";
import type { Gown } from "@/lib/cgr-rentals";
import { GownImg } from "@/components/demos/cgr-rentals/GownImg";

/** "01 Date · 02 Details · 03 Done" with aria-current on the live step. */
export function Steps({ labels, at, label }: { labels: string[]; at: number; label: string }) {
  return (
    <ol className="r11-steps" aria-label={label}>
      {labels.map((l, i) => (
        <li key={l} aria-current={i === at ? "step" : undefined}>
          {String(i + 1).padStart(2, "0")} {l}
        </li>
      ))}
    </ol>
  );
}

/**
 * Moves focus to the step's h1 (tabIndex -1) and names the tab when the
 * step or state changes; skipped on first paint so a fresh page keeps the
 * browser's own focus start.
 */
export function useStepFocus(key: string, title: string) {
  const ref = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);
  useEffect(() => {
    document.title = `${title} · Cavite Gown Rentals`;
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.focus();
  }, [key, title]);
  return ref;
}

/** The sticky summary at 1366, a compact row above the h1 at 390. */
export function Side({
  gown,
  rows,
  mob,
  note,
}: {
  gown: Gown;
  rows: [string, string][];
  mob: string;
  note?: string;
}) {
  return (
    <aside className="r11-side" aria-label="Summary">
      <figure className="r11-mat">
        <GownImg img={gown.images[0]} alt="" decoding="async" />
      </figure>
      <div>
        <p className="nm">{gown.name}</p>
        <p className="mob">{mob}</p>
      </div>
      {rows.length ? (
        <dl>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {note ? <p className="r11-note">{note}</p> : null}
    </aside>
  );
}
