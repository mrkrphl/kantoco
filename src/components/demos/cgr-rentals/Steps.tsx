/**
 * r7.7 reserve progress (Design r7.7 spec §2): a big italic numeral row
 * (decorative, aria-hidden), a 2px progress line, then the step question as
 * the page h1 (tabindex -1, focused on each step change).
 */
export { rentalDays } from "./reserveMath";

export function StepHead({
  n,
  complete = false,
  title,
  sub,
  headRef,
}: {
  n: 1 | 2 | 3;
  complete?: boolean;
  title: React.ReactNode;
  sub?: React.ReactNode;
  headRef?: React.Ref<HTMLHeadingElement>;
}) {
  const pct = complete ? 100 : (n / 3) * 100;
  return (
    <div className="cgr-steps">
      <ol className="cgr-steps-n" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <li key={i} className={complete ? (i === 3 ? "is-on" : "is-done") : i === n ? "is-on" : i < n ? "is-done" : undefined}>
            0{i}
          </li>
        ))}
      </ol>
      <div
        className="cgr-steps-bar"
        role="progressbar"
        aria-label="Reservation progress"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={n}
        aria-valuetext={complete ? "Complete" : `Step ${n} of 3`}
      >
        <i style={{ width: `${pct}%` }} />
      </div>
      <h1 className="cgr-steps-q" tabIndex={-1} ref={headRef}>
        {title}
      </h1>
      {sub ? <p className="cgr-steps-sub">{sub}</p> : null}
    </div>
  );
}
