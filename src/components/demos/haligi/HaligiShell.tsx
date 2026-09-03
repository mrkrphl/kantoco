import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

const nav = [
  ["Home", "/demos/haligi-auto"],
  ["Services", "/demos/haligi-auto/services"],
  ["About", "/demos/haligi-auto/about"],
  ["Gallery", "/demos/haligi-auto/gallery"],
  ["Contact", "/demos/haligi-auto/contact"],
] as const;

export function HaligiShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: (typeof nav)[number][0];
}) {
  return (
    <div className="haligi">
      <p className="haligi-banner">{DEMO_DISCLAIMER}</p>

      <header className="haligi-head">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Link href="/demos/haligi-auto" className="block">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)]">
              {DEMO_BADGE}
            </p>
            <p className="haligi-cond mt-1 text-5xl leading-none md:text-6xl">
              Haligi Auto Care
            </p>
            <p className="mt-2 text-sm text-[var(--mute)]">
              Sample bay on the Sucat service road. Not a dealership.
            </p>
          </Link>
          <nav>
            <ul className="haligi-nav">
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
        </div>
      </header>

      <main>{children}</main>

      <footer className="haligi-foot">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-[var(--mute)]">
            {DEMO_DISCLAIMER} Sample bay on the Sucat / Dr. A. Santos service
            corridor, Parañaque. Fictional shop.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="haligi-cond text-3xl text-[var(--accent)]"
          >
            Message us on Facebook
          </a>
        </div>
      </footer>
    </div>
  );
}
