/** CGR Cavite Gown Rentals: unlisted KantoCo sample (not the shop's site). */

/**
 * The gown shown in the 360° viewer.
 *
 * REAL: KantoCo's 3D build of the red sequin gown (Blender, Draco-compressed,
 * 1024 WebP textures, about 0.66 MB). Gown mesh and textures were made by
 * KantoCo (procedural shape, painted sequins); the headless dress form is
 * Blender Studio "Human Base Meshes" v1.4.1, CC0. No scan or photo of a
 * person is in the file. Needs the self-hosted Draco decoder (DRACO_DECODER_BASE).
 *
 * PLACEHOLDER: self-made CC0 lathe-built ball gown on a stand (r1).
 *
 * Flip GOWN_IS_PLACEHOLDER to switch; both files live in public/demos/cgr-gowns/.
 */
export const GOWN_IS_PLACEHOLDER = false;

const REAL_GOWN = {
  src: "/demos/cgr-gowns/cgr-red-gown.glb",
  alt: "A red sequin mermaid gown with a nude illusion bodice and a short train, on a headless dress form, shown in 3D. Drag to turn it.",
  note: "KantoCo 3D sample of the red sequin gown, close to the photo but not exact.",
  /** Blender front still on #878789 gray (600x984, 57 KB). The viewer frame uses the same gray. */
  poster: "/demos/cgr-gowns/cgr-red-gown-poster.webp",
} as const;

const PLACEHOLDER_GOWN = {
  src: "/demos/cgr-gowns/placeholder-gown.gltf",
  alt: "A red ball gown on a stand, shown in 3D. Drag to turn it.",
  note: "Stand-in model. The real CGR gown in 3D goes here.",
  poster: null,
} as const;

export const GOWN = GOWN_IS_PLACEHOLDER ? PLACEHOLDER_GOWN : REAL_GOWN;
export const GOWN_MODEL_SRC = GOWN.src;
export const GOWN_POSTER_SIZE = { width: 600, height: 984 } as const;

/**
 * MediaPipe Face Landmarker, self-hosted. scripts/fetch-mediapipe.mjs copies
 * the pinned wasm out of node_modules and downloads + checksums the model at
 * BUILD time into public/mediapipe/ (gitignored). Visitors only ever fetch
 * these from this site.
 */
export const MEDIAPIPE_VERSION = "0.10.35";
export const MEDIAPIPE_WASM_BASE = `/mediapipe/${MEDIAPIPE_VERSION}/wasm`;
export const FACE_LANDMARKER_MODEL =
  "/mediapipe/models/face_landmarker-float16-v1.task";

/** MediaPipe Pose Landmarker (lite), self-hosted and SHA-256 pinned like the face model (r6). */
export const POSE_LANDMARKER_MODEL =
  "/mediapipe/models/pose_landmarker_lite-float16-v1.task";

/* ---------- "Wear it live" art (r6) ---------- */

/**
 * true: the real cutouts Apple Dev committed (c5b12f8) under
 * public/demos/cgr-gowns/wear/. false: the SVG stand-ins in
 * public/demos/cgr-gowns/wear/placeholder/ (same canvas sizes).
 * Spec and how to flip: /workspace/cgr-work/wear-assets-spec.md.
 */
export const WEAR_ASSETS_REAL = true;

const WEAR_DIR = "/demos/cgr-gowns/wear";

/**
 * The ONE place every "Wear it live" art path, size and anchor is read from.
 * Filenames and canvas sizes are the ones given to Chip. Anchor numbers are
 * MEASURED in the real files (r6): the export stretched the bodice ~1.29x and
 * squeezed the full gown below the hips ~0.77x to hit the spec lines, so the
 * spec y-anchors (180/820/1990, 120/900) would warp it. Measured by matching
 * each cutout back to the source photo and running Pose Landmarker on it.
 * x: centreX/shoulderW are image px; y anchors can sit outside the canvas.
 */
const WEAR_SPEC = {
  /** Front view, gown only. Strapless, so the shoulder line is above the art. */
  gownFull: {
    file: "gown-full.webp",
    width: 1024,
    height: 2048,
    maxKB: 450,
    centreX: 497,
    shoulderY: 196,
    hipY: 929,
    kneeY: 1367,
    ankleY: 1723,
    shoulderW: 490,
  },
  /** Bodice only. Its hip line falls just below the canvas. */
  gownBodice: {
    file: "gown-bodice.webp",
    width: 1024,
    height: 1024,
    maxKB: 250,
    centreX: 500,
    shoulderY: 111,
    hipY: 1085,
    shoulderW: 490,
  },
  /** Centred; band centreline y=96 at the middle (it curves up to ~85 at the ends). */
  choker: { file: "choker.webp", width: 512, height: 192, maxKB: 60, bandY: 96, bandW: 390 },
  /** Both wrists use the same art. */
  bracelet: { file: "bracelet.webp", width: 256, height: 128, maxKB: 40 },
} as const;

