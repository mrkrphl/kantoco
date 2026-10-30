import Link from "next/link";
import { CGR_BASE, cgr } from "@/lib/cgr-rentals";
import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";
import { MobileMenu } from "@/components/demos/cgr-rentals/MobileMenu";

type Current = "Catalogue" | "Visit" | "Owner" | "Detail" | "Reserve" | "Confirm";

/** Round 7 nav (stamp §4 Nav): three text links and one hot button. */
const NAV = [
  ["Gowns", `${CGR_BASE}#gowns`, "Catalogue"],
  ["Accessories", `${CGR_BASE}#accessories`, ""],
  ["Visit", `${CGR_BASE}#visit`, "Visit"],
] as const;

export const CGR_NAV = [...NAV, ["Owner view", `${CGR_BASE}/owner`, "Owner"]] as const;

const HOLD_HREF = `${CGR_BASE}#gowns`;

export function CgrShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: Current;
}) {
  const home = current === "Catalogue";
  return (
    <div className="cgr" data-page={home ? "home" : "inner"}>
      <p className="cgr-bar">
        <span className="cgr-bar-inner">
          <b>{cgr.badge}</b>
          <span className="cgr-bar-desk"> · {cgr.barDesk}</span>
          <span className="cgr-bar-mob"> · {cgr.barMob}</span>
        </span>
      </p>

      <header className="cgr-head">
        <Link href={CGR_BASE} className="cgr-wm">
          <span className="cgr-wm-name">cavite gown rentals</span>
          <span className="cgr-wm-sub mono">sample site by kantoco</span>
        </Link>
        <nav className="cgr-head-nav" aria-label="Site">
          <ul className="cgr-nav">
            {NAV.map(([label, href, key]) => (
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
          <Link href={HOLD_HREF} className="btn btn-nav">
            Hold a gown
          </Link>
        </nav>
        <div className="cgr-head-mob">
          <Link href={HOLD_HREF} className="btn btn-nav">
            Hold
          </Link>
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

      <footer className="cgr-foot dark grain" id="visit">
        <svg className="cgr-foot-cap" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 70 C 380 -10 900 0 1440 90 V90 H0 Z" />
        </svg>
        <div className="cgr-foot-grid">
          <div>
            <p className="mono cgr-foot-k">visit (listing address)</p>
            <p>{cgr.address}</p>
            <a className="ulink" href={cgr.maps} target="_blank" rel="noopener noreferrer">
              open in maps
            </a>
          </div>
          <div>
            <p className="mono cgr-foot-k">fittings (listing hours)</p>
            <p>
              {cgr.hours[0].day}, {cgr.hours[0].time}
            </p>
            <p className="mono cgr-foot-dim">{cgr.hoursNote.toLowerCase()}</p>
          </div>
          <div>
            <p className="mono cgr-foot-k">talk to us</p>
            <p>Want a site like this for your shop?</p>
            <a className="ulink" href={KANTOCO_MESSENGER} target="_blank" rel="noopener noreferrer">
              message kantoco
            </a>
          </div>
          <div>
            <p className="mono cgr-foot-k">this is a sample</p>
            <p className="mono cgr-foot-dim">
              sample site by kantoco · examples. {DEMO_DISCLAIMER.toLowerCase()} gowns, rates and dates are examples.
            </p>
            <Link className="ulink" href={`${CGR_BASE}/owner`}>
              owner view
            </Link>
          </div>
        </div>
        <p className="mono cgr-foot-credit">{cgr.credit.toLowerCase()}</p>
        <div className="cgr-foot-big" aria-hidden="true">
          <span className="cgr-foot-word ext">CAVITE GOWN RENTALS</span>
          <span className="hand cgr-foot-hand">see you</span>
        </div>
      </footer>
    </div>
  );
}
