// Build-time step (runs before `next build`): self-host the MediaPipe Face
// Landmarker runtime so visitors never call jsDelivr or Google.
//  - wasm: copied from node_modules/@mediapipe/tasks-vision (version pinned).
//  - model: downloaded once at BUILD time and checked against a SHA-256.
// Output goes to public/mediapipe/ (gitignored). Any mismatch fails the build.
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "0.10.35";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const MODEL_SHA256 =
  "64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff";
const WASM_FILES = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

const fail = (msg) => {
  console.error(`\n[fetch-mediapipe] BUILD FAILED: ${msg}\n`);
  process.exit(1);
};
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const pkgDir = join(root, "node_modules/@mediapipe/tasks-vision");
const pkg = JSON.parse(await readFile(join(pkgDir, "package.json"), "utf8"));
if (pkg.version !== VERSION) {
  fail(`@mediapipe/tasks-vision is ${pkg.version}, expected ${VERSION}`);
}

const wasmOut = join(root, "public/mediapipe", VERSION, "wasm");
await mkdir(wasmOut, { recursive: true });
for (const f of WASM_FILES) {
  await copyFile(join(pkgDir, "wasm", f), join(wasmOut, f));
}
console.log(`[fetch-mediapipe] copied ${WASM_FILES.length} wasm files (v${VERSION})`);

const modelOut = join(root, "public/mediapipe/models/face_landmarker-float16-v1.task");
await mkdir(dirname(modelOut), { recursive: true });
const existing = await stat(modelOut).catch(() => null);
if (existing && sha256(await readFile(modelOut)) === MODEL_SHA256) {
  console.log("[fetch-mediapipe] model already present, checksum OK");
} else {
  let buf = null;
  let lastErr = "";
  for (let attempt = 1; attempt <= 3 && !buf; attempt++) {
    try {
      const res = await fetch(MODEL_URL, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const b = Buffer.from(await res.arrayBuffer());
      const got = sha256(b);
      if (got !== MODEL_SHA256) throw new Error(`checksum ${got} != ${MODEL_SHA256}`);
      buf = b;
    } catch (e) {
      lastErr = String(e?.message ?? e);
      console.warn(`[fetch-mediapipe] model attempt ${attempt} failed: ${lastErr}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  if (!buf) fail(`could not fetch a verified face model: ${lastErr}`);
  await writeFile(modelOut, buf);
  console.log(`[fetch-mediapipe] model downloaded, ${buf.length} bytes, sha256 OK`);
}
