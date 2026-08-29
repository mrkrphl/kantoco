import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";

const nav = [
  ["Home", "/demos/amihan-salon"],
  ["Services", "/demos/amihan-salon/services"],
  ["About", "/demos/amihan-salon/about"],
  ["Gallery", "/demos/amihan-salon/gallery"],
  ["Contact", "/demos/amihan-salon/contact"],
] as const;

export function AmihanShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: (typeof nav)[number][0];
}) {
  return (
    <div className="amihan">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--ami-teal)] px-4 py-2 text-[11px] md:px-6">
        <p className="amihan-neon font-semibold tracking-[0.18em]">{DEMO_BADGE}</p>
        <p className="max-w-[14rem] text-right text-[var(--ami-dim)] sm:max-w-none">
          {DEMO_DISCLAIMER}
        </p>
      </div>

      <header className="px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Link href="/demos/amihan-salon" className="block">
            <p className="amihan-display text-5xl leading-none md:text-7xl">
              AMIHAN
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.32em] text-[var(--ami-tungsten)]">
              Salon · wind cut
            </p>
          </Link>
          <nav>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs uppercase tracking-[0.16em] text-[var(--ami-dim)]">
              {nav.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      current === label
                        ? "text-[var(--ami-tungsten)]"
                        : "hover:text-[var(--ami-paper)]"
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

      <footer className="mt-20 border-t border-[var(--ami-teal)] px-4 py-10 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-[var(--ami-dim)]">
            {DEMO_DISCLAIMER} Walk-up sample strip near the BF / Moonwalk edge,
            Parañaque. Not a real shop.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="amihan-display text-xl text-[var(--ami-tungsten)]"
          >
            m.me/kantocoph
          </a>
        </div>
      </footer>
    </div>
  );
}
