"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  SAMPLE_GOWNS,
  SAMPLE_LABEL,
  WEEK_DAYS,
} from "@/lib/cgr-gowns";

/** Shared bottom sheet / centred dialog. Esc and backdrop close it. */
function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="cg-sheet-wrap">
      <div className="cg-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="cg-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="cg-sheet-top">
          <p className="cg-sample-pill">SAMPLE · not connected</p>
          <button
            ref={closeRef}
            type="button"
            className="cg-btn cg-btn-small"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <h2 id={titleId} className="cg-sheet-title">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export function MessengerSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Message CGR on Messenger" onClose={onClose}>
      <p className="cg-sheet-lede">
        On the live site, this button opens CGR&apos;s Messenger chat with the
        gown and date already typed in. This sample isn&apos;t connected to
        any page, so nothing opens and nothing is sent.
      </p>
      <div className="cg-chat" aria-label="Example message (sample)">
        <p className="cg-chat-bubble">
          Hi! Is the Crimson ball gown free this Saturday? I tried the teal
          tiara on the site too.
        </p>
        <p className="cg-chat-note">Example message · sample only</p>
      </div>
      <button type="button" className="cg-btn cg-btn-primary cg-btn-wide" onClick={onClose}>
        OK, got it
      </button>
    </Sheet>
  );
}

export function ReserveSheet({
  onClose,
  initialGown,
}: {
  onClose: () => void;
  initialGown?: string;
}) {
  const [gownId, setGownId] = useState(initialGown ?? SAMPLE_GOWNS[0].id);
  const [day, setDay] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const gown = SAMPLE_GOWNS.find((g) => g.id === gownId) ?? SAMPLE_GOWNS[0];

  return (
    <Sheet title="Reserve a gown" onClose={onClose}>
      {done ? (
        <div className="cg-done" role="status">
          <p className="cg-done-title">Sample only: nothing was sent.</p>
          <p>
            On the live site this would hold the {gown.name} for{" "}
            {day !== null ? WEEK_DAYS[day] : "that day"} and send CGR your
            request. This sample has no booking system behind it.
          </p>
          <button type="button" className="cg-btn cg-btn-primary cg-btn-wide" onClick={onClose}>
            Close
          </button>
        </div>
      ) : (
        <form
          className="cg-form"
          noValidate
          onSubmit={(e) => {
            // Sample: never submits anywhere. No action, no fetch.
            e.preventDefault();
            if (day !== null) setDone(true);
          }}
        >
          <fieldset className="cg-fieldset">
            <legend>Gown</legend>
            <div className="cg-gown-pick">
              {SAMPLE_GOWNS.map((g) => (
                <label key={g.id} className="cg-radio">
                  <input
                    type="radio"
                    name="gown"
                    value={g.id}
                    checked={g.id === gownId}
                    onChange={() => {
                      setGownId(g.id);
                      setDay(null);
                    }}
                  />
                  <span className="cg-swatch" style={{ background: g.color }} />
                  <span>{g.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="cg-fieldset">
            <legend>
              This week <span className="cg-sample-tag">{SAMPLE_LABEL}</span>
            </legend>
            <div className="cg-days">
              {WEEK_DAYS.map((d, i) => {
                const free = gown.week[i];
                return (
                  <label
                    key={d}
                    className={`cg-day${free ? "" : " is-booked"}`}
                  >
                    <input
                      type="radio"
                      name="day"
                      value={d}
                      disabled={!free}
                      checked={day === i}
                      onChange={() => setDay(i)}
                    />
                    <span className="cg-day-name">{d}</span>
                    <span className="cg-day-state">{free ? "Free" : "Booked"}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <button
            type="submit"
            className="cg-btn cg-btn-primary cg-btn-wide"
            disabled={day === null}
          >
            {day === null ? "Pick a free day" : `Reserve for ${WEEK_DAYS[day]} (sample)`}
          </button>
          <p className="cg-form-note">
            Sample form. It doesn&apos;t send anything and asks for no personal
            details.
          </p>
        </form>
      )}
    </Sheet>
  );
}
