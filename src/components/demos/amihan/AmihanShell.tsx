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
      <div className="amihan-banner">
        <p className="font-semibold tracking-[0.14em]">{DEMO_BADGE}</p>
        <p className="max-w-[18rem] text-right sm:max-w-none">{DEMO_DISCLAIMER}</p>
      </div>

      <header className="amihan-head">
        <div className="amihan-head-row">
          <Link href="/demos/amihan-salon" className="block">
            <p className="amihan-display text-5xl leading-none md:text-6xl">
              Amihan
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-[var(--mute)]">
              Salon, Moonwalk / BF Homes
            </p>
          </Link>
          <nav>
            <ul className="amihan-nav">
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

      <footer className="amihan-foot">
        <div className="mx-auto flex max-w-[76rem] flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-[var(--mute)]">
            {DEMO_DISCLAIMER} Sample parlor on a fictional strip near BF Homes
            and Moonwalk, Parañaque.
          </p>
          <a
            href={KANTOCO_MESSENGER}
            target="_blank"
            rel="noopener noreferrer"
            className="amihan-display text-2xl text-[var(--accent)]"
          >
            Message us on Facebook
          </a>
        </div>
      </footer>
    </div>
  );
}
