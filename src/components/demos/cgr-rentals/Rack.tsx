"use client";

/**
 * Round 7.5 (Design stamp r7.5: sections.html / sections.css / spec.md): two
 * rooms after the intro, on ivory and cream with a faint wine tulle net.
 *
 * 1 Catalogue (#gowns, ivory): the h2, lede, rack rows and CTAs on the left;
 *   a strip of five gowns on blush mats tilted in 3D on the right (desktop),
 *   with a magnifier that follows a fine pointer over a gown; a blush band of
 *   accessories (#accessories) closes it.
 * 2 Men's (#suits, cream): two barong mats bleed off the left, the h2, lede
 *   and CTA on the right with the two suits below, and the KantoCo pitch.
 *
 * Phones (and up to 899px): no tilt. Every photo sits in a staggered
 * two-column grid, so none starts off screen (the r7.4 strips hid the first
 * card at 390). Desktop motion: the strip drifts 24px along its axis with
 * the scroll (--parallax), cards lift 6px on hover. Reduced motion: static.
 *
 * Shop photos (photos/SOURCES.md) are photo-only: no listing, rate, size or
 * calendar is invented for them, so their captions say "ask the shop". Only
 * the blue ball gown and the accessories are listings (example rates).
 * Fixed card boxes (no CLS), lazy-loaded.
 *
 * A condensed 64px nav slides in under the sample bar while a room is on
 * screen. It is fixed, moves by transform only and is not focusable when hidden.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CGR_ASSET,
  CGR_BASE,
  CGR_PHOTOS,
  GOWNS,
  SHOP_PHOTOS,
  cgr,
  formatPhp,
  type Gown,
  type ShopPhoto,
} from "@/lib/cgr-rentals";
import { KANTOCO_MESSENGER } from "@/lib/demos";
import { useMotionReady } from "@/components/motion/useMotionReady";
import { MobileMenu } from "@/components/demos/cgr-rentals/MobileMenu";

gsap.registerPlugin(ScrollTrigger);

const bySlug = (s: string) => GOWNS.find((g) => g.slug === s) as Gown;

/** A card: a listing (links to its page, example rate) or a shop photo. */
type Card =
  | { kind: "gown"; g: Gown; name: string; cat: string; pos?: string; floor?: boolean }
  | { kind: "photo"; p: ShopPhoto; name: string; cat: string; pos?: string };

/** Far to near, the stamp's order: the nearest (ivory veil) is the largest. */
const GOWN_CARDS: Card[] = [
  { kind: "gown", g: bySlug("blue-ball-gown"), name: "Blue ball gown", cat: "Debut and ball", floor: true },
  { kind: "photo", p: SHOP_PHOTOS.filipiniana, name: "Black beaded Filipiniana", cat: "Filipiniana" },
  { kind: "photo", p: SHOP_PHOTOS.goldCape, name: "Gold beaded cape gown", cat: "Evening and gala" },
  { kind: "photo", p: SHOP_PHOTOS.ivoryBall, name: "Ivory ball gown", cat: "Bridal and ivory", pos: "50% 30%" },
  { kind: "photo", p: SHOP_PHOTOS.ivoryVeil, name: "Ivory gown with veil", cat: "Bridal and ivory", pos: "50% 12%" },
];

const ACC = ["ruby-pageant-crown", "rose-stone-tiara", "crystal-choker", "gold-crystal-tiaras"].map(bySlug);
const ACC_FROM = Math.min(...GOWNS.filter((g) => g.category === "accessory").map((g) => g.pricePerDay));

const SN_LINKS = [
  ["Gowns", `${CGR_BASE}#gowns`],
  ["Accessories", `${CGR_BASE}#accessories`],
  ["Visit", `${CGR_BASE}#visit`],
] as const;

const SN_MENU = [...SN_LINKS, ["Owner view", `${CGR_BASE}/owner`]] as const;

