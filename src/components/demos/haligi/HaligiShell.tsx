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
      <div className="haligi-stripe h-2.5 w-full" aria-hidden />
      <p className="bg-[var(--ha-black)] px-4 py-2 text-center text-[11px] text-[var(--ha-yellow)] md:text-xs">
        {DEMO_DISCLAIMER}
      </p>

      <header className="bg-[var(--ha-black)] px-4 py-3 md:px-6 md:py-3.5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/demos/haligi-auto" className="block">
            <p className="text-[10px] font-bold tracking-[0.24em] text-[var(--ha-yellow)]">
              {DEMO_BADGE}
            </p>
            <p className="haligi-cond mt-1 text-4xl leading-none text-[var(--ha-yellow)] md:text-5xl">
              Haligi Auto Care
            </p>
            <p className="mt-1 text-xs text-[var(--ha-steel)]">
              Bay work. Sucat sample strip. Not a dealership.
            </p>
          </Link>
          <nav>
            <ul className="haligi-cond flex flex-wrap gap-x-4 gap-y-2 text-lg text-[var(--ha-steel)]">
              {nav.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      current === label
                        ? "bg-[var(--ha-yellow)] px-2 text-[var(--ha-black)]"
                        : "hover:text-[var(--ha-yellow)]"
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

      <footer className="mt-12 border-t-4 border-[var(--ha-yellow)] bg-[var(--ha-black)] px-4 py-8 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-[var(--ha-steel)]">
            {DEMO_DISCLAIMER} Sample bay on the Sucat / Dr. A. Santos service
            corridor, Parañaque. Fictional shop.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="haligi-cond text-2xl text-[var(--ha-yellow)]"
          >
            Message on Messenger
          </a>
        </div>
      </footer>
    </div>
  );
}
