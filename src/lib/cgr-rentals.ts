import { DEMO_BADGE } from "@/lib/demos";

export const CGR_ASSET = "/demos/cgr-rentals";
export const CGR_BASE = "/demos/cgr-rentals";
export const COMMISSION_PHP = 200;
export const BOOKINGS_KEY = "cgr-rentals-bookings-v1";

/** Public listing facts only. Never contact the shop. */
export const cgr = {
  title: "Cavite Gown Rentals · KantoCo sample",
  description:
    "KantoCo sample for Cavite Gown Rentals on Jose Abad Santos Ave, Salawag, Dasmariñas. Flat catalogue + booking preview. Not the shop's official site.",
  badge: DEMO_BADGE,
  barDesk:
    "A KantoCo sample for Cavite Gown Rentals. Not the shop's official site. Prices & sizes are sample data.",
  barMob: "KantoCo sample · not live",
  name: "Cavite Gown Rentals",
  shortName: "CGR",
  eyebrow: "Gown rentals · Dasmariñas, Cavite",
  tagline:
    "Debut, pageant and formal gowns plus tiaras, on Jose Abad Santos Ave. Check a date, request a hold, get a reference code.",
  facebook: "https://www.facebook.com/CaviteGownRentals",
  messenger: "https://m.me/CaviteGownRentals",
  maps: "https://www.google.com/maps/search/?api=1&query=Cavite+Gown+Rentals+Jose+Abad+Santos+Ave+Salawag+Dasmarinas",
  address: "071 Lolit Bldg, Jose Abad Santos Ave, Salawag, Dasmariñas, Cavite",
  hoursNote:
    "Public listings disagree (some say open daily 9–8; some say closed Wed/Thu). Confirm on Facebook before you go.",
  hours: [
    { day: "Mon–Tue", time: "9:00 AM – 8:00 PM" },
    { day: "Wed–Thu", time: "Confirm on Facebook" },
    { day: "Fri–Sun", time: "9:00 AM – 8:00 PM" },
  ] as const,
  sampleNote:
    "Sample data only. Prices, sizes and booked dates are mocked for this KantoCo preview. Photos are face-free crops from the shop's public Facebook / Maps listings.",
  credit:
    "Photos: face-free crops from Cavite Gown Rentals' public Facebook page (facebook.com/CaviteGownRentals) and related public listing stills. Used for this private KantoCo sample only. No shop contact.",
  asset: CGR_ASSET,
} as const;

export type GownCategory =
  "debut" | "pageant" | "filipiniana" | "formal" | "accessory";

export type GownColor = "red" | "blue" | "silver" | "gold" | "mixed";

export type GownSize = "XS" | "S" | "M" | "L" | "XL" | "One size";