type Row = { name: string; note?: string; href: string; on?: boolean };
const RACKS: Row[] = [
  { name: "Bridal and ivory", note: "3 shown", href: "#gowns-strip", on: true },
  { name: "Debut and ball gowns", href: "#rail" },
  { name: "Filipiniana", href: "#gowns-strip" },
  { name: "Evening and gala", href: "#rail" },
  { name: "Suits and barong", href: "#suits" },
];

function Img({ c }: { c: Card }) {
  if (c.kind === "gown") {
    const img = c.g.images[0];
    return (
      // eslint-disable-next-line @next/next/no-img-element -- fixed-size cards, local webp
      <img
        src={`${CGR_ASSET}/${img.file}.webp`}
        alt={img.alt}
        width={img.w}
        height={img.h}
        loading="lazy"
        decoding="async"
        className={c.floor ? "is-floorcrop" : undefined}
        style={c.pos ? { objectPosition: c.pos } : undefined}
      />
    );
  }
  return (
    <picture>
      <source srcSet={`${CGR_PHOTOS}/${c.p.file}.avif`} type="image/avif" />
      <img
        src={`${CGR_PHOTOS}/${c.p.file}.webp`}
        alt={c.p.alt}
        width={c.p.w}
        height={c.p.h}
        loading="lazy"
        decoding="async"
        style={c.pos ? { objectPosition: c.pos } : undefined}
      />
    </picture>
  );
}

function GownCard({ c }: { c: Card }) {
  const inner = (
    <>
      <span className="cgr-rk-im">
        <Img c={c} />
      </span>
      <span className="cgr-rk-cap">
        <b>{c.name}</b>
        {c.kind === "gown" ? `${c.cat} · ${formatPhp(c.g.pricePerDay)} a day, example rate` : `${c.cat} · ask the shop`}
      </span>
    </>
  );
  return c.kind === "gown" ? (
    <Link href={`${CGR_BASE}/gown/${c.g.slug}`} className="cgr-rk-card">
      {inner}
    </Link>
  ) : (
    <div className="cgr-rk-card is-shop">{inner}</div>
  );
}

function Mat({ p, className, pos }: { p: ShopPhoto; className: string; pos?: string }) {
  return (
    <div className={`cgr-mat ${className}`}>
      <picture>
        <source srcSet={`${CGR_PHOTOS}/${p.file}.avif`} type="image/avif" />
        <img
          src={`${CGR_PHOTOS}/${p.file}.webp`}
          alt={p.alt}
          width={p.w}
          height={p.h}
          loading="lazy"
          decoding="async"
          style={pos ? { objectPosition: pos } : undefined}
        />
      </picture>
    </div>
  );
}

/**
 * Magnifier (spec.md): a round ivory-rimmed lens that follows a fine pointer
 * over a gown with a 450 ms silk lag and fades in over 900 ms. Hover-capable
 * fine pointers at 900px+ only; touch never sees it. Decorative (aria-hidden):
 * the photo itself keeps its alt text.
 */
