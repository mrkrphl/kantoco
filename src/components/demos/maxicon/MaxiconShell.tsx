import { DEMO_BADGE, DEMO_DISCLAIMER } from "@/lib/demos";

export function MaxiconBanner({
  over = false,
  fixed = false,
}: {
  over?: boolean;
  fixed?: boolean;
}) {
  const className = [
    "maxicon-banner",
    over ? "maxicon-banner--over" : "",
    fixed ? "maxicon-banner--fixed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={className}>
      <strong>{DEMO_BADGE}</strong>
      <span>{DEMO_DISCLAIMER}</span>
    </p>
  );
}

export function MaxiconShell({
  children,
  overlay = false,
}: {
  children: React.ReactNode;
  overlay?: boolean;
}) {
  return (
    <div className={overlay ? "maxicon" : "maxicon maxicon--page"}>
      {overlay ? null : <MaxiconBanner />}
      <main>{children}</main>
    </div>
  );
}
