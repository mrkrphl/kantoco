import {
  FACE_LANDMARKER_MODEL,
  MEDIAPIPE_WASM_BASE,
  POSE_LANDMARKER_MODEL,
} from "@/lib/cgr-gowns";

/**
 * Warm-up for the try-on, all same-origin. Called ONLY when the try-on
 * section scrolls into view or a Try button gets pointerdown / focus / tap.
 * Results are memoised; a failed warm-up is forgotten so the real start can
 * retry.
 */
let modelBytes: Promise<Uint8Array> | null = null;
let runtime: Promise<unknown> | null = null;

export function getModelBytes(): Promise<Uint8Array> {
  if (!modelBytes) {
    modelBytes = fetch(FACE_LANDMARKER_MODEL)
      .then((r) => {
        if (!r.ok) throw new Error(`model ${r.status}`);
        return r.arrayBuffer();
      })
      .then((b) => new Uint8Array(b))
      .catch((e) => {
        modelBytes = null;
        throw e;
      });
  }
  return modelBytes;
}

/** JS chunk + the wasm the browser will pick (SIMD or not), into the HTTP cache. */
export function warmRuntime(): Promise<unknown> {
  if (!runtime) {
    runtime = import("@mediapipe/tasks-vision")
      .then(async ({ FilesetResolver }) => {
        const fs = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_BASE);
        await Promise.all(
          [fs.wasmLoaderPath, fs.wasmBinaryPath].map((u) =>
            fetch(u).then((r) => r.arrayBuffer()),
          ),
        );
      })
      .catch((e) => {
        runtime = null;
        throw e;
      });
  }
  return runtime;
}

/** Model (~3.7 MB) + tracker JS + the ~11 MB wasm, all into cache. */
export function warmFull() {
  getModelBytes().catch(() => {});
  warmRuntime().catch(() => {});
}

/* ---------- r6 "Wear it live" ---------- */

let poseBytes: Promise<Uint8Array> | null = null;

/** Pose model (~5.8 MB), fetched once. Only ever called from a Wear it live tap. */
export function getPoseModelBytes(): Promise<Uint8Array> {
  if (!poseBytes) {
    poseBytes = fetch(POSE_LANDMARKER_MODEL)
      .then((r) => {
        if (!r.ok) throw new Error(`pose model ${r.status}`);
        return r.arrayBuffer();
      })
      .then((b) => new Uint8Array(b))
      .catch((e) => {
        poseBytes = null;
        throw e;
      });
  }
  return poseBytes;
}

/**
 * Pointerdown on "Wear it live": start the pose model + shared wasm right away
 * (same files the tiara uses, so a second try-on reuses the cache). Never on
 * idle, scroll or focus, on phones and desktop alike.
 */
export function warmWear() {
  getPoseModelBytes().catch(() => {});
  warmRuntime().catch(() => {});
}
