/** CGR Cavite Gown Rentals: unlisted KantoCo sample (not the shop's site). */

/**
 * The gown shown in the 360° viewer. Swap this one path when Apple Dev's
 * real gown .glb lands (e.g. "/demos/cgr-gowns/cgr-red-gown.glb").
 * Current file: a self-made placeholder (lathe-built ball gown on a stand,
 * CC0, no third-party asset).
 */
export const GOWN_MODEL_SRC = "/demos/cgr-gowns/placeholder-gown.gltf";
export const GOWN_IS_PLACEHOLDER = true;

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
    id: "crimson-ball",
    name: "Crimson ball gown",
    note: "The one in 3D above",
    shape: "ball",
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
const SAMPLE_ASK_GOWN = "crimson-ball";
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
