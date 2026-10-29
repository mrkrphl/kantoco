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
    "Debut, pageant, Filipiniana and formal gowns on Jose Abad Santos Ave. Check a date, request a hold, get a reference code.",
  chip: "Sample · ₱200 / booking commission model",
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

export const CATEGORIES: { id: GownCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "debut", label: "Debut" },
  { id: "pageant", label: "Pageant" },
  { id: "filipiniana", label: "Filipiniana" },
  { id: "formal", label: "Formal" },
  { id: "accessory", label: "Accessories" },
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
  { id: "One size", label: "One size" },
];

/**
 * Catalogue. Prices, sizes and booked dates are SAMPLE DATA — public refs
 * did not list rental rates. Photos are face-free crops from public FB/Maps.
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
      {
        file: "gown-red-full",
        alt: "Deep red sequin evening gown, full length, on a dark ground. Face-free cutout.",
        w: 1024,
        h: 2048,
      },
      {
        file: "gown-red-bodice",
        alt: "Close view of the red gown bodice with lace and sequin detail.",
        w: 1024,
        h: 1024,
      },
      {
        file: "gown-red-detail",
        alt: "Close-up of the red gown's beaded lace bodice.",
        w: 570,
        h: 1280,
      },
      {
        file: "gown-red-skirt",
        alt: "Close-up of the red gown's sequin skirt.",
        w: 300,
        h: 910,
      },
    ],
    bookedDates: [
      "2026-11-08",
      "2026-11-09",
      "2026-11-15",
      "2026-11-22",
      "2026-12-06",
    ],
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
      "Voluminous icy-blue ball gown on a mannequin — sculptural shoulder ruffles and a full debut skirt. Sample listing.",
    images: [
      {
        file: "gown-blue-1",
        alt: "Icy blue ball gown on a headless mannequin, front view.",
        w: 896,
        h: 912,
      },
      {
        file: "gown-blue-2",
        alt: "Icy blue ball gown on a mannequin, angled view of skirt layers.",
        w: 896,
        h: 912,
      },
      {
        file: "gown-blue-3",
        alt: "Icy blue ball gown on a mannequin, side ruffle detail.",
        w: 896,
        h: 912,
      },
    ],
    bookedDates: ["2026-11-01", "2026-11-14", "2026-11-15", "2026-11-28"],
    sample: true,
  },
  {
    slug: "crystal-tiara-set",
    name: "Crystal tiara set",
    category: "accessory",
    colors: ["silver", "gold", "mixed"],
    sizes: ["One size"],
    pricePerDay: 500,
    blurb:
      "Assorted crystal tiaras for debut and pageant looks. Pair with a gown. Sample accessory listing.",
    images: [
      {
        file: "accessories-tiaras",
        alt: "Silver and gold crystal tiaras on a display rack. No faces.",
        w: 490,
        h: 332,
      },
      {
        file: "accessories-tiaras-2",
        alt: "Close-up of red, blue and pink stone tiaras on stands.",
        w: 900,
        h: 624,
      },
    ],
    bookedDates: ["2026-11-08", "2026-11-22"],
    sample: true,
  },
  {
    slug: "choker-and-bracelet",
    name: "Choker and bracelet set",
    category: "accessory",
    colors: ["silver"],
    sizes: ["One size"],
    pricePerDay: 350,
    blurb:
      "Sparkle choker and crystal bracelet cutouts for formal looks. Sample accessory listing.",
    images: [
      {
        file: "accessory-choker",
        alt: "Crystal choker accessory on a dark ground.",
        w: 592,
        h: 272,
      },
      {
        file: "accessory-bracelet",
        alt: "Crystal bracelet accessory on a dark ground.",
        w: 336,
        h: 208,
      },
    ],
    bookedDates: [],
    sample: true,
  },
];

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
