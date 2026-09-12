import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER } from "@/lib/demos";
import { maxicon } from "@/lib/maxicon";

const nav = [
  ["Home", "/demos/maxicon-car-aircon"],
  ["Visit", "/demos/maxicon-car-aircon/contact"],
] as const;

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

export function MaxiconChrome({
  current,
}: {
  current: (typeof nav)[number][0];
}) {
  return (
    <header className="maxicon-chrome">
      <Link href="/demos/maxicon-car-aircon" className="maxicon-chrome-name">
        {maxicon.name}
      </Link>
      <nav>
        <ul className="maxicon-chrome-nav">
          {nav.map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={current === label ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function MaxiconShell({
  children,
  current,
  overlay = false,
}: {
  children: React.ReactNode;
  current: (typeof nav)[number][0];
  overlay?: boolean;
}) {
  return (
    <div className={overlay ? "maxicon" : "maxicon maxicon--page"}>
      {overlay ? null : (
        <>
          <MaxiconBanner />
          <MaxiconChrome current={current} />
        </>
      )}
      <main>{children}</main>
    </div>
  );
}
