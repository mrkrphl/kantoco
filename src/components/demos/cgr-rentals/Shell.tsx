import Link from "next/link";
import { CGR_BASE, cgr } from "@/lib/cgr-rentals";
import { MobileMenu } from "@/components/demos/cgr-rentals/MobileMenu";

type Current = "Catalogue" | "Visit" | "Owner" | "Detail" | "Reserve" | "Confirm" | "Fitting";

/** r7.11 thin nav (Design r7.11 §1): wordmark, three links, one wine button. */
const NAV = [
  ["Gowns", `${CGR_BASE}#gowns`, "Catalogue"],
  ["Accessories", `${CGR_BASE}#accessories`, ""],
  ["Visit", "#visit", "Visit"],
] as const;

/** r8.0: the owner view stays at its own unlisted URL; no public link to it. */
export const CGR_NAV = NAV;

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
      <header className="cgr-head">
        <Link href={CGR_BASE} className="cgr-wm">
          <span className="cgr-wm-name">Cavite Gown Rentals</span>
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
          <Link href={RESERVE_HREF} className="r11-btn r11-wine r11-nav">
            Reserve your gown
          </Link>
        </nav>
        <div className="cgr-head-mob">
          <MobileMenu
            items={[
              { label: "Reserve your gown", href: RESERVE_HREF, on: false },
              ...CGR_NAV.map(([label, href, key]) => ({
                label,
                href,
                on: Boolean(key) && current === key,
              })),
            ]}
          />
        </div>
      </header>

      <main className="cgr-main">{children}</main>

      <footer className="r11-visit" id="visit" aria-labelledby="cgr-visit-h">
        <div className="r11-visit-top">
          <div>
            <p className="r11-script" aria-hidden="true">Visit</p>
            <h2 id="cgr-visit-h" className="r11-addr">
              {cgr.address}
            </h2>
          </div>
          <div className="r11-act">
            <a className="r11-btn r11-ivory r11-sm" href={cgr.messenger} target="_blank" rel="noopener noreferrer">
              Message the shop
            </a>
            <a className="r11-link" href={cgr.maps} target="_blank" rel="noopener noreferrer">
              Open in maps
            </a>
          </div>
        </div>
        <ul className="r11-more">
          {cgr.phones.map((p) => (
            <li key={p.tel}>
              <a href={p.tel}>{p.label}</a>
            </li>
          ))}
          <li>
            <a href={cgr.instagram.href} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </li>
          <li>
            <a href={cgr.tiktok.href} target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
          </li>
          <li>
            <a href={cgr.facebook} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </li>
        </ul>
        <p className="r11-fine">Photos from the shop&apos;s public pages.</p>
        <p className="r11-bigwm" aria-hidden="true">
          <span>Cavite Gown Rentals</span>
        </p>
      </footer>
    </div>
  );
}
