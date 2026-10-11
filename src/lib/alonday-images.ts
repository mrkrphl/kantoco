/** Treat-2 slot. `"logowall"` ships own-04; `"stock"` is the r8 Akyurt unit. */
export let ALONDAY_TREAT2: "logowall" | "stock" = "logowall";

const R9 = "/demos/alonday-dental/r9";
const R8 = "/demos/alonday-dental/r8";

export const STOCK_CAPTION = "Stock photo, not the clinic";

const CLINIC_CREDIT =
  "Clinic photos: Alonday Dental Clinic (Facebook, Google Maps).";
const AUKJE_CREDIT = "Stock: Aukje Leermakers / Pexels.";
const AKYURT_CREDIT = "Stock: Engin Akyurt / Pexels.";

export type ImgSrc = {
  webp: string;
  jpg: string;
  w: number;
  h: number;
};

function src(base: string, file: string, w: number, h: number): ImgSrc {
  return { webp: `${base}/${file}.webp`, jpg: `${base}/${file}.jpg`, w, h };
}

const treat2Logowall = {
  group: "B" as const,
  src: src(R9, "treat-2-logowall-4x5", 1200, 1500),
  caption: "Their reception wall, BF Homes",
  alt: "The clinic's sign on a wood-panel wall under brass globe pendants.",
  position: "50% 50%",
  stock: false,
};

const treat2Stock = {
  group: "B" as const,
  src: src(R8, "treat-2-stock-unit-4x5", 1200, 1500),
  caption: STOCK_CAPTION,
  alt: "Stock photo: close detail of a dental unit, with an oak bench behind.",
  position: "45% 50%",
  stock: true,
};

const treat2Slots = { logowall: treat2Logowall, stock: treat2Stock };
const treat2 = treat2Slots[ALONDAY_TREAT2];

export const alondayImages = {
  plate: {
    desktop: src(R9, "plate-16x9", 2240, 1260),
    desktop1x: src(R9, "plate-16x9-1x", 1120, 630),
    mobile: src(R9, "plate-mobile-4x5", 1200, 1500),
    caption: STOCK_CAPTION,
    credit:
      treat2.stock
        ? `${CLINIC_CREDIT} ${AUKJE_CREDIT} ${AKYURT_CREDIT}`
        : `${CLINIC_CREDIT} ${AUKJE_CREDIT}`,
    alt: "Stock photo: an empty row of wooden waiting-room chairs under a curtained window.",
  },
  treat: [
    {
      group: "A" as const,
      src: src(R9, "treat-1-chair-4x5", 1200, 1500),
      caption: "Their treatment room",
      alt: "An empty treatment chair in the clinic, on a pale stone floor.",
      position: "50% 60%",
    },
    treat2,
    {
      group: "C" as const,
      src: src(R9, "treat-3-reception-4x5", 1200, 1500),
      caption: "Their front desk",
      alt: "The clinic's reception desk in front of a wood-panel wall.",
      position: "55% 50%",
    },
  ],
  storefront: {
    src: src(R9, "visit-storefront-1x1", 882, 882),
    caption: "Their front door on El\u00A0Grande Ave.",
    alt: "The clinic from the street: white front, green awning, red door, and the DENTAL CLINIC sign.",
  },
  sizes: {
    plate:
      "(min-width: 1312px) 1120px, calc(100vw - 2 * clamp(24px, 6vw, 96px))",
    sticky: "(min-width: 1024px) 448px, calc(100vw - 2 * clamp(24px, 6vw, 96px))",
    storefront:
      "(min-width: 1024px) 544px, calc(100vw - 2 * clamp(24px, 6vw, 96px))",
  },
} as const;