/** No earring art yet (Apple Dev). The earring code stays; null shows nothing. */
const EARRINGS = {
  earringLeft: null as null | { file: string; width: 128; height: 256; hookX: 64; hookY: 16 },
  earringRight: null as null | { file: string; width: 128; height: 256; hookX: 64; hookY: 16 },
};

const wearSrc = (file: string) =>
  WEAR_ASSETS_REAL
    ? `${WEAR_DIR}/${file}`
    : `${WEAR_DIR}/placeholder/${file.replace(/\.webp$/, ".svg")}`;

type WithSrc<T> = T & { src: string };
type WearSpec = typeof WEAR_SPEC;
type EarringSpec = NonNullable<(typeof EARRINGS)["earringLeft"]>;
export type WearAssets = { [K in keyof WearSpec]: WithSrc<WearSpec[K]> } & {
  earringLeft: WithSrc<EarringSpec> | null;
  earringRight: WithSrc<EarringSpec> | null;
};

export const WEAR_ASSETS: WearAssets = {
  ...(Object.fromEntries(
    Object.entries(WEAR_SPEC).map(([k, v]) => [k, { ...v, src: wearSrc(v.file) }]),
  ) as { [K in keyof WearSpec]: WithSrc<WearSpec[K]> }),
  earringLeft: EARRINGS.earringLeft
    ? { ...EARRINGS.earringLeft, src: wearSrc(EARRINGS.earringLeft.file) }
    : null,
  earringRight: EARRINGS.earringRight
    ? { ...EARRINGS.earringRight, src: wearSrc(EARRINGS.earringRight.file) }
    : null,
};

export const cgr = {
  title: "CGR Cavite Gown Rentals · KantoCo sample (not live)",
  description:
    "KantoCo sample: turn a gown in 360°, try a tiara live with your phone camera, and check sample availability. Not the shop’s website.",
} as const;

/* ---------- SAMPLE data: not CGR's real catalogue or calendar ---------- */

export type GownShape = "ball" | "aline" | "mermaid" | "tulle";

export type SampleGown = {
  id: string;
  name: string;
  note: string;
  shape: GownShape;
  color: string;
  shade: string;
  /** Mon..Sun this week. true = free, false = booked. */
  week: readonly boolean[];
};

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const WEEK_DAYS_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const SAMPLE_GOWNS: readonly SampleGown[] = [
  {
    // r5: the 3D gown is a red sequin mermaid, so the card says (and draws) that.
    id: "red-mermaid",
    name: "Red sequin mermaid",
    note: "The one in 3D above",
    shape: "mermaid",
    color: "#9b1b2e",
    shade: "#5e0f1b",
    week: [true, true, false, true, false, false, true],
  },
  {
    id: "champagne-aline",
    name: "Champagne A-line",
    note: "Debut, prom",
    shape: "aline",
    color: "#d9bf91",
    shade: "#a88a59",
    week: [true, false, true, true, true, false, false],
  },
  {
    id: "emerald-mermaid",
    name: "Emerald mermaid",
    note: "Evening, entourage",
    shape: "mermaid",
    color: "#1f6b55",
    shade: "#0f3e31",
    week: [false, true, true, false, true, true, true],
  },
  {
    id: "blush-tulle",
    name: "Blush tulle gown",
    note: "Debut, pre-nup shoot",
    shape: "tulle",
    color: "#e6a9b4",
    shade: "#b97482",
    week: [true, true, true, false, false, true, false],
  },
];

export const SAMPLE_LABEL = "Sample data";

/**
 * The example Messenger question. Gown and day come from SAMPLE_GOWNS so the
 * copy can never disagree with the calendar: it asks about the preferred day
 * (Sunday) and, if the data ever marks that day booked, the first free day.
 */
const SAMPLE_ASK_GOWN = "red-mermaid";
const SAMPLE_ASK_PREFERRED_DAY = 6; // Sun

export function sampleMessengerAsk() {
  const gown = SAMPLE_GOWNS.find((g) => g.id === SAMPLE_ASK_GOWN) ?? SAMPLE_GOWNS[0];
  const day = gown.week[SAMPLE_ASK_PREFERRED_DAY]
    ? SAMPLE_ASK_PREFERRED_DAY
    : Math.max(0, gown.week.findIndex(Boolean));
  return {
    gown,
    dayIndex: day,
    dayName: WEEK_DAYS_LONG[day],
    free: gown.week[day],
    text: `Hi! Is the ${gown.name} free this ${WEEK_DAYS_LONG[day]}? I tried the teal tiara on the site too.`,
  };
}