const LENS = 200;
const ZOOM = 2.4;
function useLens(stage: React.RefObject<HTMLDivElement | null>, lens: React.RefObject<HTMLDivElement | null>, reduced: boolean) {
  useEffect(() => {
    const st = stage.current;
    const ln = lens.current;
    if (!st || !ln) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 900px)");
    const dur = reduced ? 0 : 0.45;
    const ease = "power3.out";
    const toX = gsap.quickTo(ln, "x", { duration: dur, ease });
    const toY = gsap.quickTo(ln, "y", { duration: dur, ease });
    let shown = false;
    const hide = () => {
      shown = false;
      ln.dataset.on = "false";
    };
    const move = (e: PointerEvent) => {
      if (!mq.matches || e.pointerType !== "mouse") return hide();
      const img = (e.target as Element | null)?.closest(".cgr-rk-card")?.querySelector("img");
      if (!img || !img.complete || !img.naturalWidth) return hide();
      const r = img.getBoundingClientRect();
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      // object-fit: cover, so map the pointer through the cover scale and crop.
      const cs = Math.max(r.width / nw, r.height / nh);
      const pos = getComputedStyle(img).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
      const ox = (nw * cs - r.width) * (pos[0] ?? 0.5);
      const oy = (nh * cs - r.height) * (pos[1] ?? 0.5);
      const px = (e.clientX - r.left + ox) * ZOOM;
      const py = (e.clientY - r.top + oy) * ZOOM;
      ln.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
      ln.style.backgroundSize = `${nw * cs * ZOOM}px ${nh * cs * ZOOM}px`;
      ln.style.backgroundPosition = `${LENS / 2 - px}px ${LENS / 2 - py}px`;
      const x = e.clientX - LENS / 2;
      const y = e.clientY - LENS / 2;
      if (!shown) {
        gsap.set(ln, { x, y });
        shown = true;
        ln.dataset.on = "true";
      }
      toX(x);
      toY(y);
    };
    st.addEventListener("pointermove", move);
    st.addEventListener("pointerleave", hide);
    window.addEventListener("wheel", hide, { passive: true });
    return () => {
      st.removeEventListener("pointermove", move);
      st.removeEventListener("pointerleave", hide);
      window.removeEventListener("wheel", hide);
    };
  }, [stage, lens, reduced]);
}

type Tone = "light" | "dark";
type Active = "Gowns" | "Accessories" | "";

