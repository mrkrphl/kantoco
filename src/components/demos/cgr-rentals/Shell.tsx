import Link from "next/link";
import { CGR_BASE, cgr } from "@/lib/cgr-rentals";
import { DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";
import { MobileMenu } from "@/components/demos/cgr-rentals/MobileMenu";

type Current = "Catalogue" | "Visit" | "Owner" | "Detail" | "Reserve" | "Confirm";

/** r7.5 nav (stamp r7.5 copy deck): three text links and one cream outline button. */
const NAV = [
  ["Gowns", `${CGR_BASE}#gowns`, "Catalogue"],
  ["Accessories", `${CGR_BASE}#accessories`, ""],
  ["Visit", `${CGR_BASE}#visit`, "Visit"],
] as const;

export const CGR_NAV = [...NAV, ["Owner view", `${CGR_BASE}/owner`, "Owner"]] as const;

const RESERVE_HREF = `${CGR_BASE}#gowns`;

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
          <span className="cgr-wm-name">Cavite Gown Rentals</span>
          <span className="cgr-wm-sub">Sample site by KantoCo</span>
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
          <Link href={RESERVE_HREF} className="btn btn-line-cream btn-nav">
            Reserve your gown
          </Link>
        </nav>
        <div className="cgr-head-mob">
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

      <footer className="cgr-foot dark tulle-dark" id="visit">
        <svg className="cgr-foot-cap" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 70 C 380 -10 900 0 1440 90 V90 H0 Z" />
        </svg>
        <div className="cgr-foot-grid">
          <div>
            <p className="cgr-foot-k">Visit (listing address)</p>
            <p>{cgr.address}</p>
            <a className="ulink" href={cgr.maps} target="_blank" rel="noopener noreferrer">
              Open in maps
            </a>
            <p className="cgr-foot-k cgr-foot-k-gap">Call or message the shop</p>
            <ul className="cgr-foot-links">
              {cgr.phones.map((p) => (
                <li key={p.tel}>
                  <a className="ulink" href={p.tel}>
                    {p.label}
                  </a>
                </li>
              ))}
              <li>
                <a className="ulink" href={cgr.instagram.href} target="_blank" rel="noopener noreferrer">
                  Instagram, {cgr.instagram.label}
                </a>
              </li>
              <li>
                <a className="ulink" href={cgr.tiktok.href} target="_blank" rel="noopener noreferrer">
                  TikTok, {cgr.tiktok.label}
                </a>
              </li>
              <li>
                <a className="ulink" href={cgr.facebook} target="_blank" rel="noopener noreferrer">
                  facebook.com/<wbr />CaviteGownRentals
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="cgr-foot-k">Fittings (listing hours)</p>
            <p>
              {cgr.hours[0].day}, {cgr.hours[0].time}
            </p>
            <p className="cgr-foot-dim">{cgr.hoursNote}</p>
          </div>
          <div>
            <p className="cgr-foot-k">Talk to us</p>
            <p>Want a site like this for your shop?</p>
            <a className="ulink" href={KANTOCO_MESSENGER} target="_blank" rel="noopener noreferrer">
              Message KantoCo
            </a>
          </div>
          <div>
            <p className="cgr-foot-k">This is a sample</p>
            <p className="cgr-foot-dim">
              {DEMO_DISCLAIMER} Gowns, rates and dates are examples.
            </p>
            <Link className="ulink" href={`${CGR_BASE}/owner`}>
              Owner view
            </Link>
          </div>
        </div>
        <p className="cgr-foot-credit">{cgr.credit}</p>
        <div className="cgr-foot-big" aria-hidden="true">
          <span className="cgr-foot-word disp">
            Cavite Gown <em>Rentals</em>
          </span>
        </div>
      </footer>
    </div>
  );
}
