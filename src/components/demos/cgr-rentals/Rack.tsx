"use client";

/**
 * Round 7.6 (Design stamp r7.6: sections.html / sections.css / spec.md): the
 * rooms after the cover are lookbook spreads on ivory and cream with a faint
 * wine tulle net. Each spread has a blush numeral, one framed photo with an
 * offset hairline, an ivory-matted photo, a Pinyon Script word over the
 * photos, a text column with a floated mat and a pull quote, and numbered
 * captions.
 *
 * 01 Bridal (#gowns, ivory) with the contents band; 03 Filipiniana
 * (#filipiniana, cream), whose two small mats are CSS detail crops of its
 * one photo, entering with a page turn; the r7.5 blush accessories band
 * (#accessories); 05 Barong (#suits, cream) with the two suits and the
 * KantoCo pitch. 02 and 04 are not drawn in the stamp, so their contents
 * links go to the catalogue (#rail).
 *
 * Desktop (1024+): the stamp's 1366 composition in container units; motion
 * on, the script words drift 48px and the framed photos 24px with the
 * scroll, and spread 03 wipes in over 01 (clip-path, ~70vh). Below 1024 each
 * spread stacks as the stamp's phone page. Reduced motion: still.
 *
 * Shop photos (photos/SOURCES.md) are photo-only: no listing, rate, size or
 * calendar is invented for them, so their captions say "ask the shop".
 * Fixed photo boxes (no CLS), lazy-loaded.
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

const ACC = ["ruby-pageant-crown", "rose-stone-tiara", "crystal-choker", "gold-crystal-tiaras"].map(bySlug);
const ACC_FROM = Math.min(...GOWNS.filter((g) => g.category === "accessory").map((g) => g.pricePerDay));

const SN_LINKS = [
  ["Gowns", `${CGR_BASE}#gowns`],
  ["Accessories", `${CGR_BASE}#accessories`],
  ["Visit", `${CGR_BASE}#visit`],
] as const;

const SN_MENU = [...SN_LINKS, ["Owner view", `${CGR_BASE}/owner`]] as const;

/** The catalogue's contents band (spread 01). */
const TOC = [
  { n: "01", name: "Bridal", href: "#gowns", on: true },
  { n: "02", name: "Debut and ball", href: "#rail" },
  { n: "03", name: "Filipiniana", href: "#filipiniana" },
  { n: "04", name: "Evening and gala", href: "#rail" },
  { n: "05", name: "Barong and suits", href: "#suits" },
];

/** One shop photo in a box: framed, matted, or a detail crop of the photo. */
function Ph({
  p,
  className,
  pos,
  alt,
  zoom,
}: {
  p: ShopPhoto;
  className: string;
  pos?: string;
  alt?: string;
  zoom?: { z: number; o: string };
}) {
  const style = zoom ? ({ "--z": zoom.z, "--o": zoom.o } as React.CSSProperties) : undefined;
  return (
    <figure className={`ph ${className}${zoom ? " ph-detail" : ""}`} style={style}>
      <div className="ph-crop">
        <picture>
          <source srcSet={`${CGR_PHOTOS}/${p.file}.avif`} type="image/avif" />
          <img
            src={`${CGR_PHOTOS}/${p.file}.webp`}
            alt={alt ?? p.alt}
            width={p.w}
            height={p.h}
            loading="lazy"
            decoding="async"
            style={pos ? { objectPosition: pos } : undefined}
          />
        </picture>
      </div>
    </figure>
  );
}

function Num({ n }: { n: string }) {
  return (
    <span className="cgr-sp-num" aria-hidden="true">
      {n}
    </span>
  );
}

