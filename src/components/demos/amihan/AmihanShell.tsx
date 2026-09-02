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
      <div className="flex items-center justify-between gap-3 bg-[var(--ami-rose)] px-4 py-2 text-[11px] text-[#fff6ee] md:px-6">
        <p className="font-semibold tracking-[0.14em]">{DEMO_BADGE}</p>
        <p className="max-w-[16rem] text-right sm:max-w-none">{DEMO_DISCLAIMER}</p>
      </div>

      <header className="border-b border-[color-mix(in_srgb,var(--ami-rose)_35%,transparent)] px-4 py-7 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Link href="/demos/amihan-salon" className="block">
            <p className="amihan-display text-5xl leading-none md:text-6xl">
              Amihan
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[var(--ami-dim)]">
              Salon, Moonwalk / BF Homes
            </p>
          </Link>
          <nav>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--ami-dim)]">
              {nav.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={
                      current === label
                        ? "text-[var(--ami-ink)] underline decoration-[var(--ami-rose)] underline-offset-4"
                        : "hover:text-[var(--ami-ink)]"
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

      <footer className="mt-16 border-t border-[color-mix(in_srgb,var(--ami-rose)_40%,transparent)] px-4 py-10 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-xs leading-relaxed text-[var(--ami-dim)]">
            {DEMO_DISCLAIMER} Sample parlor on a fictional strip near BF Homes
            and Moonwalk, Parañaque.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="amihan-display text-2xl text-[var(--ami-rose)]"
          >
            Message us on Facebook
          </a>
        </div>
      </footer>
    </div>
  );
}
