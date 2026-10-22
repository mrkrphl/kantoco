/**
 * Viewer code, loaded only when the 3D gown is armed (tap / focus / desktop
 * in-view). Pulled in with import() from gown-prefetch.ts, in parallel with
 * the .glb and Draco fetches.
 */
import "@google/model-viewer";
import { DefaultLoadingManager } from "three";

/**
 * three's DRACOLoader fetches its decoder through DefaultLoadingManager. Point
 * the self-hosted decoder URLs at the blob: copies we already downloaded, so
 * the decoder is never fetched a second time (cache on or off).
 */
export function routeDecoderUrls(map: ReadonlyMap<string, string>) {
  DefaultLoadingManager.setURLModifier((url) => map.get(url) ?? url);
}
