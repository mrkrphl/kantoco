"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

/**
 * Phone header: a "Menu" button opens a full-width black panel with the
 * section links (overlay, so nothing below shifts). Escape closes it.
 */
export function MobileMenu({
  items,
}: {
  items: { label: string; href: string; on: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="cgr-menu">
      <button
        type="button"
        className="cgr-menu-btn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav
        id={id}
        className="cgr-menu-panel"
        aria-label="Sections"
        data-open={open ? "true" : "false"}
        hidden={!open}
      >
        <ul>
          {items.map((it) => (
            <li key={it.label}>
              <Link
                href={it.href}
                className="cgr-menu-a"
                aria-current={it.on ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