export type Gown = {
  slug: string;
  name: string;
  category: GownCategory;
  colors: GownColor[];
  sizes: GownSize[];
  /** Sample rental rate in PHP per day. Not from the shop. */
  pricePerDay: number;
  blurb: string;
  images: { file: string; alt: string; w: number; h: number }[];
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
 * Public refs did not list rental rates. Photos are face-free crops from
 * public FB/Maps; some crops back more than one mock listing.
 */
export const GOWNS: Gown[] = [
  {
    slug: "red-sequin-evening",
    name: "Red sequin evening gown",
    category: "pageant",
    colors: ["red"],
    sizes: ["S", "M", "L", "XL"],
    pricePerDay: 2500,
    blurb:
      "Strapless corset bodice with illusion midriff, sequin column skirt and side slit. Sample listing for debut or pageant nights.",
    images: [
      { file: "gown-red-full", alt: "Deep red sequin evening gown, full length, on a dark ground. Face-free cutout.", w: 1024, h: 2048 },
      { file: "gown-red-bodice", alt: "Red gown bodice with lace and sequin detail, face-free cutout.", w: 1024, h: 1024 },
      { file: "gown-red-detail", alt: "Close-up of the red gown's beaded lace bodice.", w: 570, h: 1280 },
      { file: "gown-red-skirt", alt: "Close-up of the red gown's sequin skirt.", w: 300, h: 910 },
    ],
    bookedDates: ["2026-11-08", "2026-11-09", "2026-11-15", "2026-11-22", "2026-12-06"],
    sample: true,
  },
  {
    slug: "red-lace-corset",
    name: "Red lace corset gown",
    category: "pageant",
    colors: ["red"],
    sizes: ["XS", "S", "M"],
    pricePerDay: 2800,
    blurb:
      "Beaded red lace sweetheart bodice with boning and crystal swirls. Sample listing for pageant and gala looks.",
    images: [
      { file: "gown-red-bodice", alt: "Red gown bodice with lace and sequin detail, face-free cutout.", w: 1024, h: 1024 },
      { file: "gown-red-detail", alt: "Close-up of the red gown's beaded lace bodice.", w: 570, h: 1280 },
      { file: "gown-red-full", alt: "Deep red sequin evening gown, full length, on a dark ground. Face-free cutout.", w: 1024, h: 2048 },
    ],
    bookedDates: ["2026-11-13", "2026-11-14", "2026-11-27"],
    sample: true,
  },
  {
    slug: "red-sequin-column",
    name: "Red sequin column gown",
    category: "formal",
    colors: ["red"],
    sizes: ["M", "L", "XL"],
    pricePerDay: 2200,
    blurb:
      "Wine-red sequin column with a draped side panel. Sample listing for formal dinners and proms.",
    images: [
      { file: "gown-red-skirt", alt: "Close-up of the red gown's sequin skirt.", w: 300, h: 910 },
      { file: "gown-red-detail", alt: "Close-up of the red gown's beaded lace bodice.", w: 570, h: 1280 },
      { file: "gown-red-full", alt: "Deep red sequin evening gown, full length, on a dark ground. Face-free cutout.", w: 1024, h: 2048 },
    ],
    bookedDates: ["2026-11-07", "2026-11-21"],
    sample: true,
  },
  {
    slug: "blue-ball-gown",
    name: "Icy blue ball gown",
    category: "debut",
    colors: ["blue", "silver"],
    sizes: ["XS", "S", "M", "L"],
    pricePerDay: 3000,
    blurb:
      "Voluminous icy-blue ball gown with sculptural shoulder ruffles and a full debut skirt. Sample listing.",
    images: [
      { file: "gown-blue-1", alt: "Icy blue ball gown on a headless mannequin, front view.", w: 896, h: 912 },
      { file: "gown-blue-2", alt: "Icy blue ball gown on a mannequin, angled view of the skirt layers.", w: 896, h: 912 },
      { file: "gown-blue-3", alt: "Icy blue ball gown on a mannequin, sash and ruffle detail.", w: 896, h: 912 },
    ],
    bookedDates: ["2026-11-01", "2026-11-14", "2026-11-15", "2026-11-28"],
    sample: true,
  },
  {
    slug: "blue-ruffle-debut",
    name: "Blue ruffle debut gown",
    category: "debut",
    colors: ["blue"],
    sizes: ["S", "M", "L"],
    pricePerDay: 3200,
    blurb:
      "Layered ruffle skirt and pleated off-shoulder wrap in powder blue. Sample listing for 18th birthdays.",
    images: [
      { file: "gown-blue-2", alt: "Icy blue ball gown on a mannequin, angled view of the skirt layers.", w: 896, h: 912 },
      { file: "gown-blue-1", alt: "Icy blue ball gown on a headless mannequin, front view.", w: 896, h: 912 },
      { file: "gown-blue-3", alt: "Icy blue ball gown on a mannequin, sash and ruffle detail.", w: 896, h: 912 },
    ],
    bookedDates: ["2026-11-06", "2026-11-20"],
    sample: true,
  },
  {
    slug: "blue-sash-cotillion",
    name: "Blue sash cotillion gown",
    category: "formal",
    colors: ["blue", "silver"],
    sizes: ["XS", "S", "M", "L", "XL"],
    pricePerDay: 2600,
    blurb:
      "Crossed pleated sash over a beaded tulle skirt. Sample listing for cotillion and grand-entrance looks.",
    images: [
      { file: "gown-blue-3", alt: "Icy blue ball gown on a mannequin, sash and ruffle detail.", w: 896, h: 912 },
      { file: "gown-blue-2", alt: "Icy blue ball gown on a mannequin, angled view of the skirt layers.", w: 896, h: 912 },
      { file: "gown-blue-1", alt: "Icy blue ball gown on a headless mannequin, front view.", w: 896, h: 912 },
    ],
    bookedDates: ["2026-11-12", "2026-11-29"],
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
      "Tall gold crystal tiaras for debut and pageant looks. Pair with any gown. Sample accessory listing.",
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
  filipiniana: "Filipiniana",
  formal: "Formal",
  accessory: "Accessory",
};

export function getGown(slug: string): Gown | undefined {
  return GOWNS.find((g) => g.slug === slug);
}

export function formatPhp(n: number): string {
  return `₱${n.toLocaleString("en-PH")}`;
}

export type BookingStatus =
  "pending" | "confirmed" | "out" | "returned" | "cancelled";

export type Booking = {
  ref: string;
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
