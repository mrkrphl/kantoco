import Link from "next/link";
import { CGR_BASE, cgr } from "@/lib/cgr-rentals";
import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

const nav = [
  ["Catalogue", CGR_BASE],
  ["Visit", `${CGR_BASE}#visit`],
  ["Owner", `${CGR_BASE}/owner`],
] as const;

export function CgrShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: "Catalogue" | "Visit" | "Owner" | "Detail" | "Reserve" | "Confirm";
}) {
  return (
    <div className="cgr">
      <p className="cgr-bar">
        <span className="cgr-wrap cgr-bar-inner">
          <span>
            <b>{cgr.badge}</b>
            <span className="cgr-bar-desk"> · {cgr.barDesk}</span>
            <span className="cgr-bar-mob"> · {cgr.barMob}</span>
          </span>
        </span>
      </p>

      <header className="cgr-head">
        <div className="cgr-wrap cgr-head-row">
          <div className="cgr-brand">
            <p className="cgr-eyebrow">{cgr.eyebrow}</p>
            <Link href={CGR_BASE} className="cgr-name">
              {cgr.name}
            </Link>
          </div>
          <nav aria-label="Sample app">
            <ul className="cgr-nav">
              {nav.map(([label, href]) => (
                <li key={label}>
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
        </div>
      </header>

      <main className="cgr-main">{children}</main>

      <footer className="cgr-foot">
        <div className="cgr-wrap cgr-foot-inner">
          <div>
            <p className="cgr-foot-name">{cgr.name}</p>
            <p className="cgr-mute">{DEMO_DISCLAIMER}</p>
            <p className="cgr-mute cgr-credit">{cgr.credit}</p>
          </div>
          <a
            className="cgr-btn cgr-btn-ghost"
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
          >
            Message KantoCo
          </a>
        </div>
      </footer>
    </div>
  );
}