function Sw({ w }: { w: string }) {
  return (
    <span className="sw" aria-hidden="true">
      {w}
    </span>
  );
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
          Reserve your gown
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
  const { ready, reduced } = useMotionReady();
  const [nav, setNav] = useState<{ on: boolean; tone: Tone; active: Active }>({
    on: false,
    tone: "light",
    active: "",
  });

  // Condensed nav (r7.7): sticks under the SAMPLE bar from the first room to
  // the end of the page; its tone follows the section underneath.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const racks = Array.from(root.querySelectorAll<HTMLElement>("[data-rack]"));
    let raf = 0;
    const read = () => {
      raf = 0;
      const bar = parseFloat(getComputedStyle(root).getPropertyValue("--bar-h")) || 28;
      const y = bar + 32;
      const under = (el: Element) => {
        const b = el.getBoundingClientRect();
        return b.top <= y && b.bottom > y;
      };
      const hit = racks.find(under);
      const started = racks.length > 0 && racks[0].getBoundingClientRect().top <= y;
      let tone: Tone = "light";
      if (hit) tone = hit.dataset.rack === "dark" ? "dark" : "light";
      else {
        const later = Array.from(document.querySelectorAll(".cgr-cf, .cgr-tm, .cgr-foot")).find(under);
        if (later && !later.classList.contains("cgr-tm")) tone = "dark";
      }
      const next = started
        ? { on: true, tone, active: (hit?.dataset.nav ?? "") as Active }
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

  // Desktop motion: script words drift 48px (x) and framed photos 24px (y)
  // across their spread; spread 03 wipes in from the right over ~70vh while
  // 01 steps back 24px at .85.
  useEffect(() => {
    const root = ref.current;
    if (!root || !ready || reduced) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      root.querySelectorAll<HTMLElement>(".cgr-sp").forEach((sp) => {
        const st = { trigger: sp, start: "top bottom", end: "bottom top", scrub: 0.8 };
        const sw = sp.querySelector(".sw");
        const ph = sp.querySelector(".ph-a");
        if (sw) gsap.fromTo(sw, { x: 24 }, { x: -24, ease: "none", scrollTrigger: st });
        if (ph) gsap.fromTo(ph, { y: 12 }, { y: -12, ease: "none", scrollTrigger: { ...st } });
      });
      const turn = root.querySelector(".cgr-sp-03");
      const out = root.querySelector(".cgr-sp-01 .cgr-sp-body");
      if (turn) {
        const st = { trigger: turn, start: "top bottom", end: "top 30%", scrub: 0.6 };
        gsap.fromTo(
          turn,
          { clipPath: "inset(0 0 0 100%)" },
          { clipPath: "inset(0 0 0 0%)", ease: "none", scrollTrigger: st },
        );
        if (out) gsap.fromTo(out, { y: 0, opacity: 1 }, { y: -24, opacity: 0.85, ease: "none", scrollTrigger: { ...st } });
      }
    });
    return () => mm.revert();
  }, [ready, reduced]);

  return (
    <div ref={ref} className="cgr-rk-wrap" data-motion={reduced ? "static" : "on"}>
      <RackNav {...nav} />

      <div className="cgr-sps">
        {/* 01 · Bridal */}
        <section
          className="cgr-rk cgr-sp cgr-sp-01 ivory tulle"
          id="gowns"
          data-rack="light"
          data-nav="Gowns"
          aria-labelledby="cgr-sp-01-t"
        >
          <div className="cgr-sp-body">
            <div className="cgr-sp-art">
              <Num n="01" />
              <Ph p={SHOP_PHOTOS.ivoryVeil} className="frame ph-a" pos="50% 14%" />
              <Ph p={SHOP_PHOTOS.goldCape} className="mat ph-b" pos="50% 22%" />
              <Sw w="Bridal" />
            </div>
            <div className="cgr-sp-text">
              <h2 className="cgr-sp-h disp" id="cgr-sp-01-t" data-rv>
                Ivory, beaded and <em>ball gowns</em>
              </h2>
              <Ph p={SHOP_PHOTOS.ivoryBall} className="mat ph-f" pos="50% 28%" />
              <p className="cgr-sp-lede" data-rv>
                Ivory lace, soft veils and full skirts, ready for your wedding, your debut or a grand evening.
              </p>
              <p className="cgr-sp-pull" data-rv>
                Made for the day you will remember.
              </p>
              <div className="cgr-sp-ctas" data-rv>
                <a href="#rail" className="btn btn-wine">
                  See bridal gowns <span className="arrow" aria-hidden="true" />
                </a>
                <a href="#rail" className="btn btn-line">
                  Reserve your gown
                </a>
              </div>
            </div>
            <ol className="cgr-sp-caps" data-rv>
              <li>
                <i>i.</i>
                <b>Ivory gown with veil</b>
                Bridal and ivory · ask the shop
              </li>
              <li>
                <i>ii.</i>
                <b>Ivory ball gown</b>
                Bridal and ivory · ask the shop
              </li>
              <li>
                <i>iii.</i>
                <b>Gold beaded cape gown</b>
                Evening and gala · ask the shop
              </li>
            </ol>
          </div>
          <nav className="cgr-sp-toc" aria-label="In the catalogue">
            <span className="lab">In the catalogue</span>
            <ol>
              {TOC.map((t) => (
                <li key={t.n}>
                  <a href={t.href} aria-current={t.on ? "true" : undefined}>
                    <i>{t.n}</i>
                    <span>{t.name}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        {/* 03 · Filipiniana (one photo; the two small mats are detail crops of it) */}
        <section
          className="cgr-rk cgr-sp cgr-sp-03 creamy tulle"
          id="filipiniana"
          data-rack="light"
          data-nav="Gowns"
          aria-labelledby="cgr-sp-03-t"
        >
          <div className="cgr-sp-body">
            <div className="cgr-sp-art">
              <Num n="03" />
              <Ph p={SHOP_PHOTOS.filipiniana} className="frame ph-a" pos="50% 18%" />
              <Ph
                p={SHOP_PHOTOS.filipiniana}
                className="mat ph-b"
                alt="Detail of the black Filipiniana gown: the gold appliqué bodice and puff sleeves."
                zoom={{ z: 2.2, o: "50% 34%" }}
              />
              <Ph
                p={SHOP_PHOTOS.filipiniana}
                className="mat ph-c"
                alt="Detail of the black Filipiniana gown: the long pleated train."
                zoom={{ z: 1.8, o: "50% 92%" }}
              />
              <Sw w="Filipiniana" />
            </div>
            <div className="cgr-sp-text">
              <h2 className="cgr-sp-h disp" id="cgr-sp-03-t" data-rv>
                Black, beaded <em>Filipiniana</em>
              </h2>
              <p className="cgr-sp-lede" data-rv>
                Structured puff sleeves, a gold appliqué bodice and a long pleated train. Ask us about sizes, and we will
                keep it for your date.
              </p>
              <p className="cgr-sp-pull" data-rv>
                One gown, seen up close.
              </p>
              <div className="cgr-sp-ctas" data-rv>
                <a href="#rail" className="btn btn-line">
                  Reserve your gown <span className="arrow" aria-hidden="true" />
                </a>
              </div>
            </div>
            <ol className="cgr-sp-caps" data-rv>
              <li>
                <i>i.</i>
                <b>Black beaded Filipiniana</b>
                Filipiniana · ask the shop
              </li>
              <li>
                <i>ii.</i>
                <b>The bodice and sleeves</b>
                Detail of the same gown
              </li>
              <li>
                <i>iii.</i>
                <b>The pleated train</b>
                Detail of the same gown
              </li>
            </ol>
          </div>
        </section>
      </div>

      {/* Accessories (r7.5 band) */}
      <section className="cgr-rk cgr-acc" id="accessories" data-rack="light" data-nav="Accessories" aria-label="Accessories">
        <div className="cgr-rk-band">
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

      {/* 05 · Barong and suits */}
      <section
        className="cgr-rk cgr-sp cgr-sp-05 creamy tulle"
        id="suits"
        data-rack="light"
        aria-labelledby="cgr-sp-05-t"
      >
        <div className="cgr-sp-body">
          <div className="cgr-sp-art">
            <Num n="05" />
            <Ph p={SHOP_PHOTOS.barongEmbroidery} className="frame ph-a" pos="50% 30%" />
            <Ph p={SHOP_PHOTOS.barongWoven} className="mat ph-b" pos="50% 20%" />
            <Sw w="Barong" />
          </div>
          <div className="cgr-sp-text">
            <h2 className="cgr-sp-h disp" id="cgr-sp-05-t" data-rv>
              Suits and <em>barong</em>
            </h2>
            <Ph p={SHOP_PHOTOS.suitBlue} className="mat ph-f" pos="50% 20%" />
            <p className="cgr-sp-lede" data-rv>
              Cream barong with black embroidery or a woven front panel, and suits with beaded shoulders in royal blue
              and turquoise.
            </p>
            <p className="cgr-sp-pull" data-rv>
              For grooms, fathers, escorts and the men of the entourage.
            </p>
            <div className="cgr-sp-ctas" data-rv>
              <a href={cgr.facebook} className="btn btn-line" target="_blank" rel="noopener noreferrer">
                See suits and barong <span className="arrow" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="cgr-sp-row">
            <Ph p={SHOP_PHOTOS.suitTurquoise} className="mat ph-d" pos="50% 15%" />
            <ol className="cgr-sp-caps" data-rv>
              <li>
                <i>i.</i>
                <b>Cream barong</b>
                Black embroidery · ask the shop
              </li>
              <li>
                <i>ii.</i>
                <b>Woven barong</b>
                Woven front panel · ask the shop
              </li>
              <li>
                <i>iii.</i>
                <b>Royal-blue beaded suit</b>
                Suits · ask the shop
              </li>
              <li>
                <i>iv.</i>
                <b>Turquoise three-piece suit</b>
                Suits · ask the shop
              </li>
            </ol>
          </div>
          <p className="cgr-pitch">
            A sample site by KantoCo. Want one for your shop?{" "}
            <a href={KANTOCO_MESSENGER} target="_blank" rel="noopener noreferrer">
              m.me/kantocoph
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
