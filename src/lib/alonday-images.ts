/** One-line plate swap. Change to `"B"` for the stock waiting room. */
export let ALONDAY_PLATE: "A" | "B" = "A";

const R7 = "/demos/alonday-dental/r7";

export const STOCK_CAPTION = "Stock photo, not the clinic.";

const PLATE_CREDIT =
  "Clinic photos: Alonday Dental Clinic (Facebook, Google Maps). Stock: Engin Akyurt / Pexels.";

type Src = {
  webp: string;
  jpg: string;
  w: number;
  h: number;
};

function src(file: string, w: number, h: number): Src {
  return { webp: `${R7}/${file}.webp`, jpg: `${R7}/${file}.jpg`, w, h };
}

const plateA = {
  key: "A" as const,
  desktop: src("plate-A-desktop-16x9", 2400, 1350),
  mobile: src("plate-A-mobile-4x5", 1200, 1500),
  caption: null as string | null,
  credit: PLATE_CREDIT,
  alt: "The clinic reception wall: wood panels, the Alonday sign, and brass globe pendants.",
};

const plateB = {
  key: "B" as const,
  desktop: src("plate-B-desktop-16x9", 2400, 1350),
  mobile: src("plate-B-mobile-4x5", 1200, 1500),
  caption: STOCK_CAPTION,
  credit: `${PLATE_CREDIT}, Aukje Leermakers / Pexels.`,
  alt: "Stock photo of a warm waiting room with wood chairs.",
};

const plates = { A: plateA, B: plateB };

export const alondayImages = {
  plate: plates[ALONDAY_PLATE],
  treat1: {
    src: src("treat-1-operatory-4x5", 1200, 1500),
    alt: "An empty treatment chair in the clinic, on a pale stone floor.",
  },
  treat2: {
    src: src("treat-2-stock-unit-4x5", 1200, 1500),
    alt: "Stock photo: close detail of a dental unit, with an oak bench behind.",
    caption: STOCK_CAPTION,
  },
  treat3: {
    src: src("treat-3-reception-4x5", 1200, 1500),
    alt: "The clinic's reception desk in front of a wood-panel wall.",
  },
  storefront: {
    desktop: src("visit-storefront-desktop-4x3", 1084, 813),
    mobile: src("visit-storefront-mobile-1x1", 918, 918),
    alt: "The clinic from the street: white front, green awning, red door, and the DENTAL CLINIC sign.",
  },
  sizes: {
    plate:
      "(min-width: 1184px) 1120px, calc(100vw - 2 * clamp(24px, 6vw, 96px))",
    treat: "(min-width: 1024px) 430px, 100vw",
    treat2: "(min-width: 1024px) 340px, 64vw",
    storefront: "(min-width: 768px) 640px, calc(100vw - 2 * clamp(24px, 6vw, 96px))",
  },
} as const;
