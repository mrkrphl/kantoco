import { DEMO_BADGE } from "@/lib/demos";

export const CGR_ASSET = "/demos/cgr-rentals";
export const CGR_BASE = "/demos/cgr-rentals";
export const COMMISSION_PHP = 200;
export const BOOKINGS_KEY = "cgr-rentals-bookings-v1";

/**
 * r7.11 defaults (Design r7.11, Mark's brief). Each one is a single switch;
 * PR #33's "Round 7.11" notes say how to flip it.
 */
export const CGR_FLAGS = {
  /** Booking records: an unlisted, noindex page (robots in layout.tsx). */
  recordsPath: "/owner",
  /** null = no passcode. A string asks for it first (client-side only: a sample gate, not security). */
  recordsPasscode: null as string | null,
  /** false = a fitting can be booked with or without a reservation code. */
  fittingCodeRequired: false,
  /** Fitting times are example data (see FITTING_SLOTS). */
  slotsAreExample: true,
  /** The example rate stays out of the hero. */
  heroShowsRate: false,
  /** Reviews: one at a time (false = the r7.7 three-up spreads). */
  reviewsOneAtATime: true,
  /** Occasion: false = it goes in the optional note; true adds its own optional field. */
  occasionField: false,
} as const;

/**
 * Fitting times (r7.11). EXAMPLE DATA: the shop sets the real ones. On
 * Saturdays the 1:00 PM slot shows as taken, so the sample has a taken state.
 */
export const FITTING_SLOTS = {
  exampleData: true,
  times: ["10:00", "13:00", "15:00", "17:00"],
  /** Weekday (0 Sun..6 Sat) -> times already taken in the example. */
  exampleTaken: { 6: ["13:00"] } as Record<number, string[]>,
} as const;

/** Public listing facts only. Never contact the shop. */
export const cgr = {
  title: "Cavite Gown Rentals · KantoCo sample",
  description:
    "KantoCo sample for Cavite Gown Rentals, which rents gowns and suits for any formal occasion at #71 Jose Abad Santos Ave., Salawag, Dasmariñas City, Cavite, with a booking preview. Not the shop's official site.",
  badge: DEMO_BADGE,
  barDesk:
    "A KantoCo sample for Cavite Gown Rentals. Not the shop's official site. Prices & sizes are sample data.",
  barMob: "KantoCo sample, not the shop's site",
  name: "Cavite Gown Rentals",
  shortName: "CGR",
  eyebrow: "Gown and suit rentals · Dasmariñas, Cavite",
  tagline:
    "Gowns and suits for any formal occasion, plus tiaras, at #71 Jose Abad Santos Ave., Salawag, Dasmariñas City, Cavite, each gown with its own sample calendar and a reference code for every reservation.",
  facebook: "https://www.facebook.com/CaviteGownRentals",
  /** Public contact links from the shop's Facebook page. Links only; nothing is sent. */
  phones: [
    { label: "0977 087 8589", tel: "tel:+639770878589" },
    { label: "0995 477 1665", tel: "tel:+639954771665" },
  ],
  instagram: { label: "cavite_gown_rentals", href: "https://www.instagram.com/cavite_gown_rentals/" },
  tiktok: { label: "@cavitegownrentals", href: "https://www.tiktok.com/@cavitegownrentals" },
  messenger: "https://m.me/CaviteGownRentals",
  maps: "https://www.google.com/maps/search/?api=1&query=Cavite+Gown+Rentals+%2371+Jose+Abad+Santos+Ave+Salawag+Dasmarinas+City+Cavite",
  address: "#71 Jose Abad Santos Ave., Salawag, Dasmariñas City, Cavite",
  hoursNote:
    "Sample hours from the shop's public listing. Confirm on Facebook before you go.",
  hours: [{ day: "Mon–Sun", time: "9:00 AM – 8:00 PM" }] as const,
  sampleNote:
    "Sample data only. Prices, sizes and booked dates are mocked for this KantoCo preview. Photos are from the shop's public Facebook page and listings; some show customers wearing the gowns.",
  credit:
    "Photos: Cavite Gown Rentals' public Facebook page (facebook.com/CaviteGownRentals) and related public listing stills, some showing customers in the gowns. Used for this private KantoCo sample only. No shop contact.",
  asset: CGR_ASSET,
} as const;

