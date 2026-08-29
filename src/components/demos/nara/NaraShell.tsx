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
      <p className="border-b border-[var(--nara-rule)] bg-[var(--nara-green)] px-4 py-2 text-center text-[11px] leading-snug text-[var(--nara-paper)] md:text-xs">
        {DEMO_DISCLAIMER}
      </p>

      <header className="border-b border-[var(--nara-rule)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4 px-4 py-5 md:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--nara-rust)]">
              {DEMO_BADGE}
            </p>
            <Link
              href="/demos/nara-clinic"
              className="mt-1 block text-2xl font-semibold tracking-tight"
            >
              Nara Clinic
            </Link>
            <p className="mt-1 text-xs text-[var(--nara-muted)]">
              Neighborhood consults · Parañaque sample
            </p>
          </div>
          <p className="text-right text-xs text-[var(--nara-muted)]">
            Mon-Sat 8:00-17:00
            <br />
            Sunday closed
          </p>
        </div>
        <nav className="border-t border-[var(--nara-rule)]">
          <ul className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2 px-4 py-3 text-sm md:px-6">
            {nav.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    current === label
                      ? "font-semibold text-[var(--nara-rust)] underline decoration-[var(--nara-rust)] underline-offset-4"
                      : "text-[var(--nara-muted)] hover:text-[var(--nara-ink)]"
                  }
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t-2 border-[var(--nara-green)] px-4 py-10 md:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Nara Clinic</p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--nara-muted)]">
              {DEMO_DISCLAIMER} Fictional shop on a sample block off Dr. A.
              Santos Ave., BF Homes fringe, Parañaque.
            </p>
          </div>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--nara-rust)] underline underline-offset-4"
          >
            Message KantoCo on Messenger
          </a>
        </div>
      </footer>
    </div>
  );
}
