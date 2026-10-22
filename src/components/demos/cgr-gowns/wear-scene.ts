import type * as ThreeNS from "three";
import type { WearDraw } from "./wear-types";
import { WEAR_ASSETS } from "@/lib/cgr-gowns";
import { TIARA_IMAGE_SIZE, TIARA_IMAGE_SRC } from "@/lib/cgr-tiara-image";
import { gridRows, type GownArt, type Pt } from "@/lib/cgr-wear-pose";

/**
 * "Wear it live" overlay (r6). Draws, over the mirrored camera view:
 *  1. the gown cutout warped onto a 4x8 grid mesh (full gown or bodice),
 *  2. soft "eraser" capsules that cut the gown away where an arm is in front,
 *  3. jewellery planes (choker, both bracelets, earrings when art exists, tiara).
 * Orthographic camera in stage px. Nothing here reads camera pixels.
 */
const COLS = 4;

const GOWN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Mild edge feathering: a 5-tap alpha average (about 1.5 texels) softens the
// cutout edge and the patched seams without blurring the sequins (colour is
// the centre tap). The bodice also fades out over its cut-off bottom edge.
const GOWN_FRAG = /* glsl */ `
uniform sampler2D map;
uniform vec2 texel;
uniform float opacity;
uniform float bottomFade;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(map, vUv);
  float a = c.a * 0.4
    + 0.15 * texture2D(map, vUv + vec2(texel.x, 0.0)).a
    + 0.15 * texture2D(map, vUv - vec2(texel.x, 0.0)).a
    + 0.15 * texture2D(map, vUv + vec2(0.0, texel.y)).a
    + 0.15 * texture2D(map, vUv - vec2(0.0, texel.y)).a;
  if (bottomFade > 0.0) a *= smoothstep(0.0, bottomFade, vUv.y);
  gl_FragColor = vec4(c.rgb, a * opacity);
  #include <colorspace_fragment>
}`;

const ERASE_FRAG = /* glsl */ `
uniform float halfLen;
uniform float radius;
varying vec2 vLocal;
void main() {
  float dx = max(abs(vLocal.x) - halfLen, 0.0);
  float d = length(vec2(dx, vLocal.y));
  float a = 1.0 - smoothstep(radius * 0.6, radius, d);
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}`;
const ERASE_VERT = /* glsl */ `
uniform vec2 size;
varying vec2 vLocal;
void main() {
  vLocal = position.xy * size; // local stage px
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vLocal, 0.0, 1.0);
}`;

type Art = GownArt & { src: string };