/**
 * r7.4: face-free photos from the shop's public Facebook page (crop only, no
 * edits). Photo-only cards: no listing, rate, size or calendar is invented for
 * them, so every caption says "ask the shop". Sources: photos/SOURCES.md.
 */
export type ShopPhoto = { file: string; label: string; alt: string; w: number; h: number };

export const CGR_PHOTOS = `${CGR_ASSET}/photos`;

export const SHOP_PHOTOS = {
  ivoryVeil: {
    file: "cgr-ivory-veil",
    label: "Ivory gown",
    alt: "Ivory lace gown with a long sheer veil and train, on a white mannequin holding a bouquet.",
    w: 633,
    h: 1200,
  },
  ivoryBall: {
    file: "cgr-ivory-ball",
    label: "Ivory ball gown",
    alt: "Ivory ball gown with a beaded bodice, lace sleeves and a full skirt, on a white mannequin with a tiara and bouquet.",
    w: 738,
    h: 960,
  },
  goldCape: {
    file: "cgr-gold-cape",
    label: "Gold gown",
    alt: "Gold beaded column gown with long sheer cape sleeves, on a white mannequin.",
    w: 400,
    h: 960,
  },
  filipiniana: {
    file: "cgr-filipiniana-black",
    label: "Filipiniana",
    alt: "Black beaded gown with structured puff sleeves, a gold appliqué bodice and a long pleated train, on a white mannequin.",
    w: 590,
    h: 1200,
  },
  barongEmbroidery: {
    file: "cgr-barong-black-embroidery",
    label: "Barong",
    alt: "Cream barong with black geometric embroidery down the front and sleeves, shown from the collar down.",
    w: 985,
    h: 1200,
  },
  barongWoven: {
    file: "cgr-barong-woven",
    label: "Barong",
    alt: "Cream barong with a woven geometric front panel and striped woven sleeves, shown from the collar down.",
    w: 1000,
    h: 969,
  },
  suitBlue: {
    file: "cgr-suit-royal-blue",
    label: "Suit",
    alt: "Royal-blue suit jacket with black lapels, silver beaded shoulder embroidery and a blue bow with a brooch, on a dress form.",
    w: 900,
    h: 1200,
  },
  suitTurquoise: {
    file: "cgr-suit-turquoise",
    label: "Suit",
    alt: "Turquoise three-piece suit with beaded shoulder embroidery and a black bow, on a white mannequin.",
    w: 750,
    h: 1000,
  },
} satisfies Record<string, ShopPhoto>;

export type GownCategory =
  "debut" | "pageant" | "bridal" | "filipiniana" | "formal" | "accessory";

export type GownColor = "red" | "blue" | "purple" | "green" | "silver" | "gold" | "mixed";

export type GownSize = "XS" | "S" | "M" | "L" | "XL" | "One size";

export type GownImage = { file: string; alt: string; w: number; h: number };

export type Gown = {
  slug: string;
  name: string;
  category: GownCategory;
  colors: GownColor[];
  sizes: GownSize[];
  /** Sample rental rate in PHP per day. Not from the shop. */
  pricePerDay: number;
  blurb: string;
  /**
   * file: path under CGR_ASSET, without ".webp". r7.9: always a whole shop
   * photo (photos/cgr-gown-*), shown with object-fit: contain; never a crop.
   */
  images: GownImage[];
  /** Mock ISO dates already held for this item. */
  bookedDates: string[];
  sample: true;
};

