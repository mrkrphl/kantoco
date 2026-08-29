import Image from "next/image";
import Link from "next/link";
import { site, type Vertical } from "@/lib/config";

const demos: {
  key: Exclude<Vertical, "cafe">;
  label: string;
  shop: string;
  blurb: string;
}[] = [
  {
    key: "clinic",
    label: "Clinic",
    shop: "Nara Clinic",
    blurb: "Clear services, hours, and a Message button patients can find.",
  },
  {
    key: "salon",
    label: "Salon",
    shop: "Amihan Salon",
    blurb: "Gallery-forward layout for beauty shops that live on walk-ins.",
  },
  {
    key: "auto",
    label: "Auto",
    shop: "Haligi Auto Care",
    blurb: "Straight talk on services and contact for repair & parts shops.",
  },
];

function MessageLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={site.messengerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

export default function Home() {
  return (
    <div className="site-grain relative overflow-x-hidden bg-charcoal text-bone">
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <Image
              src="/mark.png"
              alt="KantoCo"
              width={36}
              height={36}
              className="rounded-sm"
              priority
            />
            <span className="font-[family-name:var(--font-display)] text-sm tracking-wide text-bone md:text-base">
              KantoCo
            </span>
          </a>
          <div className="flex items-center gap-5 text-sm text-concrete md:gap-8">
            <a href="#samples" className="hidden transition hover:text-bone sm:inline">
              Samples
            </a>
            <a href="#craft" className="hidden transition hover:text-bone sm:inline">
              Craft
            </a>
            <a href="#package" className="hidden transition hover:text-bone sm:inline">
              Package
            </a>
            <MessageLink className="rounded-sm bg-amber px-3.5 py-2 font-semibold text-charcoal transition hover:brightness-110">
              Message us
            </MessageLink>
          </div>
        </nav>
      </header>

      <main id="top">
        {/* Hero — brand first, full-bleed */}
        <section className="relative min-h-[100svh] w-full">
          <Image
            src="/hero-cover.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/92 to-charcoal/45"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/40"
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24 md:pt-20">
            <p className="animate-rise font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-bone sm:text-6xl md:text-8xl">
              KantoCo
            </p>
            <div className="animate-line mt-4 h-1 w-24 bg-amber md:w-32" />
            <p className="animate-rise-delay-1 mt-5 max-w-xl font-[family-name:var(--font-display)] text-2xl text-amber sm:text-3xl md:text-4xl">
              Sites for the corner.
            </p>
            <p className="animate-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-concrete md:text-lg">
              Fixed websites for local shops in Parañaque & nearby — clinic,
              salon, auto.
            </p>
            <div className="animate-rise-delay-2 mt-8">
              <MessageLink className="inline-flex items-center rounded-sm bg-amber px-6 py-3.5 text-base font-semibold text-charcoal transition hover:brightness-110">
                Message us
              </MessageLink>
            </div>
          </div>
        </section>

        {/* Samples */}
        <section
          id="samples"
          className="border-t border-white/10 px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
              Samples
            </p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight text-bone md:text-5xl">
              Three verticals. Labeled demos only.
            </h2>
            <p className="mt-4 max-w-lg text-concrete">
              Demo site by KantoCo — sample only. Not real client work.
            </p>

            <ul className="mt-12 grid gap-6 md:grid-cols-3">
              {demos.map((demo) => {
                const href = site.demos[demo.key];
                const live = Boolean(href);
                return (
                  <li key={demo.key} className="border border-white/10 bg-white/[0.02] p-6">
                    <p className="font-[family-name:var(--font-display)] text-2xl text-bone">
                      {demo.label}
                    </p>
                    <p className="mt-1 text-sm text-amber">{demo.shop}</p>
                    <p className="mt-3 text-sm leading-relaxed text-steel">
                      {demo.blurb}
                    </p>
                    {live ? (
                      href.startsWith("/") ? (
                        <Link
                          href={href}
                          className="mt-6 inline-flex text-sm font-semibold text-amber transition hover:brightness-110"
                        >
                          Open demo →
                        </Link>
                      ) : (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex text-sm font-semibold text-amber transition hover:brightness-110"
                        >
                          Open demo →
                        </a>
                      )
                    ) : (
                      <p className="mt-6 text-sm text-steel/80">
                        Demo link coming soon
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Craft samples. Extra row. Concordia stays unlisted. */}
        <section
          id="craft"
          className="border-t border-white/10 px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
              Craft samples
            </p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight text-bone md:text-5xl">
              One-scroll shops. Different type, motion, photo.
            </h2>
            <p className="mt-4 max-w-lg text-concrete">
              Extra labeled samples. Not the clinic, salon, or auto row. Demo
              site by KantoCo. Sample only. Not real client work.
            </p>

            <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
              {[
                {
                  href: "/demos/aninag-studio",
                  shop: "Aninag Studio",
                  kind: "Photo studio",
                  motion: "Aperture irises open into the room.",
                  mark: "f/1.4",
                },
                {
                  href: "/demos/hinog-bakery",
                  shop: "Hinog Bakery",
                  kind: "Bakery counter",
                  motion: "A kraft box lifts its lid.",
                  mark: "014",
                },
                {
                  href: "/demos/buhol-blooms",
                  shop: "Buhol Blooms",
                  kind: "Flower stall",
                  motion: "Petals unfurl, then the table.",
                  mark: "wrap",
                },
              ].map((row) => (
                <li
                  key={row.href}
                  className="grid gap-3 py-7 sm:grid-cols-[5.5rem_1fr_auto] sm:items-end"
                >
                  <p className="font-[family-name:var(--font-display)] text-amber">
                    {row.mark}
                  </p>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-steel">
                      {row.kind}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-bone md:text-3xl">
                      {row.shop}
                    </p>
                    <p className="mt-2 max-w-md text-sm text-concrete">{row.motion}</p>
                  </div>
                  <Link
                    href={row.href}
                    className="text-sm font-semibold text-amber transition hover:brightness-110"
                  >
                    Open demo
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Package */}
        <section
          id="package"
          className="border-t border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(255,176,0,0.12),transparent_45%),linear-gradient(180deg,#16191d_0%,#121417_100%)] px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
                Package
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight md:text-5xl">
                One fixed Package.
                <br />
                No mystery quotes.
              </h2>
              <p className="mt-6 font-[family-name:var(--font-display)] text-5xl text-amber md:text-6xl">
                ₱15,000
              </p>
              <p className="mt-2 text-steel">one-time · domain/hosting separate</p>
              <MessageLink className="mt-8 inline-flex rounded-sm bg-amber px-6 py-3.5 font-semibold text-charcoal transition hover:brightness-110">
                Message us
              </MessageLink>
            </div>
            <div className="space-y-8 text-sm leading-relaxed">
              <div>
                <p className="font-semibold text-bone">Includes</p>
                <ul className="mt-3 space-y-2 text-concrete">
                  <li>5 pages — Home, Services, About, Gallery, Contact</li>
                  <li>~7 days after assets received</li>
                  <li>2 revision rounds</li>
                  <li>50% start / 50% before go-live</li>
                  <li>Mobile Next.js site · hours/map · chat CTA · basic SEO</li>
                  <li>Help setting up domain & hosting</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-bone">Not included</p>
                <ul className="mt-3 space-y-2 text-steel">
                  <li>Domain & hosting fees</li>
                  <li>Logo from scratch · booking/e‑com apps</li>
                  <li>Ads retainers · full copy from zero</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="border-t border-white/10 px-5 py-20 md:px-8 md:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
              How it works
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl">
              Four clear steps.
            </h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["01", "Message us", "Tell us your shop, city, and needs."],
                ["02", "Deposit", "50% to start. Gather photos, services, hours."],
                ["03", "Build", "~7 days to a preview you can review."],
                ["04", "Go live", "50% before launch on your domain."],
              ].map(([n, title, body]) => (
                <li key={n}>
                  <p className="font-[family-name:var(--font-display)] text-amber">
                    {n}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-bone">{title}</p>
                  <p className="mt-2 text-sm text-steel">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Area */}
        <section
          id="area"
          className="border-t border-white/10 px-5 py-20 md:px-8 md:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">
              Area
            </p>
            <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl leading-tight md:text-5xl">
              Built for the south Metro fringe.
            </h2>
            <p className="mt-5 max-w-xl text-concrete">
              Parañaque first — also Las Piñas, Pasay, Taguig fringe, Muntinlupa
              north. Neighborhood service shops that need a real site, not
              another AI lab pitch.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl text-bone">
              KantoCo
            </p>
            <p className="mt-1 text-sm text-steel">Sites for the corner.</p>
          </div>
          <MessageLink className="text-sm font-semibold text-amber transition hover:brightness-110">
            Message us on Facebook →
          </MessageLink>
        </div>
      </footer>
    </div>
  );
}
