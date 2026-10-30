"use client";

/**
 * Round 7.3 (stamp r7.3): the four racks after the intro, replacing the mood
 * board. 1 Catalogue (ivory, #gowns) · 2 Filipiniana and sagala band (cream)
 * · 3 Men's formal (black) · 4 Accessories (ivory, #accessories).
 *
 * Each rack is a left text column plus a strip of cards tilted in 3D
 * (rotateY about its right edge, nearest card bleeding off the right). On
 * desktop the page scroll drifts each strip along its own axis (scrub);
 * phones and reduced motion get the static composition. Only the repo's own
 * photos are used; racks without photos get dashed empty cards (no invented
 * items, rates or photos).
 *
 * r7.4: face-free shop photos from the public FB page (photos/SOURCES.md) are
 * photo-only cards: ivory and gold take the gown strip slots that re-used the
 * red/blue crops, one filipiniana fills the band (sagala keeps its "no photo
 * yet" placeholders), and two suits + two barong fill the men's rack. They are
 * not listings: no rate, size or calendar, every caption says ask the shop.
 * AVIF with a WebP fallback, fixed card boxes (no CLS), lazy-loaded.
 *
 * A condensed 64px nav (stamp §3.1) slides in under the sample bar while a
 * rack is on screen. It is fixed and moves by transform only (no layout
 * shift) and is hidden (not focusable) otherwise.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CGR_ASSET,
  CGR_BASE,
  CGR_PHOTOS,
  DRESSES,
  GOWNS,
  SHOP_PHOTOS,
  formatPhp,
  type Gown,
  type ShopPhoto,
} from "@/lib/cgr-rentals";
import { useMotionReady } from "@/components/motion/useMotionReady";
import { MobileMenu } from "@/components/demos/cgr-rentals/MobileMenu";

gsap.registerPlugin(ScrollTrigger);

const bySlug = (s: string) => GOWNS.find((g) => g.slug === s) as Gown;

type StripItem = { kind: "gown"; g: Gown } | { kind: "photo"; p: ShopPhoto };
const gown = (s: string): StripItem => ({ kind: "gown", g: bySlug(s) });
const photo = (p: ShopPhoto): StripItem => ({ kind: "photo", p });

/**
 * Far to near (the last card is the nearest, bleeding off the right). r7.4:
 * the shop's ivory and gold photos replace the three strip slots whose
 * listings only re-used the red/blue crops (those listings stay in the rail),
 * placed where the static composition shows them (phones see the last 3).
 */
const GOWN_STRIP: StripItem[] = [
  gown("blue-ruffle-debut"),
  gown("blue-ball-gown"),
  photo(SHOP_PHOTOS.ivoryBall),
  photo(SHOP_PHOTOS.goldCape),
  photo(SHOP_PHOTOS.ivoryVeil),
  gown("red-sequin-evening"),
];

const MEN_STRIP: ShopPhoto[] = [
  SHOP_PHOTOS.suitBlue,
  SHOP_PHOTOS.barongWoven,
  SHOP_PHOTOS.suitTurquoise,
  SHOP_PHOTOS.barongEmbroidery,
];

const ACC_STRIP = [
  "crystal-bracelet",
  "crystal-choker",
  "crown-display-set",
  "rose-stone-tiara",
  "ruby-pageant-crown",
  "gold-crystal-tiaras",
].map(bySlug);

const SN_LINKS = [
  ["Gowns", `${CGR_BASE}#gowns`],
  ["Accessories", `${CGR_BASE}#accessories`],
  ["Visit", `${CGR_BASE}#visit`],
] as const;

const SN_MENU = [...SN_LINKS, ["Owner view", `${CGR_BASE}/owner`]] as const;

const GOWN_COUNT = DRESSES.length;
const ACC_COUNT = ACC_STRIP.length;

type Cat = { n: string; name: string; count: string; href: string; on?: boolean; empty?: boolean };

const CATS: Cat[] = [
  { n: "01", name: "Gowns", count: `${GOWN_COUNT} pieces`, href: "#rail", on: true },
  { n: "02", name: "Filipiniana and sagala", count: "ask the shop", href: "#filipiniana" },
  { n: "03", name: "Men's formal", count: "ask the shop", href: "#suits" },
  { n: "04", name: "Accessories", count: `${ACC_COUNT} pieces`, href: "#accessories" },
];

function PhotoCard({ g }: { g: Gown }) {
  const img = g.images[0];
  return (
    <Link href={`${CGR_BASE}/gown/${g.slug}`} className="cgr-rk-card">
      <span className="cgr-rk-im">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size cards, local webp */}
        <img
          src={`${CGR_ASSET}/${img.file}.webp`}
          alt={img.alt}
          width={img.w}
          height={img.h}
          loading="lazy"
          decoding="async"
        />
      </span>
      <span className="cgr-rk-cap">
        <b>{g.name}</b>
        {formatPhp(g.pricePerDay)} a day · example
      </span>
    </Link>
  );
}