/** Filter chips for the gown grid. Accessories have their own section. */
export const CATEGORIES: { id: GownCategory | "all"; label: string }[] = [
  { id: "all", label: "All gowns" },
  { id: "debut", label: "Debut" },
  { id: "pageant", label: "Pageant" },
  { id: "formal", label: "Formal" },
];

export const COLORS: { id: GownColor | "all"; label: string }[] = [
  { id: "all", label: "All colors" },
  { id: "red", label: "Red" },
  { id: "blue", label: "Blue" },
  { id: "purple", label: "Purple" },
  { id: "green", label: "Green" },
  { id: "silver", label: "Silver" },
  { id: "gold", label: "Gold" },
  { id: "mixed", label: "Mixed" },
];

export const SIZES: { id: GownSize | "all"; label: string }[] = [
  { id: "all", label: "All sizes" },
  { id: "XS", label: "XS" },
  { id: "S", label: "S" },
  { id: "M", label: "M" },
  { id: "L", label: "L" },
  { id: "XL", label: "XL" },
];

/**
 * Catalogue. Prices, sizes, booked dates and listing names are SAMPLE DATA.
 * Public refs did not list rental rates. r7.9: gown photos are the shop's own
 * public Facebook photos at natural framing (no detail crops), one gown per
 * listing; names and blurbs describe the gown in the photo. Sources:
 * photos/SOURCES.md.
 */
