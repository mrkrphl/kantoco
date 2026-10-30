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

export type AlphaRenderer = { draw: () => void; destroy: () => void };

type VideoWithRvfc = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: () => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

export function createAlphaRenderer(canvas: HTMLCanvasElement, video: HTMLVideoElement): AlphaRenderer | null {
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

  const size = () => {
    const w = video.videoWidth;
    const h = Math.round(video.videoHeight / 2);
    if (!w || !h) return false;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform1f(seamLoc, 0.5 / video.videoHeight);
    }
    return true;
  };
  let dead = false;
  const draw = () => {
    if (dead || video.readyState < 2 || !size()) return;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // New frames: requestVideoFrameCallback where available, else seeked/timeupdate.
  const v = video as VideoWithRvfc;
  let rvfc = 0;
  const onFrame = () => {
    draw();
    if (!dead && v.requestVideoFrameCallback) rvfc = v.requestVideoFrameCallback(onFrame);
  };
  const evs = ["loadeddata", "seeked", "timeupdate"] as const;
  if (v.requestVideoFrameCallback) {
    rvfc = v.requestVideoFrameCallback(onFrame);
    video.addEventListener("loadeddata", draw);
    video.addEventListener("seeked", draw);
  } else {
    evs.forEach((e) => video.addEventListener(e, draw));
  }
  draw();

  return {
    draw,
    destroy: () => {
      dead = true;
      if (rvfc && v.cancelVideoFrameCallback) v.cancelVideoFrameCallback(rvfc);
      evs.forEach((e) => video.removeEventListener(e, draw));
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
