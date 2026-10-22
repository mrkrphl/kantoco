// Build-time step (runs before `next build`): self-host the MediaPipe Face
// and Pose Landmarker runtime so visitors never call jsDelivr or Google.
//  - wasm: copied from node_modules/@mediapipe/tasks-vision (version pinned).
//  - models: downloaded once at BUILD time, each checked against a SHA-256.
// Output goes to public/mediapipe/ (gitignored). Any mismatch fails the build.
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = "0.10.35";
const MODELS = [
  {
    name: "face",
    url: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    sha256: "64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff",
    out: "public/mediapipe/models/face_landmarker-float16-v1.task",
  },
  {
    // r6 "Wear it live": lite pose model (5,777,746 bytes).
    name: "pose",
    url: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
    sha256: "59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a",
    out: "public/mediapipe/models/pose_landmarker_lite-float16-v1.task",
  },
];
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

for (const m of MODELS) {
  const modelOut = join(root, m.out);
  await mkdir(dirname(modelOut), { recursive: true });
  const existing = await stat(modelOut).catch(() => null);
  if (existing && sha256(await readFile(modelOut)) === m.sha256) {
    console.log(`[fetch-mediapipe] ${m.name} model already present, checksum OK`);
    continue;
  }
  let buf = null;
  let lastErr = "";
  for (let attempt = 1; attempt <= 3 && !buf; attempt++) {
    try {
      const res = await fetch(m.url, { signal: AbortSignal.timeout(60_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const b = Buffer.from(await res.arrayBuffer());
      const got = sha256(b);
      if (got !== m.sha256) throw new Error(`checksum ${got} != ${m.sha256}`);
      buf = b;
    } catch (e) {
      lastErr = String(e?.message ?? e);
      console.warn(`[fetch-mediapipe] ${m.name} model attempt ${attempt} failed: ${lastErr}`);
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  if (!buf) fail(`could not fetch a verified ${m.name} model: ${lastErr}`);
  await writeFile(modelOut, buf);
  console.log(`[fetch-mediapipe] ${m.name} model downloaded, ${buf.length} bytes, sha256 OK`);
}