function RackNav({ on, tone, active }: { on: boolean; tone: Tone; active: Active }) {
  return (
    <div className="cgr-sn" data-on={on ? "true" : "false"} data-tone={tone}>
      <Link href={CGR_BASE} className="cgr-sn-wm" tabIndex={on ? undefined : -1}>
        Cavite Gown Rentals
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
        <Link href={`${CGR_BASE}#rail`} className="btn btn-wine btn-nav" tabIndex={on ? undefined : -1}>
          Hold a gown
        </Link>
      </nav>
      <div className="cgr-sn-mob">
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
  const stageRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
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

  useLens(stageRef, lensRef, reduced);

  // Desktop: the strip and the woven barong drift 24px (--parallax) with the
  // scroll, passing through the stamp's composition when the room fills the screen.
  useEffect(() => {
    const root = ref.current;
    if (!root || !ready || reduced) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px)", () => {
      const drift = (el: Element | null, sec: Element | null, prop: "x" | "y") => {
        if (!el || !sec) return;
        gsap.fromTo(
          el,
          { [prop]: -24 },
          {
            [prop]: 24,
            ease: "none",
            scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.8 },
          },
        );
      };
      drift(root.querySelector(".cgr-rk-track"), root.querySelector("#gowns"), "x");
      drift(root.querySelector(".cgr-mat-b"), root.querySelector("#suits"), "y");
    });
    return () => mm.revert();
  }, [ready, reduced]);

  return (
    <div ref={ref} className="cgr-rk-wrap" data-motion={reduced ? "static" : "on"}>
      <RackNav {...nav} />

      {/* 1 · Catalogue */}
      <section className="cgr-rk cgr-rk-cat ivory tulle" id="gowns" data-rack="light" aria-labelledby="cgr-rk-cat-t">
        <div className="cgr-rk-text">
          <h2 className="cgr-rk-h disp" id="cgr-rk-cat-t">
            Ivory, beaded <br />
            and <em>ball gowns</em>
          </h2>
          <p className="cgr-rk-lede">
            Open a gown to see the dates it is free, then ask to hold the day you need. The shop replies to confirm
            before anything is paid.
          </p>
          <ul className="cgr-rk-racks">
            {RACKS.map((r) => (
              <li key={r.name} className={r.on ? "is-on" : undefined}>
                <a href={r.href} aria-current={r.on ? "true" : undefined}>
                  <span>{r.name}</span>
                  {r.note ? <span className="n">{r.note}</span> : <span className="arrow" aria-hidden="true" />}
                </a>
              </li>
            ))}
          </ul>
          <div className="cgr-rk-ctas">
            <a href="#rail" className="btn btn-wine">
              See all gowns <span className="arrow" aria-hidden="true" />
            </a>
            <a href="#rail" className="btn btn-line">
              Hold a gown
            </a>
          </div>
        </div>
        <div className="cgr-rk-stage" id="gowns-strip" ref={stageRef} role="group" aria-label="Gowns">
          <div className="cgr-rk-strip">
            <div className="cgr-rk-track">
              {GOWN_CARDS.map((c) => (
                <GownCard key={c.name} c={c} />
              ))}
            </div>
          </div>
        </div>
        <p className="cgr-rk-note">Hover a gown to see the lace and beadwork up close.</p>
        <div className="cgr-lens" ref={lensRef} data-on="false" aria-hidden="true" />

        <div className="cgr-rk-band" id="accessories">
          <div className="cgr-rk-band-t">
            <h3 className="disp">
              Tiaras, crowns and <em>crystal sets</em>
            </h3>
            <p className="cgr-cap">To wear with your gown. From {formatPhp(ACC_FROM)} a day, example rate.</p>
          </div>
          <ul className="cgr-rk-thumbs">
            {ACC.map((g) => (
              <li key={g.slug}>
                <Link href={`${CGR_BASE}/gown/${g.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size thumbs, local webp */}
                  <img
                    src={`${CGR_ASSET}/${g.images[0].file}.webp`}
                    alt={g.name}
                    width={g.images[0].w}
                    height={g.images[0].h}
                    loading="lazy"
                    decoding="async"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <a className="cgr-more" href="#rail">
            See accessories
          </a>
        </div>
      </section>

      {/* 2 · Men's */}
      <section className="cgr-rk cgr-rk-men creamy tulle" id="suits" data-rack="light" aria-labelledby="cgr-rk-men-t">
        <div className="cgr-men-pics">
          <Mat p={SHOP_PHOTOS.barongEmbroidery} className="cgr-mat-a" pos="50% 30%" />
          <Mat p={SHOP_PHOTOS.barongWoven} className="cgr-mat-b" pos="50% 20%" />
          <p className="cgr-cap cgr-men-cap1">
            <b>Cream barong</b>
            Black embroidery, or a woven panel · ask the shop
          </p>
        </div>
        <div className="cgr-men-text">
          <h2 className="cgr-rk-h disp" id="cgr-rk-men-t">
            Suits and <em>barong</em>
          </h2>
          <p className="cgr-rk-lede">
            Cream barong with black embroidery or a woven front panel, and suits with beaded shoulders in royal blue and
            turquoise. For grooms, fathers, escorts and the men of the entourage.
          </p>
          <div className="cgr-rk-ctas">
            <a href={cgr.facebook} className="btn btn-line" target="_blank" rel="noopener noreferrer">
              See suits and barong <span className="arrow" aria-hidden="true" />
            </a>
          </div>
          <div className="cgr-men-suits">
            <figure>
              <Mat p={SHOP_PHOTOS.suitBlue} className="cgr-mat-s" pos="50% 20%" />
              <figcaption className="cgr-cap">
                <b>Royal-blue beaded suit</b>
                Suits · ask the shop
              </figcaption>
            </figure>
            <figure>
              <Mat p={SHOP_PHOTOS.suitTurquoise} className="cgr-mat-s" pos="50% 15%" />
              <figcaption className="cgr-cap">
                <b>Turquoise three-piece suit</b>
                Suits · ask the shop
              </figcaption>
            </figure>
          </div>
        </div>
        <p className="cgr-pitch">
          A sample site by KantoCo. Want one for your shop?{" "}
          <a href={KANTOCO_MESSENGER} target="_blank" rel="noopener noreferrer">
            m.me/kantocoph
          </a>
        </p>
      </section>
    </div>
  );
}
