import Link from "next/link";
import { ACCESSORIES, CGR_BASE, CGR_PHOTOS, SHOP_PHOTOS, formatPhp, getGown, type GownImage } from "@/lib/cgr-rentals";
import { GownImg } from "@/components/demos/cgr-rentals/GownImg";

/**
 * r7.11 home spreads (Design r7.11 home.html): one photo on a cream mat
 * (contain, never cropped), one script word, one line, one button.
 * Order: 01 Evening (red, first), 02 Bridal, 03 Filipiniana, the Crowns
 * band, 04 Barong. Bridal, Filipiniana and the crowns open their own
 * reservable gown pages (default #4, steering). Barong has no uncropped
 * photo on #33 (both are top-trimmed), so it gets no page; its button goes
 * to the visit block instead of an "Ask about…" line.
 */
type Spread = {
  id: string;
  no: string;
  word: string;
  line: string;
  img: GownImage;
  cta: string;
  href: string;
  flip?: boolean;
};

const gownPage = (slug: string) => `${CGR_BASE}/gown/${slug}`;
const first = (slug: string) => {
  const g = getGown(slug);
  if (!g) throw new Error(`CGR: missing gown ${slug}`);
  return g;
};

const evening = first("red-sequin-evening");
const bridal = first("ivory-ball-gown");
const fili = first("black-gold-filipiniana");
const crowns = first("gold-crystal-tiaras");

const SPREADS: Spread[] = [
  {
    id: "gowns",
    no: "01",
    word: "Evening",
    line: `${evening.name}, ${formatPhp(evening.pricePerDay)} a day.`,
    img: evening.images[0],
    cta: "Reserve this gown",
    href: gownPage(evening.slug),
  },
  {
    id: "bridal",
    no: "02",
    word: "Bridal",
    line: `${bridal.name}, ${formatPhp(bridal.pricePerDay)} a day.`,
    img: bridal.images[0],
    cta: "Reserve this gown",
    href: gownPage(bridal.slug),
    flip: true,
  },
  {
    id: "filipiniana",
    no: "03",
    word: "Filipiniana",
    line: "Black and gold, with a long pleated train.",
    img: fili.images[0],
    cta: "Reserve this gown",
    href: gownPage(fili.slug),
  },
];

const BARONG = SHOP_PHOTOS.barongEmbroidery;
const FROM_ACC = Math.min(...ACCESSORIES.map((g) => g.pricePerDay));

function Photo({ img }: { img: GownImage }) {
  return (
    <figure className="r11-ph r11-mat">
      <GownImg img={img} loading="lazy" decoding="async" />
    </figure>
  );
}

function SpreadSec({ s }: { s: Spread }) {
  return (
    <section id={s.id} className={s.flip ? "r11-spread flip" : "r11-spread"} aria-labelledby={`${s.id}-h`}>
      <Photo img={s.img} />
      <div className="r11-txt">
        <p className="r11-kick" aria-hidden="true">
          {s.no}
        </p>
        <p className="r11-script" aria-hidden="true">
          {s.word}
        </p>
        <h2 id={`${s.id}-h`} className="r11-line-t">
          <span className="sr-only">{s.word}: </span>
          {s.line}
        </h2>
        <Link className="r11-btn r11-wine r11-sm" href={s.href}>
          {s.cta}
        </Link>
      </div>
    </section>
  );
}

export function Spreads() {
  return (
    <>
      {SPREADS.map((s) => (
        <SpreadSec key={s.id} s={s} />
      ))}

      <section id="accessories" className="r11-acc" aria-labelledby="accessories-h">
        <Photo img={crowns.images[0]} />
        <div className="r11-txt">
          <p className="r11-script" aria-hidden="true">
            Crowns
          </p>
          <h2 id="accessories-h" className="r11-line-t">
            <span className="sr-only">Accessories: </span>
            Tiaras and crystal sets, from {formatPhp(FROM_ACC)} a day.
          </h2>
          <Link className="r11-btn r11-line r11-sm" href={gownPage(crowns.slug)}>
            Reserve a tiara
          </Link>
        </div>
      </section>

      <section id="suits" className="r11-spread flip" aria-labelledby="suits-h">
        <figure className="r11-ph r11-mat">
          {/* eslint-disable-next-line @next/next/no-img-element -- local webp, fixed box */}
          <img
            src={`${CGR_PHOTOS}/${BARONG.file}.webp`}
            alt={BARONG.alt}
            width={BARONG.w}
            height={BARONG.h}
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="r11-txt">
          <p className="r11-kick" aria-hidden="true">
            04
          </p>
          <p className="r11-script" aria-hidden="true">
            Barong
          </p>
          <h2 id="suits-h" className="r11-line-t">
            <span className="sr-only">Barong: </span>
            For grooms, fathers and escorts.
          </h2>
          <a className="r11-btn r11-wine r11-sm" href="#visit">
            Visit the shop
          </a>
        </div>
      </section>
    </>
  );
}
