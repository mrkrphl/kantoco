import { GOWN_MODEL_SRC } from "@/lib/cgr-gowns";
import { DRACO_DECODER_BASE } from "@/lib/cgr-decoders.mjs";

/**
 * One trigger, three parallel downloads (r5). Before, the viewer code, then
 * the .glb, then the Draco decoder loaded one after another; on Slow 4G that
 * was 9 to 10 s from tap to 3D.
 *
 * startGown() is called straight from pointerdown / focus / click on the
 * poster (or the desktop in-view observer) and starts, at once:
 *  - the viewer code (model-viewer + three) via import();
 *  - the .glb, fetched once and handed to model-viewer as a blob: URL;
 *  - both Draco decoder files, fetched once and routed to three's
 *    DRACOLoader as blob: URLs (see gown-runtime.ts).
 * Blob URLs rather than "warm the HTTP cache" so nothing is fetched twice even
 * when the cache is off or the response isn't cacheable. Same-origin only;
 * CSP already allows connect-src blob:. Memoised: one download per page.
 */
const DRACO_FILES = ["draco_wasm_wrapper.js", "draco_decoder.wasm"] as const;

export type GownReady = { src: string };
let job: Promise<GownReady> | null = null;

function toBlobUrl(url: string): Promise<string> {
  return fetch(url, { credentials: "same-origin" })
    .then((r) => {
      if (!r.ok) throw new Error(`${url} ${r.status}`);
      return r.blob();
    })
    .then((b) => URL.createObjectURL(b));
}

export function startGown(): Promise<GownReady> {
  if (job) return job;
  // Must be set before model-viewer is defined; the CSP blocks Google's CDN.
  const w = self as typeof self & { ModelViewerElement?: Record<string, unknown> };
  w.ModelViewerElement = {
    ...(w.ModelViewerElement ?? {}),
    dracoDecoderLocation: DRACO_DECODER_BASE,
  };
  const code = import("./gown-runtime");
  const model = toBlobUrl(GOWN_MODEL_SRC);
  const draco = Promise.all(
    DRACO_FILES.map((f) =>
      toBlobUrl(DRACO_DECODER_BASE + f).then((u) => [DRACO_DECODER_BASE + f, u] as const),
    ),
  );
  job = Promise.all([code, model, draco]).then(
    ([rt, src, pairs]) => {
      rt.routeDecoderUrls(new Map(pairs));
      return { src };
    },
    // A prefetch failed: fall back to plain URLs (model-viewer fetches them).
    () => code.then(() => ({ src: GOWN_MODEL_SRC })),
  );
  job.catch(() => {
    job = null;
  });
  return job;
}
