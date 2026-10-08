/** One-line plate swap. `"A"` ships the logo wall; `"B"` uses the r7 stock files. */
export let ALONDAY_PLATE: "A" | "B" = "A";

const R8 = "/demos/alonday-dental/r8";
const R7 = "/demos/alonday-dental/r7";

export const STOCK_CAPTION = "Stock photo, not the clinic";

const PLATE_CREDIT =
  "Clinic photos: Alonday Dental Clinic (Facebook, Google Maps). Stock: Engin Akyurt / Pexels.";

export type ImgSrc = {
  webp: string;
  jpg: string;
  w: number;
  h: number;
};

function src(base: string, file: string, w: number, h: number): ImgSrc {
  return { webp: `${base}/${file}.webp`, jpg: `${base}/${file}.jpg`, w, h };
}

const plateA = {
  key: "A" as const,
  desktop: src(R8, "plate-desktop-2x1", 2400, 1200),
  mobile: src(R8, "plate-mobile-4x5", 1200, 1500),
  caption: "Their reception wall, BF Homes",
  credit: PLATE_CREDIT,
  alt: "Alonday Dental Clinic's reception wall: wood panels, the clinic sign, and a brass globe pendant light.",
};

const plateB = {
  key: "B" as const,
  desktop: src(R7, "plate-B-desktop-16x9", 2400, 1350),
  mobile: src(R7, "plate-B-mobile-4x5", 1200, 1500),
  caption: STOCK_CAPTION,
  credit: `${PLATE_CREDIT}, Aukje Leermakers / Pexels.`,
  alt: "Stock photo of a warm waiting room with wood chairs.",
};

const plates = { A: plateA, B: plateB };

export const alondayImages = {
  plate: plates[ALONDAY_PLATE],
  treat: [
    {
      group: "A" as const,
      src: src(R8, "treat-1-chair-4x5", 1200, 1500),
      caption: "Their treatment room",
      alt: "An empty treatment chair in the clinic, on a pale stone floor.",
      position: "50% 60%",
    },
    {
      group: "B" as const,
      src: src(R8, "treat-2-stock-unit-4x5", 1200, 1500),
      caption: STOCK_CAPTION,
      alt: "Stock photo: close detail of a dental unit, with an oak bench behind.",
      position: "45% 50%",
      stock: true,
    },
    {
      group: "C" as const,
      src: src(R8, "treat-3-reception-4x5", 1200, 1500),
      caption: "Their front desk",
      alt: "The clinic's reception desk in front of a wood-panel wall.",
      position: "55% 50%",
    },
  ],
  storefront: {
    src: src(R8, "visit-storefront-1x1", 882, 882),
    caption: "Their front door on El\u00A0Grande Ave.",
    alt: "The clinic from the street: white front, green awning, red door, and the DENTAL CLINIC sign.",
  },
  sizes: {
    plate: "100vw",
    sticky: "(min-width: 1024px) 448px, calc(100vw - 2 * clamp(24px, 6vw, 96px))",
    storefront:
      "(min-width: 1024px) 544px, calc(100vw - 2 * clamp(24px, 6vw, 96px))",
  },
} as const;
