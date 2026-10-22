import { FACE_LANDMARKER_MODEL, MEDIAPIPE_WASM_BASE } from "@/lib/cgr-gowns";

/**
 * Warm-up for the try-on, all same-origin. Called when the visitor looks
 * about to tap "Try the tiara" (hover, focus, pointerdown, or the button
 * sitting in view for a moment). Results are memoised; a failed warm-up is
 * forgotten so the real start can retry.
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

/** Light warm-up (button in view): tracker JS + model (~3.8 MB). */
export function warmLight() {
  getModelBytes().catch(() => {});
  import("@mediapipe/tasks-vision").catch(() => {});
}

/** Full warm-up (hover / focus / pointerdown): adds the ~11 MB wasm. */
export function warmFull() {
  warmLight();
  warmRuntime().catch(() => {});
}
