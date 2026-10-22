// Build-time step (runs before `next build`): self-host the Draco mesh
// decoder that <model-viewer> needs for the compressed gown .glb, so the page
// never loads it from Google's CDN (the page CSP only allows this site).
// Source: three's own copy in node_modules/three/examples/jsm/libs/draco/gltf
// (Apache-2.0). Output: public/vendor/draco/three-<version>/ (gitignored),
// versioned by path so it can be cached for a year. Missing files fail the build.
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const threeDir = join(root, "node_modules/three");
const FILES = ["draco_wasm_wrapper.js", "draco_decoder.wasm"];

try {
  const { version } = JSON.parse(
    await readFile(join(threeDir, "package.json"), "utf8"),
  );
  const expected = (await import("../src/lib/cgr-decoders.mjs")).DRACO_THREE_VERSION;
  if (version !== expected) {
    throw new Error(
      `three is ${version} but src/lib/cgr-decoders.mjs expects ${expected}; update DRACO_THREE_VERSION`,
    );
  }
  const out = join(root, "public/vendor/draco", `three-${version}`);
  await mkdir(out, { recursive: true });
  for (const f of FILES) {
    await copyFile(join(threeDir, "examples/jsm/libs/draco/gltf", f), join(out, f));
  }
  console.log(`[copy-draco-decoder] copied ${FILES.length} files (three ${version})`);
} catch (e) {
  console.error(`\n[copy-draco-decoder] BUILD FAILED: ${e.message}\n`);
  process.exit(1);
}
