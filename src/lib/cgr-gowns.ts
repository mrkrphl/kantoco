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
 * MediaPipe Face Landmarker assets. Loaded from the official CDNs (the push
 * path for this sample is text-only, so the ~10 MB wasm can't be self-hosted
 * under /public yet). Only these static files are downloaded; camera frames
 * never leave the phone.
 */
export const MEDIAPIPE_VERSION = "0.10.35";
export const MEDIAPIPE_WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
export const FACE_LANDMARKER_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

export const cgr = {
  title: "CGR Cavite Gown Rentals · KantoCo sample (not live)",
  description:
    "KantoCo sample: turn a gown in 360° and try a tiara live with your phone camera. Not the shop’s website.",
} as const;