export const GOWNS: Gown[] = [
  {
    slug: "red-sequin-evening",
    name: "Wine sequin slit gown",
    category: "pageant",
    colors: ["red"],
    sizes: ["S", "M", "L", "XL"],
    pricePerDay: 2500,
    blurb:
      "Wine-red sequin gown with a deep V neckline, red beaded appliqué down the bodice, sheer long sleeves and a high side slit. Sample listing for pageant and gala nights.",
    images: [
      {
        file: "photos/cgr-gown-wine-sequin-01",
        alt: "Wine-red sequin gown with a deep V neckline, red beaded appliqué, sheer long sleeves and a high side slit, on a mannequin in the shop.",
        w: 640,
        h: 1426,
      },
    ],
    bookedDates: ["2026-11-08", "2026-11-09", "2026-11-15", "2026-11-22", "2026-12-06"],
    sample: true,
  },
  {
    slug: "teal-puff-sleeve-gown",
    name: "Teal puff sleeve gown",
    category: "pageant",
    colors: ["green"],
    sizes: ["S", "M", "L"],
    pricePerDay: 3200,
    blurb:
      "Deep teal off-shoulder gown with satin puff sleeves, silver-green embroidery down the bodice and a long satin train. Sample listing for pageants and pictorials.",
    images: [
      {
        file: "photos/cgr-gown-teal-puff-03",
        alt: "A woman wears the teal puff sleeve gown with its long satin train, beside a red brick wall.",
        w: 750,
        h: 1000,
      },
      {
        file: "photos/cgr-gown-teal-puff-01",
        alt: "The teal gown worn in a garden of large green leaves, showing the embroidered bodice.",
        w: 1200,
        h: 800,
      },
      {
        file: "photos/cgr-gown-teal-puff-02",
        alt: "The teal gown worn in a garden beside a flowering bonsai, full length with the train.",
        w: 1200,
        h: 800,
      },
    ],
    bookedDates: ["2026-11-06", "2026-11-28"],
    sample: true,
  },
  {
    slug: "navy-gold-sequin-gown",
    name: "Navy gold sequin gown",
    category: "formal",
    colors: ["blue", "gold"],
    sizes: ["M", "L", "XL"],
    pricePerDay: 2200,
    blurb:
      "Navy off-shoulder gown with satin puff sleeves, gold and copper sequin swirls and a sheer navy train. Sample listing for formal dinners and proms.",
    images: [
      {
        file: "photos/cgr-gown-navy-gold-01",
        alt: "Navy off-shoulder gown with puff sleeves, gold sequin swirls and a sheer train, on a mannequin in the shop.",
        w: 864,
        h: 1200,
      },
    ],
    bookedDates: ["2026-11-07", "2026-11-21"],
    sample: true,
  },
  {
    slug: "royal-blue-mermaid-gown",
    name: "Royal blue mermaid gown",
    category: "pageant",
    colors: ["blue"],
    sizes: ["XS", "S", "M", "L"],
    pricePerDay: 3000,
    blurb:
      "Royal blue sequin mermaid gown with sweeping silver swirls, a sweetheart bodice and sheer puff sleeves. Sample listing for pageant nights.",
    images: [
      {
        file: "photos/cgr-gown-royal-blue-01",
        alt: "Royal blue sequin mermaid gown with silver swirls and sheer puff sleeves, on a mannequin in the shop.",
        w: 675,
        h: 900,
      },
    ],
    bookedDates: ["2026-11-01", "2026-11-14", "2026-11-15", "2026-11-28"],
    sample: true,
  },
  {
    slug: "powder-blue-tulle-gown",
    name: "Powder blue tulle gown",
    category: "debut",
    colors: ["blue"],
    sizes: ["S", "M", "L"],
    pricePerDay: 3200,
    blurb:
      "Powder blue off-shoulder tulle gown with feather-trimmed straps, a corset bodice, 3D floral appliqué and a front slit. Sample listing for 18th birthdays.",
    images: [
      {
        file: "photos/cgr-gown-powder-blue-01",
        alt: "Powder blue off-shoulder tulle gown with feather trim and floral appliqué, on a mannequin, angled view.",
        w: 761,
        h: 1200,
      },
      {
        file: "photos/cgr-gown-powder-blue-02",
        alt: "The same powder blue tulle gown, front view, showing the corset bodice and the front slit.",
        w: 963,
        h: 1200,
      },
    ],
    bookedDates: ["2026-11-06", "2026-11-20"],
    sample: true,
  },
  {
    slug: "periwinkle-cape-gown",
    name: "Periwinkle beaded cape gown",
    category: "formal",
    colors: ["blue", "silver"],
    sizes: ["XS", "S", "M", "L", "XL"],
    pricePerDay: 2600,
    blurb:
      "Periwinkle gown covered in silver beading, with a deep V neckline, a waist cut-out and a sheer floor-length cape. Sample listing for galas and grand entrances.",
    images: [
      {
        file: "photos/cgr-gown-periwinkle-cape-01",
        alt: "Periwinkle beaded gown with a deep V neckline and a sheer cape, on a mannequin in the shop.",
        w: 807,
        h: 1100,
      },
    ],
    bookedDates: ["2026-11-12", "2026-11-29"],
    sample: true,
  },
  {
    slug: "violet-gold-beaded-gown",
    name: "Violet gold beaded gown",
    category: "pageant",
    colors: ["purple", "gold"],
    sizes: ["S", "M"],
    pricePerDay: 2700,
    blurb:
      "Violet beaded bodice with a feathered neckline, a gold-beaded skirt and a sheer violet overskirt. Sample listing for pageant and gala looks.",
    images: [
      {
        file: "photos/cgr-gown-violet-gold-01",
        alt: "Violet and gold beaded gown with a sheer violet overskirt, on a mannequin in the shop.",
        w: 737,
        h: 1200,
      },
    ],
    bookedDates: ["2026-11-20", "2026-12-05"],
    sample: true,
  },
  {
    slug: "lilac-floral-tulle-gown",
    name: "Lilac floral tulle gown",
    category: "debut",
    colors: ["purple"],
    sizes: ["XS", "S", "M", "L"],
    pricePerDay: 2400,
    blurb:
      "Lilac off-shoulder tulle gown with a beaded floral bodice and a full, soft skirt. Sample listing for debuts and cotillions.",
    images: [
      {
        file: "photos/cgr-gown-lilac-tulle-01",
        alt: "Lilac off-shoulder tulle gown with a floral beaded bodice, on a mannequin in the shop.",
        w: 645,
        h: 1100,
      },
    ],
    bookedDates: ["2026-11-19", "2026-11-26"],
    sample: true,
  },
  {
    slug: "ivory-ball-gown",
    name: "Ivory ball gown",
    category: "bridal",
    colors: ["silver"],
    sizes: ["S", "M", "L", "XL"],
    pricePerDay: 3500,
    blurb:
      "Ivory ball gown with a beaded bodice, lace sleeves and a full skirt. Sample listing for weddings and debuts.",
    images: [
      {
        file: "photos/cgr-ivory-ball",
        alt: "Ivory ball gown with a beaded bodice, lace sleeves and a full skirt, on a white mannequin with a tiara and bouquet.",
        w: 738,
        h: 960,
      },
    ],
    bookedDates: ["2026-11-14", "2026-11-28", "2026-12-12"],
    sample: true,
  },
  {
    slug: "black-gold-filipiniana",
    name: "Black and gold Filipiniana",
    category: "filipiniana",
    colors: ["gold"],
    sizes: ["S", "M", "L"],
    pricePerDay: 2800,
    blurb:
      "Black beaded gown with structured puff sleeves, a gold appliqué bodice and a long pleated train. Sample listing for galas and Filipiniana nights.",
    images: [
      {
        file: "photos/cgr-filipiniana-black",
        alt: "Black beaded gown with structured puff sleeves, a gold appliqué bodice and a long pleated train, on a white mannequin.",
        w: 590,
        h: 1200,
      },
    ],
    bookedDates: ["2026-11-13", "2026-11-27"],
    sample: true,
  },
  {
    slug: "gold-crystal-tiaras",
    name: "Gold crystal tiara",
    category: "accessory",
    colors: ["gold"],
    sizes: ["One size"],
    pricePerDay: 500,
    blurb:
      "Tall gold crystal tiaras for debut and pageant looks, to wear with any gown. Sample accessory listing.",
    images: [
      { file: "accessories-tiaras", alt: "Gold crystal tiaras on a display rack.", w: 490, h: 332 },
      { file: "accessories-tiaras-2", alt: "Red, blue and pink stone tiaras on display stands.", w: 696, h: 482 },
    ],
    bookedDates: ["2026-11-08", "2026-11-22"],
    sample: true,
  },
  {
    slug: "ruby-pageant-crown",
    name: "Ruby pageant crown",
    category: "accessory",
    colors: ["red", "gold"],
    sizes: ["One size"],
    pricePerDay: 650,
    blurb:
      "Gold band with red stones, made for coronation nights. Sample accessory listing.",
    images: [
      { file: "accessory-tiara-ruby", alt: "Gold crown with red stones and a gold spike tiara behind it.", w: 445, h: 250 },
      { file: "accessories-tiaras-2", alt: "Red, blue and pink stone tiaras on display stands.", w: 696, h: 482 },
    ],
    bookedDates: ["2026-11-15"],
    sample: true,
  },
  {
    slug: "rose-stone-tiara",
    name: "Rose stone tiara",
    category: "accessory",
    colors: ["silver", "mixed"],
    sizes: ["One size"],
    pricePerDay: 550,
    blurb:
      "Silver tiara set with pink and gold stones. Sample accessory listing.",
    images: [
      { file: "accessory-tiara-rose", alt: "Silver tiara with pink and gold stones, close-up.", w: 248, h: 230 },
      { file: "accessories-tiaras-2", alt: "Red, blue and pink stone tiaras on display stands.", w: 696, h: 482 },
    ],
    bookedDates: [],
    sample: true,
  },
  {
    slug: "crown-display-set",
    name: "Stone tiara trio",
    category: "accessory",
    colors: ["mixed"],
    sizes: ["One size"],
    pricePerDay: 1200,
    blurb:
      "Red, blue and pink stone tiaras rented as a set for courts and entourages. Sample accessory listing.",
    images: [
      { file: "accessories-tiaras-2", alt: "Red, blue and pink stone tiaras on display stands.", w: 696, h: 482 },
      { file: "accessory-tiara-ruby", alt: "Gold crown with red stones and a gold spike tiara behind it.", w: 445, h: 250 },
      { file: "accessory-tiara-rose", alt: "Silver tiara with pink and gold stones, close-up.", w: 248, h: 230 },
    ],
    bookedDates: ["2026-11-28"],
    sample: true,
  },
  {
    slug: "crystal-choker",
    name: "Crystal choker",
    category: "accessory",
    colors: ["silver"],
    sizes: ["One size"],
    pricePerDay: 300,
    blurb:
      "Sparkle choker for formal and off-shoulder necklines. Sample accessory listing.",
    images: [
      { file: "accessory-choker", alt: "Crystal choker on a dark ground.", w: 592, h: 272 },
    ],
    bookedDates: [],
    sample: true,
  },
  {
    slug: "crystal-bracelet",
    name: "Crystal bracelet",
    category: "accessory",
    colors: ["silver"],
    sizes: ["One size"],
    pricePerDay: 250,
    blurb:
      "Crystal cuff bracelet to finish a formal look. Sample accessory listing.",
    images: [
      { file: "accessory-bracelet", alt: "Crystal bracelet on a dark ground.", w: 336, h: 208 },
    ],
    bookedDates: [],
    sample: true,
  },
];