/** r7.4: a shop photo with no listing behind it (no link, rate or calendar). */
function ShopCard({ p }: { p: ShopPhoto }) {
  return (
    <div className="cgr-rk-card is-shop">
      <span className="cgr-rk-im">
        <picture>
          <source srcSet={`${CGR_PHOTOS}/${p.file}.avif`} type="image/avif" />
          <img
            src={`${CGR_PHOTOS}/${p.file}.webp`}
            alt={p.alt}
            width={p.w}
            height={p.h}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </span>
      <span className="cgr-rk-cap">
        <b>{p.label}</b>
        ask the shop for rates
      </span>
    </div>
  );
}

function EmptyCard({ word }: { word: string }) {
  return (
    <div className="cgr-rk-card is-none" aria-hidden="true">
      <span className="cgr-rk-im">
        <span className="cgr-rk-tag">no photo yet</span>
        <span className="cgr-rk-word">{word}</span>
      </span>
      <span className="cgr-rk-cap">
        <b>{word}</b>
        ask the shop for rates
      </span>
    </div>
  );
}

function Strip({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="cgr-rk-stage" role={label ? "group" : undefined} aria-label={label}>
      <div className="cgr-rk-strip">
        <div className="cgr-rk-track">{children}</div>
      </div>
    </div>
  );
}

