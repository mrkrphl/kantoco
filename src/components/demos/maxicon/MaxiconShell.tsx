import Link from "next/link";
import { DEMO_BADGE, DEMO_DISCLAIMER, KANTOCO_MESSENGER } from "@/lib/demos";
import { maxicon } from "@/lib/maxicon";

const nav = [
  ["Home", "/demos/maxicon-car-aircon"],
  ["Work", "/demos/maxicon-car-aircon/services"],
  ["About", "/demos/maxicon-car-aircon/about"],
  ["Bay", "/demos/maxicon-car-aircon/gallery"],
  ["Visit", "/demos/maxicon-car-aircon/contact"],
] as const;

export function MaxiconShell({
  children,
  current,
}: {
  children: React.ReactNode;
  current: (typeof nav)[number][0];
}) {
  return (
    <div className="maxicon">
      <p className="maxicon-banner">
        <strong>{DEMO_BADGE}</strong>
        <span>{DEMO_DISCLAIMER}</span>
      </p>

      <header className="maxicon-head">
        <div className="maxicon-head-row">
          <Link href="/demos/maxicon-car-aircon" className="block">
            <p className="maxicon-display maxicon-name">{maxicon.name}</p>
            <p className="mt-2 text-sm text-[var(--mute)]">
              {maxicon.addressShort}
            </p>
          </Link>
          <nav>
            <ul className="maxicon-nav">
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

      <footer className="maxicon-foot">
        <div className="maxicon-foot-inner">
          <p className="max-w-md text-sm leading-relaxed text-[var(--mute)]">
            {maxicon.sampleNote}
          </p>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <a
              href={maxicon.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Maxicon on Facebook
            </a>
            <a
              href={KANTOCO_MESSENGER}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Message KantoCo
            </a>
            <Link href="/" className="text-[var(--mute)]">
              Back to the agency
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
