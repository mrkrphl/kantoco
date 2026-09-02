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
      <p className="bg-[var(--ha-carbon)] px-4 py-2 text-center text-[11px] text-[#f4efe3] md:text-xs">
        {DEMO_DISCLAIMER}
      </p>

      <header className="border-b-4 border-[var(--ha-oxide)] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Link href="/demos/haligi-auto" className="block">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--ha-oxide)]">
              {DEMO_BADGE}
            </p>
            <p className="haligi-cond mt-1 text-5xl leading-none text-[var(--ha-ink)] md:text-6xl">
              Haligi Auto Care
            </p>
            <p className="mt-1 text-xs text-[var(--ha-steel)]">
              Sample bay on the Sucat service road. Not a dealership.
            </p>
          </Link>
          <nav>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--ha-steel)]">
              {nav.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      current === label
                        ? "bg-[var(--ha-carbon)] px-2 py-0.5 font-semibold text-[#f4efe3]"
                        : "hover:text-[var(--ha-ink)]"
                    }
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

      <footer className="mt-12 border-t-4 border-[var(--ha-carbon)] px-4 py-8 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-[var(--ha-steel)]">
            {DEMO_DISCLAIMER} Sample bay on the Sucat / Dr. A. Santos service
            corridor, Parañaque. Fictional shop.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="haligi-cond text-3xl text-[var(--ha-oxide)]"
          >
            Message us on Facebook
          </a>
        </div>
      </footer>
    </div>
  );
}