export const DRESSES = GOWNS.filter((g) => g.category !== "accessory");
export const ACCESSORIES = GOWNS.filter((g) => g.category === "accessory");

export const CATEGORY_LABEL: Record<GownCategory, string> = {
  debut: "Debut",
  pageant: "Pageant",
  bridal: "Bridal",
  filipiniana: "Filipiniana",
  formal: "Formal",
  accessory: "Accessory",
};

/**
 * r7.9: slugs renamed so each listing matches the gown in its photo. Old links
 * (and bookings saved under them) still resolve.
 */
export const SLUG_ALIASES: Record<string, string> = {
  "red-sequin-column": "navy-gold-sequin-gown",
  "blue-ball-gown": "royal-blue-mermaid-gown",
  "blue-ruffle-debut": "powder-blue-tulle-gown",
  "blue-sash-cotillion": "periwinkle-cape-gown",
};

/**
 * r7.9.1: listings taken down. maroon-puff-sleeve-gown (and red-lace-corset,
 * its old slug) only had photos of a wearer whose age is not confirmed (no children), so the
 * listing is gone until the shop confirms. Its pages redirect to the
 * catalogue; bookings saved under it still open on confirmation.
 */
export const RETIRED_SLUGS: ReadonlySet<string> = new Set([
  "maroon-puff-sleeve-gown",
  "red-lace-corset",
]);

export function getGown(slug: string): Gown | undefined {
  const s = SLUG_ALIASES[slug] ?? slug;
  return GOWNS.find((g) => g.slug === s);
}

export function formatPhp(n: number): string {
  return `₱${n.toLocaleString("en-PH")}`;
}

export type BookingStatus =
  "pending" | "confirmed" | "out" | "returned" | "cancelled";

export type BookingKind = "reserve" | "fitting";

/**
 * A booking record. r7.11 adds fittings: `kind` (missing = an older
 * reservation), `fittingDate` + `slot` ("15:00"), and `linkedRef` (the
 * reservation it is for, if any). A fitting keeps eventDate/returnDate as ""
 * unless it is linked (then eventDate is the linked event day).
 */
export type Booking = {
  ref: string;
  kind?: BookingKind;
  fittingDate?: string;
  slot?: string;
  linkedRef?: string;
  gownSlug: string;
  gownName: string;
  eventDate: string;
  returnDate: string;
  customerName: string;
  customerContact: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
  sample: true;
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out: "Out",
  returned: "Returned",
  cancelled: "Cancelled",
};

export const STATUS_OPTIONS: BookingStatus[] = [
  "pending",
  "confirmed",
  "out",
  "returned",
  "cancelled",
];
