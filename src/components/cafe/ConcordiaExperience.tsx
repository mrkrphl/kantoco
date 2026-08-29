"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { site } from "@/lib/config";
import { cafe, plates } from "@/lib/cafe";
import ArchMark from "./ArchMark";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function ConcordiaExperience() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".hero-photo",
          { scale: 1.06 },
          { scale: 1, duration: 1.8, ease: "power3.out" },
        );

        gsap.from(".hero-line", {
          y: 24,
          autoAlpha: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: "power3.out",
        });

        ScrollTrigger.create({
          trigger: ".lcd-pin",
          start: "top top",
          end: "+=140%",
          pin: true,
          anticipatePin: 1,
        });

        gsap.utils.toArray<HTMLElement>(".plate-reveal").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0 0 0)" },
            {
              clipPath: "inset(0% 0 0 0)",
              duration: 1.05,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 82%",
                toggleActions: "play none none none",
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="cafe-root bg-cream text-navy">
      <p className="sticky top-0 z-50 bg-cream px-4 py-2 text-center text-[0.7rem] font-medium tracking-wide text-navy md:text-xs">
        {cafe.disclaimer}
      </p>

      <section className="relative min-h-[100svh] overflow-hidden bg-navy">
        <div className="hero-photo absolute inset-0 origin-center will-change-transform">
          <Image
            src="/demos/concordias-cafe/day-interior.webp"
            alt="Daylight interior of Concordia's Cafe: concrete walls, white steel trusses, fluted tables. Photo: Zoy to the World."
            fill
            priority
            className="object-cover object-[center_40%]"
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-r from-navy/75 via-navy/35 to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-navy/25"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-between px-5 py-8 md:px-8 md:py-10">
          <div className="hero-line flex items-start gap-3">
            <ArchMark className="h-12 w-12 shrink-0 md:h-14 md:w-14" />
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-cream md:text-[0.7rem]">
                {cafe.tagline}
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cornflower md:text-[0.7rem]">
                {cafe.lockup}
              </p>
            </div>
          </div>

          <div className="max-w-3xl pb-16 md:pb-20">
            <h1 className="font-[family-name:var(--font-cafe-display)] text-[clamp(4.2rem,18vw,11rem)] leading-[0.82] tracking-[-0.03em] text-cream">
              <span className="hero-line block">OPEN</span>
              <span className="hero-line mt-1 block text-[0.42em] tracking-[-0.02em] md:text-[0.38em]">
                {cafe.hoursLine}
              </span>
            </h1>
            <p className="hero-line mt-5 font-[family-name:var(--font-cafe-accent)] text-xl italic text-cream md:text-2xl">
              Pet-friendly. Photobooth. Come hang.
            </p>
            <p className="hero-line mt-4 text-sm text-cream md:text-base">
              {cafe.addressLine}
            </p>
            <p className="hero-line mt-1 text-sm text-cream md:text-base">
              <a
                href={cafe.phoneHref}
                className="font-semibold underline decoration-cream/40 underline-offset-4 hover:decoration-cream"
              >
                Reserve {cafe.phoneDisplay}
              </a>
              {" · no DMs"}
            </p>
          </div>
        </div>

        <p className="absolute bottom-5 left-5 z-10 bg-navy px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-cream md:left-8">
          {cafe.lookPass}
        </p>
        <p className="absolute bottom-5 right-5 z-10 text-[0.6rem] text-cream/80 md:right-8">
          {cafe.photoCredit}
        </p>
      </section>

      <section className="bg-cream px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl items-end gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cornflower">
              106 Aguirre
            </p>
            <p className="mt-4 font-[family-name:var(--font-cafe-display)] text-5xl leading-[0.9] tracking-tight text-navy md:text-7xl">
              CON
              <br />
              COR
              <br />
              DIA&apos;S
            </p>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-navy/80">
              Concrete, white steel, glass block, vines. Fluted white bases.
              Beige tile. A hangout on the food street of BF Homes, not a lunch
              counter that closes at 3.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden md:aspect-[5/4]">
            <Image
              src="/demos/concordias-cafe/al-fresco.webp"
              alt="Al fresco court at Concordia's Cafe with navy tables, vines, and the neon arch. Photo: Zoy to the World."
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </div>
        </div>
      </section>

      <section className="lcd-pin relative h-[100svh] overflow-hidden bg-navy">
        <Image
          src="/demos/concordias-cafe/lcd-wall.webp"
          alt="LCD wall of four vertical screens set in a concrete alcove at Concordia's Cafe. Photo: Zoy to the World."
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/15 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-5 bottom-10 z-10 max-w-xl md:inset-x-10">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cornflower-2">
            The wall
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-cafe-display)] text-5xl leading-[0.9] tracking-tight text-cream md:text-7xl">
            LCD, pinned
            <br />
            to the room.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/90 md:text-base">
            Four screens in the concrete alcove. Teal lives on the glass, not as
            a wash on the page.
          </p>
        </div>
      </section>

      <section id="menu" className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 pb-6 pt-16 md:px-8 md:pt-24">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-terracotta">
            From the plates
          </p>
          <h2 className="mt-3 max-w-xl font-[family-name:var(--font-cafe-display)] text-5xl leading-[0.9] tracking-tight text-navy md:text-7xl">
            Real food.
            <br />
            Visitor photos.
          </h2>
          <p className="mt-4 max-w-md text-navy/75">
            Pancake, bangus, kaldereta, Angus. Spanish latte is on the drinks
            wall. This is a sample menu, not a live order sheet.
          </p>
        </div>

        <ul>
          {plates.map((plate, i) => (
            <li
              key={plate.key}
              className={`border-t border-navy/10 ${i % 2 === 1 ? "bg-cream" : "bg-[#e7e2d6]"}`}
            >
              <div
                className={`mx-auto grid max-w-6xl items-center gap-0 md:grid-cols-2 ${
                  i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="plate-reveal relative aspect-[5/4] overflow-hidden">
                  <Image
                    src={plate.src}
                    alt={plate.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="px-5 py-10 md:px-12">
                  <p className="font-[family-name:var(--font-cafe-display)] text-4xl leading-none tracking-tight text-navy md:text-5xl">
                    {plate.title}
                  </p>
                  <p className="mt-3 max-w-sm text-navy/75">{plate.note}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="bg-navy px-5 py-14 text-cream md:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <p className="font-[family-name:var(--font-cafe-display)] text-4xl leading-none tracking-tight md:text-5xl">
              SPANISH LATTE
            </p>
            <p className="max-w-sm text-sm text-cream/80">
              On the drinks wall with flat whites. We do not have a visitor
              plate of the latte, so we are not inventing one.
            </p>
          </div>
        </div>
      </section>

      <section
        id="visit"
        className="grid bg-cream md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
      >
        <div className="relative min-h-[28rem] md:min-h-[40rem]">
          <Image
            src="/demos/concordias-cafe/photobooth.webp"
            alt="Photobooth kiosk with stacked CON COR DIA'S wordmark. Photo: Zoy to the World."
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-between px-5 py-12 md:px-10 md:py-16">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ochre">
              Coffee + memories
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-cafe-display)] text-5xl leading-[0.9] tracking-tight text-navy md:text-6xl">
              PHOTOBOOTH
              <br />
              ~P150
            </h2>
            <p className="mt-4 max-w-sm text-navy/75">
              Families, friends, the table that stays too long. Homey.
              Pet-friendly. Outlets if you work through the afternoon.
            </p>
          </div>
          <dl className="mt-10 space-y-5 text-sm">
            <div>
              <dt className="uppercase tracking-[0.16em] text-navy/45">Find us</dt>
              <dd className="mt-1 text-lg text-navy">{cafe.addressFull}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.16em] text-navy/45">Hours</dt>
              <dd className="mt-1 text-lg text-navy">{cafe.hoursPlain}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.16em] text-navy/45">Phone</dt>
              <dd className="mt-1 text-lg text-navy">
                <a href={cafe.phoneHref} className="underline decoration-navy/30 underline-offset-4">
                  {cafe.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.16em] text-navy/45">Public pages</dt>
              <dd className="mt-2 flex flex-wrap gap-4">
                <a
                  href={cafe.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-navy underline decoration-cornflower underline-offset-4"
                >
                  Facebook
                </a>
                <a
                  href={cafe.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-navy underline decoration-cornflower underline-offset-4"
                >
                  Instagram {cafe.instagramHandle}
                </a>
              </dd>
            </div>
          </dl>
          <a
            href={cafe.mapsQuery}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-fit bg-navy px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-cream hover:bg-cornflower"
          >
            Open map
          </a>
        </div>
      </section>

      <section className="relative min-h-[70svh] overflow-hidden bg-navy">
        <Image
          src="/demos/concordias-cafe/night-facade.webp"
          alt="Night facade of Concordia's Cafe with backlit CONCORDIA'S CAFE sign and neon arch. Photo: Zoy to the World."
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-navy/35" aria-hidden />
        <div className="absolute inset-x-5 bottom-10 z-10 md:inset-x-10">
          <p className="font-[family-name:var(--font-cafe-display)] text-5xl leading-none tracking-tight text-cream md:text-7xl">
            106 AGUIRRE
          </p>
          <p className="mt-2 text-cream/85">BF Homes, Paranaque. Building parking out front.</p>
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