export async function createWearScene(THREE: typeof ThreeNS, canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  camera.position.z = 5;
  const loader = new THREE.TextureLoader();
  const tex = async (src: string) => {
    const t = await loader.loadAsync(src);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return t;
  };
  const disposables: { dispose(): void }[] = [];

  let W = 1;
  let H = 1;
  // stage px (y down) -> world (y up, centred)
  const wx = (p: Pt) => p.x - W / 2;
  const wy = (p: Pt) => H / 2 - p.y;

  /* ---------- gowns ---------- */
  const makeGown = async (art: Art, bottomFade: number) => {
    const rows = gridRows(art);
    const t = await tex(art.src);
    const n = rows.length * (COLS + 1);
    const pos = new Float32Array(n * 3);
    const uv = new Float32Array(n * 2);
    rows.forEach((y, r) => {
      for (let c = 0; c <= COLS; c++) {
        const i = r * (COLS + 1) + c;
        uv[i * 2] = c / COLS;
        uv[i * 2 + 1] = 1 - Math.min(1, Math.max(0, y / art.height));
      }
    });
    const idx: number[] = [];
    for (let r = 0; r < rows.length - 1; r++) {
      for (let c = 0; c < COLS; c++) {
        const a = r * (COLS + 1) + c;
        const b = a + 1;
        const d = a + COLS + 1;
        const e = d + 1;
        idx.push(a, d, b, b, d, e);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setIndex(idx);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: t },
        texel: { value: new THREE.Vector2(1.5 / art.width, 1.5 / art.height) },
        opacity: { value: 0 },
        bottomFade: { value: bottomFade },
      },
      vertexShader: GOWN_VERT,
      fragmentShader: GOWN_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 0;
    scene.add(mesh);
    disposables.push(geo, mat, t);
    return { mesh, mat, rows, pos: geo.getAttribute("position") as ThreeNS.BufferAttribute, art };
  };

  const A = WEAR_ASSETS;
  const [full, bodice] = await Promise.all([
    makeGown(A.gownFull as unknown as Art, 0),
    // The bodice art is cut off at the canvas bottom: fade its last ~10%.
    makeGown(A.gownBodice as unknown as Art, 0.1),
  ]);

  /* ---------- arm erasers ---------- */
  const eraseBlend = {
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.ZeroFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendEquationAlpha: THREE.AddEquation,
    blendSrcAlpha: THREE.ZeroFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  } as const;
  const erasers = Array.from({ length: 6 }, () => {
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.ShaderMaterial({
      uniforms: { halfLen: { value: 0 }, radius: { value: 1 }, size: { value: new THREE.Vector2(1, 1) } },
      vertexShader: ERASE_VERT,
      fragmentShader: ERASE_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      ...eraseBlend,
    });
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = 1;
    m.visible = false;
    m.frustumCulled = false;
    scene.add(m);
    disposables.push(geo, mat);
    return { m, mat };
  });

  /* ---------- jewellery ---------- */
  const plane = async (
    src: string,
    w: number,
    h: number,
    pivotX: number,
    pivotY: number,
  ) => {
    const t = await tex(src);
    const geo = new THREE.PlaneGeometry(w, h);
    // Move the pivot (image px, y down) to the origin.
    geo.translate(w / 2 - pivotX, -(h / 2 - pivotY), 0);
    const mat = new THREE.MeshBasicMaterial({
      map: t,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0,
    });
    const m = new THREE.Mesh(geo, mat);
    m.renderOrder = 2;
    m.frustumCulled = false;
    scene.add(m);
    disposables.push(geo, mat, t);
    return { m, mat, w };
  };
  const ch = A.choker;
  const br = A.bracelet;
  const [choker, braL, braR, earL, earR, tiara] = await Promise.all([
    plane(ch.src, ch.width, ch.height, ch.width / 2, ch.bandY),
    plane(br.src, br.width, br.height, br.width / 2, br.height / 2),
    plane(br.src, br.width, br.height, br.width / 2, br.height / 2),
    A.earringLeft
      ? plane(A.earringLeft.src, A.earringLeft.width, A.earringLeft.height, A.earringLeft.hookX, A.earringLeft.hookY)
      : Promise.resolve(null),
    A.earringRight
      ? plane(A.earringRight.src, A.earringRight.width, A.earringRight.height, A.earringRight.hookX, A.earringRight.hookY)
      : Promise.resolve(null),
    // Tiara: pivot near the bottom-centre of the band, like the tiara try-on.
    plane(
      TIARA_IMAGE_SRC,
      TIARA_IMAGE_SIZE.width,
      TIARA_IMAGE_SIZE.height,
      TIARA_IMAGE_SIZE.width / 2,
      TIARA_IMAGE_SIZE.height * 0.94,
    ),
  ]);
  const chokerBandW = ch.bandW;

  const ease = (mat: { opacity: number }, show: boolean, k = 0.3) => {
    mat.opacity += ((show ? 1 : 0) - mat.opacity) * k;
    if (mat.opacity < 0.01) mat.opacity = 0;
  };
  const place = (
    p: { m: ThreeNS.Mesh; mat: { opacity: number }; w: number } | null,
    at: WearDraw["choker"],
    pxPerImg: number,
  ) => {
    if (!p) return;
    if (at && at.show) {
      p.m.position.set(at.x - W / 2, H / 2 - at.y, 0);
      p.m.scale.setScalar(pxPerImg);
      // Screen rotation is clockwise-positive (y down); three.js z is CCW.
      p.m.rotation.set(0, 0, -at.rot);
    }
    ease(p.mat, !!at?.show);
  };

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
    update(d: WearDraw) {
      for (const g of [full, bodice]) {
        const on = d.mode === (g === full ? "full" : "half") && d.grid !== null;
        if (on && d.grid) {
          const arr = g.pos.array as Float32Array;
          d.grid.forEach((p, i) => {
            arr[i * 3] = wx(p);
            arr[i * 3 + 1] = wy(p);
            arr[i * 3 + 2] = 0;
          });
          g.pos.needsUpdate = true;
        }
        const u = g.mat.uniforms.opacity;
        u.value += ((on ? 1 : 0) - u.value) * 0.35;
        if (u.value < 0.01) u.value = 0;
        g.mesh.visible = u.value > 0;
      }
      erasers.forEach((e, i) => {
        const s = d.arms[i];
        e.m.visible = !!s;
        if (!s) return;
        const L = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y);
        const cx = (s.a.x + s.b.x) / 2;
        const cy = (s.a.y + s.b.y) / 2;
        e.m.position.set(cx - W / 2, H / 2 - cy, 0);
        e.m.rotation.set(0, 0, -Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x));
        e.mat.uniforms.size.value.set(L + 2 * s.r, 2 * s.r);
        e.mat.uniforms.halfLen.value = L / 2;
        e.mat.uniforms.radius.value = s.r;
      });
      place(choker, d.choker, d.choker ? d.choker.w / chokerBandW : 1);
      place(braL, d.bracelets[0], d.bracelets[0] ? d.bracelets[0].w / br.width : 1);
      place(braR, d.bracelets[1], d.bracelets[1] ? d.bracelets[1].w / br.width : 1);
      // Earrings: [subject's right, subject's left]; nothing drawn without art.
      place(earR, d.earrings[0], earR && d.earrings[0] ? d.earrings[0].w / earR.w : 1);
      place(earL, d.earrings[1], earL && d.earrings[1] ? d.earrings[1].w / earL.w : 1);
      place(tiara, d.tiara, d.tiara ? d.tiara.w / TIARA_IMAGE_SIZE.width : 1);
    },
    render() {
      renderer.render(scene, camera);
    },
    dispose() {
      disposables.forEach((x) => x.dispose());
      renderer.dispose();
    },
  };
}