function CatRows() {
  return (
    <ul className="cgr-rk-cats">
      {CATS.map((c) => (
        <li key={c.n} className={c.on ? "is-on" : c.empty ? "is-empty" : undefined}>
          <a href={c.href}>
            <span className="cgr-rk-n">{c.n}</span>
            <span className="cgr-rk-nm">{c.name}</span>
            <span className="cgr-rk-ct">{c.empty ? <span className="cgr-rk-ph">{c.count}</span> : c.count}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

type Tone = "light" | "dark";
type Active = "Gowns" | "Accessories" | "";

function RackNav({ on, tone, active }: { on: boolean; tone: Tone; active: Active }) {
  return (
    <div className="cgr-sn" data-on={on ? "true" : "false"} data-tone={tone}>
      <Link href={CGR_BASE} className="cgr-sn-wm" tabIndex={on ? undefined : -1}>
        cavite gown rentals
      </Link>
      <nav className="cgr-sn-nav" aria-label="Sections">
        {SN_LINKS.map(([label, href]) => (
          <Link
            key={label}
            href={href}
            className="cgr-sn-a"
            data-active={active === label ? "true" : undefined}
            tabIndex={on ? undefined : -1}
          >
            {label}
          </Link>
        ))}
        <Link href={`${CGR_BASE}#gowns`} className="btn btn-nav" tabIndex={on ? undefined : -1}>
          Hold a gown
        </Link>
      </nav>
      <div className="cgr-sn-mob">
        <Link href={`${CGR_BASE}#gowns`} className="btn btn-nav" tabIndex={on ? undefined : -1}>
          Hold
        </Link>
        {on ? (
          <MobileMenu
            items={SN_MENU.map(([label, href]) => ({ label, href, on: label === active }))}
          />
        ) : null}
      </div>
    </div>
  );
}

export function Rack() {
  const ref = useRef<HTMLDivElement>(null);
  const { ready, reduced } = useMotionReady();
  const [nav, setNav] = useState<{ on: boolean; tone: Tone; active: Active }>({
    on: false,
    tone: "light",
    active: "",
  });

  // Condensed nav: on while any rack sits under the sample bar.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const racks = Array.from(root.querySelectorAll<HTMLElement>("[data-rack]"));
    let raf = 0;
    const read = () => {
      raf = 0;
      const bar = parseFloat(getComputedStyle(root).getPropertyValue("--bar-h")) || 24;
      const y = bar + 32;
      const hit = racks.find((r) => {
        const b = r.getBoundingClientRect();
        return b.top <= y && b.bottom > y;
      });
      const next = hit
        ? {
            on: true,
            tone: (hit.dataset.rack === "dark" ? "dark" : "light") as Tone,
            active: (hit.id === "gowns" ? "Gowns" : hit.id === "accessories" ? "Accessories" : "") as Active,
          }
        : { on: false, tone: "light" as Tone, active: "" as Active };
      setNav((p) => (p.on === next.on && p.tone === next.tone && p.active === next.active ? p : next));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Desktop scrub: each strip drifts along its own (tilted) axis, passing
  // through the stamp's composition (x 0) when the rack fills the screen.
  useEffect(() => {
    const root = ref.current;
    if (!root || !ready || reduced) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      root.querySelectorAll<HTMLElement>("[data-rack]").forEach((sec) => {
        const track = sec.querySelector<HTMLElement>(".cgr-rk-track");
        if (!track) return;
        gsap.fromTo(
          track,
          { xPercent: -9 },
          {
            xPercent: 9,
            ease: "none",
            scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      });
    });
    return () => mm.revert();
  }, [ready, reduced]);

  return (
    <div ref={ref} className="cgr-rk-wrap" data-motion={reduced ? "static" : "on"}>
      <RackNav {...nav} />

      {/* 1 · Catalogue */}
      <section className="cgr-rk cgr-rk-cat ivory grain" id="gowns" data-rack="light" aria-labelledby="cgr-rk-cat-t">
        <div className="cgr-rk-text">
          <h2 className="cgr-rk-h ext" id="cgr-rk-cat-t">
            What&rsquo;s on <br />
            the rack
          </h2>
          <p className="cgr-rk-lead">
            Six gowns and six accessories, each with its own calendar. Tap one to see its open dates.
          </p>
          <div className="cgr-rk-list">
            <CatRows />
            <div className="cgr-rk-ctas">
              <a href="#rail" className="btn">
                See the {GOWN_COUNT} gowns
              </a>
              <a href="#accessories" className="ulink">
                Accessories
              </a>
            </div>
          </div>
        </div>
        <Strip label="Gowns">
          {GOWN_STRIP.map((it) =>
            it.kind === "gown" ? <PhotoCard key={it.g.slug} g={it.g} /> : <ShopCard key={it.p.file} p={it.p} />,
          )}
        </Strip>
        <span className="cgr-rk-floor" aria-hidden="true" />
      </section>

      {/* 2 · Filipiniana and sagala (band) */}
      <section className="cgr-rk cgr-rk-fil cream grain" id="filipiniana" data-rack="light" aria-labelledby="cgr-rk-fil-t">
        <div className="cgr-rk-text">
          <h2 className="cgr-rk-h ext" id="cgr-rk-fil-t">
            Filipiniana <br />
            and sagala
          </h2>
          <p className="cgr-rk-pt">
            <span className="cgr-rk-ptag">Placeholder copy · not from the shop</span>
          </p>
          <p className="cgr-rk-lead">
            The shop lists filipiniana and sagala gowns. Ask the shop what&rsquo;s on the rack for your date.
          </p>
          <a href="#visit" className="ulink">
            Call or message the shop
          </a>
        </div>
        {/* r7.4: one face-free filipiniana photo; no sagala photo exists, so sagala keeps its placeholders. */}
        <Strip label="Filipiniana and sagala">
          <EmptyCard word="Sagala" />
          <ShopCard p={SHOP_PHOTOS.filipiniana} />
          <EmptyCard word="Sagala" />
        </Strip>
      </section>

      {/* 3 · Men's formal */}
      <section className="cgr-rk cgr-rk-men dark grain" id="suits" data-rack="dark" aria-labelledby="cgr-rk-men-t">
        <div className="cgr-rk-text">
          <h2 className="cgr-rk-h ext" id="cgr-rk-men-t">
            Suits and <br />
            barong
          </h2>
          <p className="cgr-rk-pt">
            <span className="cgr-rk-ptag">Placeholder copy · not from the shop</span>
          </p>
          <p className="cgr-rk-lead">For weddings, proms and formal nights. Ask the shop for sizes and rates.</p>
          <div className="cgr-rk-ctas">
            <a href="#gowns" className="btn btn-ghost cgr-rk-ghost">
              Back to gowns
            </a>
          </div>
        </div>
        <Strip label="Suits and barong">
          {MEN_STRIP.map((p) => (
            <ShopCard key={p.file} p={p} />
          ))}
        </Strip>
        {/* r7.3.1: the "Other racks" kicker is gone; the label lives on as the nav name. */}
        <nav className="cgr-rk-other" aria-label="Other racks">
          <a href="#gowns">
            01 Gowns <small>{GOWN_COUNT} pieces</small>
          </a>
          <a href="#filipiniana">
            02 Filipiniana and sagala <small>ask the shop</small>
          </a>
          <a href="#accessories">
            04 Accessories <small>{ACC_COUNT} pieces</small>
          </a>
        </nav>
      </section>

      {/* 4 · Accessories */}
      <section className="cgr-rk cgr-rk-acc ivory grain" id="accessories" data-rack="light" aria-labelledby="cgr-rk-acc-t">
        <div className="cgr-rk-text">
          <h2 className="cgr-rk-h ext" id="cgr-rk-acc-t">
            Tiaras and <br />
            crystals
          </h2>
          <p className="cgr-rk-lead">
            Crowns, tiaras, a choker and a bracelet. Rent them with a gown or on their own.
          </p>
          <div className="cgr-rk-list">
            <ul className="cgr-rk-cats">
              <li>
                <span className="cgr-rk-row">
                  <span className="cgr-rk-n">a</span>
                  <span className="cgr-rk-nm">Tiaras and crowns</span>
                  <span className="cgr-rk-ct">4 pieces</span>
                </span>
              </li>
              <li>
                <span className="cgr-rk-row">
                  <span className="cgr-rk-n">b</span>
                  <span className="cgr-rk-nm">Choker and bracelet</span>
                  <span className="cgr-rk-ct">2 pieces</span>
                </span>
              </li>
            </ul>
            <div className="cgr-rk-ctas">
              <a href="#rail" className="btn">
                See the {ACC_COUNT} accessories
              </a>
            </div>
          </div>
        </div>
        <Strip label="Accessories">
          {ACC_STRIP.map((g) => (
            <PhotoCard key={g.slug} g={g} />
          ))}
        </Strip>
        <span className="cgr-rk-floor" aria-hidden="true" />
      </section>
    </div>
  );
}
