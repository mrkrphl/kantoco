import Link from "next/link";
import { CGR_BASE, cgr } from "@/lib/cgr-rentals";
import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";
import { MobileMenu } from "@/components/demos/cgr-rentals/MobileMenu";

type Current = "Catalogue" | "Visit" | "Owner" | "Detail" | "Reserve" | "Confirm";

const NAV_LEFT = [
  ["Gowns", CGR_BASE, "Catalogue"],
  ["Accessories", `${CGR_BASE}#accessories`, ""],
  ["How holds work", `${CGR_BASE}#holds`, ""],
] as const;

const NAV_RIGHT = [
  ["Visit", `${CGR_BASE}#visit`, "Visit"],
  ["Owner view", `${CGR_BASE}/owner`, "Owner"],
  ["Request a hold", `${CGR_BASE}#all-gowns`, "Reserve"],
] as const;

export const CGR_NAV = [...NAV_LEFT, ...NAV_RIGHT];

function NavList({
  items,
  current,
  className,
}: {
  items: readonly (readonly [string, string, string])[];
  current: Current;
  className: string;
}) {
  return (
    <ul className={className}>
      {items.map(([label, href, key]) => (
        <li key={label}>
          <Link
            href={href}
            className="cgr-nav-a"
            aria-current={key && current === key ? "page" : undefined}
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CgrShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: Current;
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
          <nav className="cgr-head-nav cgr-head-l" aria-label="Catalogue">
            <NavList items={NAV_LEFT} current={current} className="cgr-nav" />
          </nav>
          <Link href={CGR_BASE} className="cgr-mark">
            <span className="cgr-mark-name">{cgr.name}</span>
            <span className="cgr-mark-sub">Gowns for rent · Dasmariñas</span>
          </Link>
          <nav className="cgr-head-nav cgr-head-r" aria-label="Shop">
            <NavList items={NAV_RIGHT} current={current} className="cgr-nav" />
          </nav>
          <MobileMenu
            items={CGR_NAV.map(([label, href, key]) => ({
              label,
              href,
              on: Boolean(key) && current === key,
            }))}
          />
        </div>
      </header>

      <main className="cgr-main">{children}</main>

      <footer className="cgr-foot">
        <div className="cgr-wrap cgr-foot-grid">
          <div className="cgr-foot-col">
            <p className="cgr-foot-name">{cgr.name}</p>
            <p className="cgr-foot-note">
              A KantoCo sample. Gowns, rates and dates are examples.
            </p>
            <p className="cgr-foot-fine">{DEMO_DISCLAIMER}</p>
          </div>
          <div className="cgr-foot-col">
            <p className="cgr-micro">Visit</p>
            <p className="cgr-foot-text">{cgr.address}</p>
            <p className="cgr-foot-text">
              {cgr.hours[0].day}, {cgr.hours[0].time}{" "}
              <span className="cgr-foot-fine">(listing hours, example)</span>
            </p>
          </div>
          <div className="cgr-foot-col">
            <p className="cgr-micro">Ask</p>
            <p className="cgr-foot-text">Want a site like this for your shop?</p>
            <a
              className="cgr-link"
              href={KANTOCO_MESSENGER}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message KantoCo
            </a>
          </div>
        </div>
        <div className="cgr-wrap cgr-foot-row">
          <p className="cgr-foot-credit">{cgr.credit}</p>
          <p className="cgr-micro">© 2026 KantoCo · Sample · Not live</p>
        </div>
      </footer>
    </div>
  );
}
