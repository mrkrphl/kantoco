"use client";

import Link from "next/link";
import { site } from "@/lib/config";
import { cafe } from "@/lib/cafe";
import ArchMark from "./ArchMark";
import WalkIn from "./WalkIn";

export default function ConcordiaExperience() {
  return (
    <div className="cafe-root bg-cream text-navy">
      <p className="sticky top-0 z-50 bg-cream px-4 py-2 text-center text-[0.7rem] font-medium tracking-wide text-navy md:text-xs">
        {cafe.disclaimer}
      </p>

      <WalkIn />

      <section id="visit" className="bg-cream px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="font-[family-name:var(--font-cafe-display)] text-5xl leading-[0.9] tracking-tight md:text-7xl">
              CON
              <br />
              COR
              <br />
              DIA&apos;S
            </p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-navy/80">
              A private labeled sample of their room. Night facade, glass,
              the room, then the cup. Not a pitch. Facebook and Instagram are
              the live pages.
            </p>
          </div>
          <dl className="space-y-5 text-sm">
            <div>
              <dt className="uppercase tracking-[0.16em] text-navy/45">Find us</dt>
              <dd className="mt-1 text-lg">{cafe.addressFull}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.16em] text-navy/45">Hours</dt>
              <dd className="mt-1 text-lg">{cafe.hoursPlain}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.16em] text-navy/45">Phone</dt>
              <dd className="mt-1 text-lg">
                <a href={cafe.phoneHref} className="underline decoration-navy/30 underline-offset-4">
                  {cafe.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.16em] text-navy/45">Live presence</dt>
              <dd className="mt-2 flex flex-wrap gap-4">
                <a
                  href={cafe.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline decoration-cornflower underline-offset-4"
                >
                  Facebook
                </a>
                <a
                  href={cafe.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline decoration-cornflower underline-offset-4"
                >
                  Instagram {cafe.instagramHandle}
                </a>
              </dd>
            </div>
            <a
              href={cafe.mapsQuery}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit bg-navy px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-cream hover:bg-cornflower"
            >
              Open map
            </a>
          </dl>
        </div>
      </section>

      <div className="overflow-hidden bg-cream">
        <iframe
          title="Map of Concordia's Cafe, 106 Aguirre Ave, BF Homes, Paranaque"
          src={cafe.mapsEmbed}
          className="h-72 w-full contrast-[1.04] grayscale-[0.2] md:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <footer className="bg-navy px-5 py-10 text-cream md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <ArchMark className="h-10 w-10" />
            <p className="mt-4 text-sm text-cream/75">{cafe.disclaimer}</p>
            <p className="mt-2 text-xs text-cream/55">{cafe.photoCredit}</p>
          </div>
          <div className="flex flex-col items-start gap-2 text-sm sm:items-end">
            <p className="font-semibold tracking-wide text-amber">KantoCo</p>
            <Link href="/" className="text-cream/70 hover:text-cream">
              Back to the agency
            </Link>
            <a
              href={site.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-amber hover:brightness-110"
            >
              Message KantoCo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
