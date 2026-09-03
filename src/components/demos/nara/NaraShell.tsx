import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

const nav = [
  ["Home", "/demos/nara-clinic"],
  ["Services", "/demos/nara-clinic/services"],
  ["About", "/demos/nara-clinic/about"],
  ["Gallery", "/demos/nara-clinic/gallery"],
  ["Contact", "/demos/nara-clinic/contact"],
] as const;

export function NaraShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: (typeof nav)[number][0];
}) {
  return (
    <div className="nara">
      <p className="nara-banner">{DEMO_DISCLAIMER}</p>

      <header className="nara-head">
        <div className="nara-head-row">
          <div>
            <p className="nara-badge">{DEMO_BADGE}</p>
            <Link href="/demos/nara-clinic" className="nara-serif nara-name block">
              Nara Clinic
            </Link>
            <p className="mt-2 text-sm text-[var(--mute)]">
              Consults near Dr. A. Santos Avenue, BF Homes, Parañaque
            </p>
          </div>
          <p className="text-sm text-[var(--mute)] md:text-right">
            Monday to Saturday, 8:00-17:00
            <br />
            Closed on Sunday
          </p>
        </div>
        <nav>
          <ul className="nara-nav">
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

      <footer className="nara-foot">
        <div className="nara-foot-inner">
          <div>
            <p className="nara-serif text-lg font-semibold">Nara Clinic</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--mute)]">
              {DEMO_DISCLAIMER} Fictional shop on a sample block off Dr. A.
              Santos Avenue, BF Homes, Parañaque.
            </p>
          </div>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--accent)] underline underline-offset-4"
          >
            Message us on Facebook
          </a>
        </div>
      </footer>
    </div>
  );
}
