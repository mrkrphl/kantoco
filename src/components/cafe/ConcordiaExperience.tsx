"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/lib/config";
import { cafe, menuHighlights } from "@/lib/cafe";

gsap.registerPlugin(ScrollTrigger);

const AllDayScene = dynamic(() => import("./AllDayScene"), {
  ssr: false,
  loading: () => (
    <section className="flex h-[100svh] items-center justify-center bg-[#ead9c6] text-olive">
      Setting the table…
    </section>
  ),
});

export default function ConcordiaExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from(".cafe-hero-copy > *", {
        y: 28,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.utils.toArray<HTMLElement>(".cafe-reveal").forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="cafe-root bg-cream text-espresso">
      <div className="sticky top-0 z-50 border-b border-espresso/10 bg-cream/95 px-4 py-2 text-center text-xs tracking-wide text-espresso backdrop-blur-md md:text-sm">
        {cafe.disclaimer}
      </div>

      <header className="relative z-20">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <a
            href="#top"
            className="font-[family-name:var(--font-cafe-display)] text-xl italic text-espresso md:text-2xl"
          >
            Concordia’s
          </a>
          <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-[0.18em] text-olive md:gap-8">
            <a href="#day" className="hidden hover:text-espresso sm:inline">
              The day
            </a>
            <a href="#menu" className="hidden hover:text-espresso sm:inline">
              Menu
            </a>
            <a href="#visit" className="hover:text-espresso">
              Visit
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="relative min-h-[100svh] overflow-hidden">
          <Image
            src="/demos/concordias-cafe/interior.png"
            alt="Demo still of a warm neighborhood cafe interior — generated for this sample, not cafe photography."
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-cream via-cream/55 to-espresso/25"
            aria-hidden
          />
          <div className="cafe-hero-copy relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-24 md:px-8 md:pb-24">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-terracotta">
              BF Homes · Parañaque
            </p>
            <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-cafe-display)] text-6xl leading-[0.9] italic text-espresso sm:text-7xl md:text-[7.5rem]">
              Concordia’s
            </h1>
            <p className="mt-2 font-[family-name:var(--font-cafe-display)] text-3xl text-clay md:text-5xl">
              All day on Aguirre.
            </p>
            <p className="mt-5 max-w-md text-base leading-relaxed text-olive md:text-lg">
              Coffee at seven. Pasta through the afternoon. Steaks when the
              lights go down. Cakes until midnight — a hangout on the village’s
              food street, not a lunch-only counter.
            </p>
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-espresso">
              {cafe.hours}
            </p>
          </div>
        </section>

        <AllDayScene />

        <section id="menu" className="border-t border-espresso/10 px-5 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="cafe-reveal max-w-2xl">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-terracotta">
                From the board
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-cafe-display)] text-4xl italic leading-tight md:text-6xl">
                Coffee, pasta, steaks, cakes.
              </h2>
              <p className="mt-4 text-olive">
                Public listings, shown as a sample — not a live order menu.
                Prices change; come for the table, not the spreadsheet.
              </p>
            </div>

            <ul className="mt-14 grid gap-10 md:grid-cols-2">
              {menuHighlights.map((col) => (
                <li key={col.key} className="cafe-reveal">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={col.image}
                      alt={col.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <p className="mt-2 text-[0.65rem] uppercase tracking-[0.16em] text-olive/80">
                    Demo still
                  </p>
                  <h3 className="mt-3 font-[family-name:var(--font-cafe-display)] text-3xl italic">
                    {col.title}
                  </h3>
                  <ul className="mt-3 space-y-1 text-sm text-olive">
                    {col.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="cafe-reveal mt-16 grid gap-8 border-t border-espresso/10 pt-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/demos/concordias-cafe/pancake.png"
                  alt="Demo still of pancakes — generated for this sample, not cafe photography."
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-terracotta">
                  Also on the table
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-cafe-display)] text-3xl italic md:text-4xl">
                  All-day breakfast, Filipino bowls, a photobooth.
                </h3>
                <p className="mt-4 leading-relaxed text-olive">
                  Three-layer pancakes in the morning. Bangus belly and cheesy
                  kaldereta when you want rice. Homey, pet-friendly, with a
                  photobooth for the table that stays too long — the kind of
                  neighborhood cafe BF Homes actually uses.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="aguirre"
          className="relative min-h-[70svh] overflow-hidden border-t border-espresso/10"
        >
          <Image
            src="/demos/concordias-cafe/aguirre.png"
            alt="Demo still of a leafy suburban avenue — generated for this sample, not a photo of the cafe street."
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/45 to-transparent"
            aria-hidden
          />
          <div className="cafe-reveal relative z-10 mx-auto flex min-h-[70svh] max-w-6xl flex-col justify-end px-5 py-16 md:px-8 md:py-24">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-brass">
              The corner
            </p>
            <h2 className="mt-3 max-w-xl font-[family-name:var(--font-cafe-display)] text-4xl italic leading-tight text-cream md:text-6xl">
              On the food street of the biggest village in Parañaque.
            </h2>
            <p className="mt-5 max-w-lg text-cream/85">
              Aguirre Avenue is where BF Homes eats. Concordia’s sits at 106 —
              open from first coffee to last slice, indoor and al fresco, with
              building parking if you’re driving in from the south fringe.
            </p>
          </div>
        </section>

        <section
          id="visit"
          className="bg-terracotta px-5 py-20 text-cream md:px-8 md:py-28"
        >
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-16">
            <div className="cafe-reveal">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-cream/70">
                Find us
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-cafe-display)] text-4xl italic md:text-5xl">
                106 Aguirre Ave
              </h2>
              <p className="mt-2 text-cream/85">BF Homes, Parañaque</p>
              <dl className="mt-8 space-y-5 text-sm">
                <div>
                  <dt className="uppercase tracking-[0.18em] text-cream/60">Hours</dt>
                  <dd className="mt-1 text-lg">{cafe.hours}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.18em] text-cream/60">Phone</dt>
                  <dd className="mt-1 text-lg">{cafe.phoneDisplay}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-[0.18em] text-cream/60">Socials</dt>
                  <dd className="mt-2 flex flex-wrap gap-4">
                    <a
                      href={cafe.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
                    >
                      Facebook
                    </a>
                    <a
                      href={cafe.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
                    >
                      {cafe.instagramHandle}
                    </a>
                  </dd>
                </div>
              </dl>
              <a
                href={cafe.mapsQuery}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-full border border-cream px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.16em] hover:bg-cream hover:text-terracotta"
              >
                Open map
              </a>
            </div>
            <div className="cafe-reveal overflow-hidden bg-cream/10">
              <iframe
                title="Map of Concordia’s Cafe, 106 Aguirre Ave, BF Homes, Parañaque"
                src={cafe.mapsEmbed}
                className="h-[22rem] w-full grayscale-[0.15] contrast-[1.05] md:h-full min-h-[22rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-charcoal px-5 py-8 text-bone md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-amber">
              KantoCo
            </p>
            <p className="mt-2 max-w-sm text-sm text-concrete">
              {cafe.disclaimer}
            </p>
            <p className="mt-2 text-xs text-steel">
              Sample only. Photography is generated demo stills, not the cafe’s
              own.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm sm:items-end">
            <Link
              href="/"
              className="text-concrete transition hover:text-bone"
            >
              ← KantoCo agency
            </Link>
            <a
              href={site.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber transition hover:brightness-110"
            >
              Message KantoCo →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
