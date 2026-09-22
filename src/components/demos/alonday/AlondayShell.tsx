import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER } from "@/lib/demos";
import { alonday } from "@/lib/alonday";

const nav = [
  ["Home", "/demos/alonday-dental"],
  ["Services", "/demos/alonday-dental/services"],
  ["About", "/demos/alonday-dental/about"],
  ["Gallery", "/demos/alonday-dental/gallery"],
  ["Visit", "/demos/alonday-dental/contact"],
] as const;

export function AlondayBanner() {
  return (
    <p className="alonday-banner">
      <strong>{DEMO_BADGE}</strong>
      <span>{DEMO_DISCLAIMER}</span>
    </p>
  );
}

export function AlondayShell({
  children,
  current,
  overlay = false,
}: {
  children: React.ReactNode;
  current: (typeof nav)[number][0];
  overlay?: boolean;
}) {
  return (
    <div className={overlay ? "alonday alonday--overlay" : "alonday"}>
      <AlondayBanner />
      <header className="alonday-head">
        <div className="alonday-head-row">
          <div>
            <Link href="/demos/alonday-dental" className="alonday-name">
              {alonday.name}
            </Link>
            <p className="alonday-meta">{alonday.addressShort}</p>
          </div>
          <p className="alonday-meta alonday-head-hours">{alonday.hours}</p>
        </div>
        <nav>
          <ul className="alonday-nav">
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
      <main>{children}</main>
    </div>
  );
}
