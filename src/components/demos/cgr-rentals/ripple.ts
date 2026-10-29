/**
 * Hand-rolled WebGL hover ripple for gown photos: a soft fabric wave that
 * radiates from the pointer plus a sparse sequin glint. One shared canvas is
 * moved into whichever card is hovered, so there is only ever one GL context.
 * No libraries. Returns null when WebGL is missing (CSS shimmer takes over).
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform vec2 uRes;
uniform vec2 uScale;
uniform vec2 uOff;
uniform float uTime;
uniform float uHover;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 d = vUv - uMouse;
  d.x *= uRes.x / uRes.y;
  float dist = length(d);
  // Soft ring wave from the pointer, fading with distance.
  float ring = sin(dist * 34.0 - uTime * 4.2) * exp(-dist * 4.5);
  // Slow fabric sway across the whole photo.
  float sway = sin(vUv.y * 8.0 + uTime * 1.4) * 0.0035;
  vec2 dir = d / max(dist, 0.0001);
  vec2 uv = vUv + (dir * ring * 0.011 + vec2(sway, 0.0)) * uHover;
  vec3 col = texture2D(uTex, uv * uScale + uOff).rgb;
  // Light catches the wave crests.
  col *= 1.0 + ring * 0.07 * uHover;
  // Sequin glints: sparse cells that twinkle on bright fabric, denser near the pointer.
  vec2 g = vUv * uRes / 4.0;
  vec2 cell = floor(g);
  float h = hash(cell);
  float dot1 = smoothstep(0.42, 0.0, length(fract(g) - 0.5));
  float tw = pow(max(0.0, sin(uTime * 2.6 + h * 40.0)), 16.0);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float near = exp(-dist * 3.5);
  float glint = tw * dot1 * step(0.93, h) * smoothstep(0.18, 0.6, lum) * (0.3 + 1.2 * near);
  col += vec3(1.0, 0.88, 0.7) * glint * 0.8;
  gl_FragColor = vec4(col * uHover, uHover);
}`;

type Tex = { tex: WebGLTexture; w: number; h: number };

export type Ripple = {
  attach: (host: HTMLElement, src: string) => void;
  move: (u: number, v: number) => void;
  detach: () => void;
  destroy: () => void;
};

export function createRipple(): Ripple | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.className = "cgr-ripple";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uMouse = u("uMouse");
  const uRes = u("uRes");
  const uScale = u("uScale");
  const uOff = u("uOff");
  const uTime = u("uTime");
  const uHover = u("uHover");
  gl.uniform1i(u("uTex"), 0);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const cache = new Map<string, Tex | "loading">();
  let current: Tex | null = null;
  let host: HTMLElement | null = null;
  let hover = 0;
  let want = 0;
  let mouse = [0.5, 0.5];
  let smooth = [0.5, 0.5];
  let raf = 0;
  const t0 = performance.now();

  const load = (src: string) => {
    const hit = cache.get(src);
    if (hit && hit !== "loading") {
      current = hit;
      return;
    }
    if (hit === "loading") return;
    cache.set(src, "loading");
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      const t = { tex, w: img.naturalWidth, h: img.naturalHeight };
      cache.set(src, t);
      if (host && host.dataset.src === src) {
        current = t;
        kick();
      }
    };
  };

  const frame = () => {
    raf = 0;
    hover += (want - hover) * 0.12;
    if (Math.abs(want - hover) < 0.01) hover = want;
    smooth = [smooth[0] + (mouse[0] - smooth[0]) * 0.2, smooth[1] + (mouse[1] - smooth[1]) * 0.2];
    if (!host || !current) {
      if (hover > 0) raf = requestAnimationFrame(frame);
      return;
    }
    const w = canvas.width;
    const h = canvas.height;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // object-fit: cover mapping.
    const boxA = w / h;
    const imgA = current.w / current.h;
    let sx = 1;
    let sy = 1;
    if (imgA > boxA) sx = boxA / imgA;
    else sy = imgA / boxA;
    gl.bindTexture(gl.TEXTURE_2D, current.tex);
    gl.uniform2f(uScale, sx, sy);
    gl.uniform2f(uOff, (1 - sx) / 2, (1 - sy) / 2);
    gl.uniform2f(uRes, w, h);
    gl.uniform2f(uMouse, smooth[0], smooth[1]);
    gl.uniform1f(uTime, (performance.now() - t0) / 1000);
    gl.uniform1f(uHover, hover);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (hover > 0 || want > 0) raf = requestAnimationFrame(frame);
    else {
      canvas.remove();
      host = null;
    }
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  return {
    attach(el, src) {
      if (host !== el) {
        host = el;
        el.dataset.src = src;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.max(1, Math.round(el.clientWidth * dpr));
        canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
        hover = 0;
        current = null;
        el.appendChild(canvas);
      }
      want = 1;
      load(src);
      kick();
    },
    move(x, y) {
      mouse = [x, 1 - y];
      if (hover < 0.02) smooth = mouse;
      kick();
    },
    detach() {
      want = 0;
      kick();
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
