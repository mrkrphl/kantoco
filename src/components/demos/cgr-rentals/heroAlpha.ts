/**
 * Stacked-alpha hero renderer (round 5, behind HERO_ALPHA in Story.tsx).
 * The source mp4 carries colour in the top half and a greyscale matte in the
 * bottom half (white = opaque). Each new video frame is uploaded once and
 * drawn to a transparent WebGL canvas: rgb from the top half, alpha from the
 * bottom half's luma. Scrubbing stays in Story.tsx (the hidden <video> is
 * seeked exactly like the plain clip); this only paints frames.
 *
 * r7.1 (Paige QA): the alpha v2 colour plate is straight, not premultiplied
 * (it keeps a grey haze where the matte is 0), so colour is multiplied by
 * alpha instead of clamped to it. Clamping lifted the haze under the hem
 * into a pink-grey smear. Three soft masks keep any edge from showing:
 * - sides: alpha eases to 0 over the left 16% and right 9% (she walks in
 *   from the left edge and the cape leaves the frame there in the spin,
 *   which drew a hard vertical cut; the walk-in now emerges from dark);
 * - top 3% and bottom 8%;
 * - hem band (lower 30% of the frame): semi-opaque, desaturated pixels
 *   (the floor haze) are dropped; opaque gown pixels and saturated veil
 *   edges are kept, so sequins inside the gown stay.
 *
 * r7.6.4 (desktop): two backends share the same frame scheduling.
 * - "gl": the WebGL shader above (phones; iPhone confirmed).
 * - "2d": the same maths on the CPU (drawImage + getImageData +
 *   putImageData), no WebGL at all. Desktop uses it by default: it does not
 *   depend on the GPU's video-texture upload (a black or empty upload, or a
 *   blocklisted GPU, left a blank stage with no fallback) and cannot lose a
 *   context.
 * Each backend checks its own output: a lost WebGL context, a draw error,
 * or two blank reads of a frame where she must be in view (clip 3.0-7.9 s)
 * reports onFail(reason), and Story.tsx swaps to the other backend, then to
 * the poster.
 */

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D t;
uniform float seam;
varying vec2 uv;
void main() {
  vec3 c = texture2D(t, vec2(uv.x, min(uv.y * 0.5, 0.5 - seam))).rgb;
  float a = texture2D(t, vec2(uv.x, max(0.5 + uv.y * 0.5, 0.5 + seam))).r;
  float edge = smoothstep(0.0, 0.16, uv.x) * smoothstep(0.0, 0.09, 1.0 - uv.x)
    * smoothstep(0.0, 0.03, uv.y) * smoothstep(0.0, 0.08, 1.0 - uv.y);
  float mx = max(c.r, max(c.g, c.b));
  float sat = (mx - min(c.r, min(c.g, c.b))) / max(mx, 0.001);
  float band = smoothstep(0.62, 0.72, uv.y);
  float keep = mix(1.0, max(smoothstep(0.45, 0.62, sat), smoothstep(0.85, 0.97, a)), band);
  a *= edge * keep;
  gl_FragColor = vec4(c * a, a);
}`;

let support: boolean | null = null;

/** WebGL available (cached; creates one throwaway context the first time). */
export function supportsAlphaCanvas(): boolean {
  if (support !== null) return support;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl");
    support = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    support = false;
  }
  return support;
}

export type RenderMode = "gl" | "2d";
export type AlphaRenderer = { draw: () => void; destroy: () => void };
export type RenderHooks = { onDraw?: () => void; onFail?: (reason: string) => void };

type VideoWithRvfc = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

/** She is whole and in frame for this part of the clip, so a read must find her. */
const CHECK_FROM = 3.0;
const CHECK_TO = 7.9;

/** One row of RGBA (straight or premultiplied): is a lit figure in it? */
function rowHasFigure(px: Uint8Array | Uint8ClampedArray): boolean {
  let n = 0;
  let lum = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] > 24) {
      n++;
      lum += px[i] + px[i + 1] + px[i + 2];
    }
  }
  return n >= 6 && lum / n > 12;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

type Backend = { paint: () => Uint8Array | Uint8ClampedArray | null; free: () => void };

function glBackend(canvas: HTMLCanvasElement, video: HTMLVideoElement): Backend | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  const seamLoc = gl.getUniformLocation(prog, "seam");
  gl.clearColor(0, 0, 0, 0);
  let row = new Uint8Array(0);
  return {
    paint: () => {
      const w = video.videoWidth;
      const h = Math.round(video.videoHeight / 2);
      if (!w || !h || gl.isContextLost()) return null;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform1f(seamLoc, 0.5 / video.videoHeight);
        row = new Uint8Array(w * 4);
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // Mid-height row (GL rows run bottom-up; the middle is the middle).
      gl.readPixels(0, Math.floor(h / 2), w, 1, gl.RGBA, gl.UNSIGNED_BYTE, row);
      return row;
    },
    free: () => {
      if (gl.isContextLost()) return;
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}

function cpuBackend(canvas: HTMLCanvasElement, video: HTMLVideoElement): Backend | null {
  const ctx = canvas.getContext("2d");
  const scratch = document.createElement("canvas");
  const sctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx || !sctx) return null;
  let w = 0;
  let h = 0;
  let edge = new Float32Array(0);
  let band = new Float32Array(0);
  let out: ImageData | null = null;
  return {
    paint: () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return null;
      if (vw !== w || Math.round(vh / 2) !== h) {
        w = vw;
        h = Math.round(vh / 2);
        canvas.width = w;
        canvas.height = h;
        scratch.width = w;
        scratch.height = h * 2;
        out = ctx.createImageData(w, h);
        // The shader's soft masks, precomputed (uv sampled at pixel centres).
        edge = new Float32Array(w * h);
        band = new Float32Array(h);
        const ex = new Float32Array(w);
        for (let x = 0; x < w; x++) {
          const u = (x + 0.5) / w;
          ex[x] = smooth(0, 0.16, u) * smooth(0, 0.09, 1 - u);
        }
        for (let y = 0; y < h; y++) {
          const v = (y + 0.5) / h;
          const ey = smooth(0, 0.03, v) * smooth(0, 0.08, 1 - v);
          band[y] = smooth(0.62, 0.72, v);
          for (let x = 0; x < w; x++) edge[y * w + x] = ex[x] * ey;
        }
      }
      sctx.clearRect(0, 0, w, h * 2);
      sctx.drawImage(video, 0, 0, w, h * 2);
      const src = sctx.getImageData(0, 0, w, h * 2).data;
      const o = out!.data;
      const off = w * h * 4;
      for (let y = 0; y < h; y++) {
        const b = band[y];
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const r = src[i];
          const g = src[i + 1];
          const bl = src[i + 2];
          let a = src[off + i] / 255;
          let k = 1;
          if (b > 0) {
            const mx = Math.max(r, g, bl);
            const sat = (mx - Math.min(r, g, bl)) / Math.max(mx, 0.255);
            k = 1 + (Math.max(smooth(0.45, 0.62, sat), smooth(0.85, 0.97, a)) - 1) * b;
          }
          a *= edge[y * w + x] * k;
          o[i] = r;
          o[i + 1] = g;
          o[i + 2] = bl;
          o[i + 3] = a * 255;
        }
      }
      ctx.putImageData(out!, 0, 0);
      const mid = Math.floor(h / 2) * w * 4;
      return o.subarray(mid, mid + w * 4);
    },
    free: () => {
      scratch.width = 0;
      scratch.height = 0;
    },
  };
}

export function createAlphaRenderer(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  mode: RenderMode,
  hooks: RenderHooks = {},
): AlphaRenderer | null {
  let be: Backend | null = null;
  try {
    be = mode === "gl" ? glBackend(canvas, video) : cpuBackend(canvas, video);
  } catch {
    be = null;
  }
  if (!be) return null;
  const backend = be;
  let dead = false;
  let blank = 0;
  let lastCheck = -1;
  const fail = (reason: string) => {
    if (dead) return;
    dead = true;
    hooks.onFail?.(reason);
  };
  const onLost = (e: Event) => {
    e.preventDefault();
    fail("gl-context-lost");
  };
  if (mode === "gl") canvas.addEventListener("webglcontextlost", onLost);

  const draw = () => {
    if (dead || video.readyState < 2) return;
    let row: Uint8Array | Uint8ClampedArray | null;
    try {
      row = backend.paint();
    } catch {
      return fail(`${mode}-draw-error`);
    }
    if (!row) return;
    hooks.onDraw?.();
    // Blank check, once per distinct frame time where she must be in view.
    const t = video.currentTime;
    if (t < CHECK_FROM || t > CHECK_TO || Math.abs(t - lastCheck) < 0.03) return;
    lastCheck = t;
    if (rowHasFigure(row)) blank = 0;
    else if (++blank >= 2) fail(`${mode}-blank`);
  };

  // New frames: requestVideoFrameCallback where available, plus the media
  // events. r7.6.3: WebKit fires "seeked" (and rVFC skips paused seeks)
  // before the new frame can be uploaded, so a lone seek left the canvas
  // empty (reduced motion in Playwright WebKit). Each event also redraws two
  // frames later, once the decoded frame is current.
  const v = video as VideoWithRvfc;
  let rvfc = 0;
  let late = 0;
  const onFrame = () => {
    draw();
    if (!dead && v.requestVideoFrameCallback) rvfc = v.requestVideoFrameCallback(onFrame);
  };
  const onEvent = () => {
    draw();
    cancelAnimationFrame(late);
    late = requestAnimationFrame(() => {
      late = requestAnimationFrame(draw);
    });
  };
  const evs = ["loadeddata", "canplay", "seeked", "timeupdate", "playing"] as const;
  if (v.requestVideoFrameCallback) rvfc = v.requestVideoFrameCallback(onFrame);
  evs.forEach((e) => video.addEventListener(e, onEvent));
  onEvent();

  return {
    draw,
    destroy: () => {
      dead = true;
      cancelAnimationFrame(late);
      if (rvfc && v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(rvfc);
      evs.forEach((e) => video.removeEventListener(e, onEvent));
      canvas.removeEventListener("webglcontextlost", onLost);
      backend.free();
    },
  };
}
