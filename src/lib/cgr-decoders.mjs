// Shared by scripts/copy-draco-decoder.mjs (build) and the page (runtime) so
// the self-hosted Draco decoder path can't drift from what the build copies.
export const DRACO_THREE_VERSION = "0.183.2";
export const DRACO_DECODER_BASE = `/vendor/draco/three-${DRACO_THREE_VERSION}/`;
