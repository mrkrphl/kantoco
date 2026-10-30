/** Booking steps 01 / 02 / 03: outlined numerals, the current one filled hot. */
export function Steps({ current, title, sub }: { current: 1 | 2 | 3; title: string; sub: string }) {
  const names = ["Gown and date", "Your details", "Reference code"];
  return (
    <div className="cgr-steps">
      <ol className="cgr-steps-n ext" aria-label="Steps">
        {names.map((n, i) => (
          <li
            key={n}
            className={i + 1 === current ? "is-on" : undefined}
            aria-current={i + 1 === current ? "step" : undefined}
          >
            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <span className="sr-only">
              Step {i + 1}: {n}
            </span>
          </li>
        ))}
      </ol>
      <div className="cgr-steps-t">
        <p className="cgr-steps-title">{title}</p>
        <p className="mono">{sub}</p>
      </div>
    </div>
  );
}

/** Rate x days, inclusive of both dates. The customer never sees the commission. */
export function rentalDays(start: string, end: string): number | null {
  const ok = /^\d{4}-\d{2}-\d{2}$/;
  if (!ok.test(start) || !ok.test(end) || end < start) return null;
  const ms = new Date(`${end}T12:00:00`).getTime() - new Date(`${start}T12:00:00`).getTime();
  return Math.round(ms / 86400000) + 1;
}
