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
      <p className="bg-[var(--nara-green)] px-4 py-2 text-center text-[11px] leading-snug text-[#f4faf7] md:text-xs">
        {DEMO_DISCLAIMER}
      </p>

      <header className="border-b border-[var(--nara-rule)] bg-[var(--nara-card)]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4 px-4 py-5 md:px-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--nara-maroon)]">
              {DEMO_BADGE}
            </p>
            <Link
              href="/demos/nara-clinic"
              className="nara-serif mt-1 block text-3xl font-semibold tracking-tight"
            >
              Nara Clinic
            </Link>
            <p className="mt-1 text-xs text-[var(--nara-muted)]">
              Consults near Dr. A. Santos Avenue, BF Homes, Parañaque
            </p>
          </div>
          <p className="text-right text-xs text-[var(--nara-muted)]">
            Monday to Saturday, 8:00-17:00
            <br />
            Closed on Sunday
          </p>
        </div>
        <nav className="border-t border-[var(--nara-rule)] bg-[var(--nara-wall)]">
          <ul className="mx-auto flex max-w-5xl flex-wrap gap-x-5 gap-y-2 px-4 py-3 text-sm md:px-6">
            {nav.map(([label, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className={
                    current === label
                      ? "font-semibold text-[var(--nara-maroon)] underline decoration-[var(--nara-maroon)] underline-offset-4"
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

      <footer className="mt-16 border-t-4 border-[var(--nara-green)] bg-[var(--nara-card)] px-4 py-10 md:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="nara-serif text-lg font-semibold">Nara Clinic</p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-[var(--nara-muted)]">
              {DEMO_DISCLAIMER} Fictional shop on a sample block off Dr. A.
              Santos Avenue, BF Homes, Parañaque.
            </p>
          </div>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--nara-maroon)] underline underline-offset-4"
          >
            Message us on Facebook
          </a>
        </div>
      </footer>
    </div>
  );
}
