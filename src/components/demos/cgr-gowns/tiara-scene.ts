import type * as ThreeNS from "three";
import { TIARA_IMAGE_SIZE, TIARA_IMAGE_SRC } from "@/lib/cgr-tiara-image";
import type { TiaraPose } from "@/lib/cgr-tiara-pose";

/**
 * The tiara overlay: one transparent textured plane drawn by three.js over the
 * mirrored camera view. Orthographic camera in stage px. Nothing here reads
 * camera pixels; it only draws the tiara.
 */
export async function createTiaraScene(
  THREE: typeof ThreeNS,
  canvas: HTMLCanvasElement,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -4000, 4000);
  camera.position.z = 10;

  const texture = await new THREE.TextureLoader().loadAsync(TIARA_IMAGE_SRC);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const aspect = TIARA_IMAGE_SIZE.height / TIARA_IMAGE_SIZE.width;
  const geo = new THREE.PlaneGeometry(1, aspect);
  // Pivot near the bottom-centre of the band.
  geo.translate(0, aspect / 2 - 0.06 * aspect, 0);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    side: THREE.DoubleSide,
    opacity: 0,
  });
  const tiara = new THREE.Mesh(geo, mat);
  tiara.rotation.order = "ZYX";
  scene.add(tiara);

  let W = 1;
  let H = 1;

  return {
    get size() {
      return { W, H };
    },
    setSize(w: number, h: number) {
      W = Math.max(1, Math.round(w));
      H = Math.max(1, Math.round(h));
      renderer.setSize(W, H, false);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
    },
    /** Place the tiara; `fade` eases opacity toward shown/hidden. */
    update(pose: TiaraPose | null, visible: boolean, fade = 0.25) {
      if (pose) {
        tiara.position.set(pose.x - W / 2, H / 2 - pose.y, 0);
        tiara.scale.setScalar(pose.width);
        // Screen roll is clockwise-positive (y down); three.js z is CCW.
        tiara.rotation.set(0, pose.yaw, -pose.roll);
      }
      const target = visible ? 1 : 0;
      mat.opacity += (target - mat.opacity) * fade;
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      texture.dispose();
      renderer.dispose();
    },
  };
}
