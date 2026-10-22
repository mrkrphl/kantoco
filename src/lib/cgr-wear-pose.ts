/**
 * Pure math for "Wear it live" (r6). No DOM, no camera, no three.js.
 * Inputs are MediaPipe normalised landmarks; outputs are stage px (y down).
 * Unit-tested with synthetic points only (no images of people).
 */
import { toStage, type NormLandmark, type Pt, type Viewport } from "./cgr-tiara-pose";

export type { Pt, Viewport };
export type PoseLandmark = NormLandmark & { visibility?: number };

/** MediaPipe Pose Landmarker indices used. */
export const PL = {
  nose: 0,
  earL: 7,
  earR: 8,
  mouthL: 9,
  mouthR: 10,
  shL: 11,
  shR: 12,
  elL: 13,
  elR: 14,
  wrL: 15,
  wrR: 16,
  hipL: 23,
  hipR: 24,
  knL: 25,
  knR: 26,
  anL: 27,
  anR: 28,
} as const;

/** Face Landmarker indices used for jewellery. */
export const FL = {
  noseTip: 1,
  foreheadTop: 10,
  chin: 152,
  cheekR: 234, // subject's right face edge
  cheekL: 454, // subject's left face edge
  earR: 93,
  earL: 323,
} as const;

export const MIN_VIS = 0.5;
/** Knees and ankles are often under a skirt or long dress: accept lower visibility if in frame. */
export const MIN_VIS_LEGS = 0.3;

/* ------------------------------ One Euro ------------------------------ */

/** One Euro filter (Casiez et al. 2012) for one scalar. */
export class OneEuro {
  private x: number | null = null;
  private dx = 0;
  private t = 0;
  constructor(
    public minCutoff = 1.0,
    public beta = 0.015,
    public dCutoff = 1.0,
  ) {}
  private static alpha(cutoff: number, dt: number) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }
  reset() {
    this.x = null;
    this.dx = 0;
  }
  /** `t` in seconds. */
  filter(value: number, t: number): number {
    if (this.x === null) {
      this.x = value;
      this.t = t;
      return value;
    }
    const dt = Math.max(1e-3, t - this.t);
    this.t = t;
    const rawDx = (value - this.x) / dt;
    this.dx += OneEuro.alpha(this.dCutoff, dt) * (rawDx - this.dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    this.x += OneEuro.alpha(cutoff, dt) * (value - this.x);
    return this.x;
  }
}

/** One Euro per x/y of a fixed set of named points. */
export class PointSmoother<K extends string> {
  private f = new Map<string, OneEuro>();
  constructor(
    private minCutoff = 1.0,
    private beta = 0.015,
  ) {}
  private get(key: string) {
    let e = this.f.get(key);
    if (!e) {
      e = new OneEuro(this.minCutoff, this.beta);
      this.f.set(key, e);
    }
    return e;
  }
  point(key: K, p: Pt, t: number): Pt {
    return { x: this.get(key + ".x").filter(p.x, t), y: this.get(key + ".y").filter(p.y, t) };
  }
  value(key: K, v: number, t: number) {
    return this.get(key).filter(v, t);
  }
  /** Forget one point (after it was lost for a while) so it doesn't glide in from a stale spot. */
  resetKey(key: K) {
    this.f.delete(key + ".x");
    this.f.delete(key + ".y");
    this.f.delete(key);
  }
  reset() {
    this.f.forEach((e) => e.reset());
  }
}

/* ------------------------------ geometry ------------------------------ */

const sub = (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
const mul = (a: Pt, k: number): Pt => ({ x: a.x * k, y: a.y * k });
const len = (a: Pt) => Math.hypot(a.x, a.y);
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const norm = (a: Pt): Pt => {
  const l = len(a) || 1;
  return { x: a.x / l, y: a.y / l };
};
export const dist = (a: Pt, b: Pt) => len(sub(a, b));

/** Point-in-polygon (even-odd). */
export function inPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/* ------------------------------ body ------------------------------ */

export type BodyKey =
  | "shL" | "shR" | "elL" | "elR" | "wrL" | "wrR"
  | "hipL" | "hipR" | "knL" | "knR" | "anL" | "anR" | "nose" | "mouth";

/** Body points in stage px; null where not visible enough. */
export type Body = Record<BodyKey, Pt | null>;

const visOk = (l?: PoseLandmark, min = MIN_VIS) =>
  !!l && (l.visibility ?? 1) >= min && l.y > -0.05 && l.y < 1.05 && l.x > -0.05 && l.x < 1.05;

export function bodyFromPose(lm: PoseLandmark[] | undefined, v: Viewport): Body | null {
  if (!lm || lm.length < 29) return null;
  const at = (i: number, min = MIN_VIS) => (visOk(lm[i], min) ? toStage(lm[i], v) : null);
  const b: Body = {
    shL: at(PL.shL),
    shR: at(PL.shR),
    elL: at(PL.elL),
    elR: at(PL.elR),
    wrL: at(PL.wrL),
    wrR: at(PL.wrR),
    hipL: at(PL.hipL),
    hipR: at(PL.hipR),
    knL: at(PL.knL, MIN_VIS_LEGS),
    knR: at(PL.knR, MIN_VIS_LEGS),
    anL: at(PL.anL, MIN_VIS_LEGS),
    anR: at(PL.anR, MIN_VIS_LEGS),
    nose: at(PL.nose),
    mouth:
      visOk(lm[PL.mouthL]) && visOk(lm[PL.mouthR])
        ? lerpPt(toStage(lm[PL.mouthL], v), toStage(lm[PL.mouthR], v), 0.5)
        : null,
  };
  if (!b.shL || !b.shR || dist(b.shL, b.shR) < 12) return null;
  return b;
}

export type WearMode = "full" | "half";

/**
 * Full gown needs both hips and both ankles in frame; otherwise the bodice
 * (shoulders to hips). Null when the shoulders aren't found.
 */
export function autoMode(b: Body | null): WearMode | null {
  if (!b) return null;
  return b.hipL && b.hipR && b.anL && b.anR ? "full" : "half";
}

/** Where a gown image's anchor lines sit (image px, measured in the art). */
export type GownArt = {
  width: number;
  height: number;
  /** x of the body's centre line. */
  centreX: number;
  shoulderY: number;
  hipY: number;
  /** Full gown only. */
  kneeY?: number;
  ankleY?: number;
  /** Shoulder-joint to shoulder-joint width. */
  shoulderW: number;
};

/** Hip joints sit closer together than shoulder joints (typical ratio). */
export const HIP_TO_SHOULDER = 0.72;
/** Waist estimate: this far from shoulders to hips. */
export const WAIST_T = 0.55;

type Key = { y: number; c: Pt; axis: Pt; s: number };

/**
 * Grid vertex positions (stage px) for a gown image warped onto the body.
 * `rows` are image y values (top to bottom), `cols` quads across. Each anchor
 * line (shoulders, waist, hips, knees, ankles) is pinned to the matching body
 * points; the hem below the ankles follows the knee->ankle line, so it moves
 * with the ankles. Row-major, (cols+1) per row. Null if it can't anchor.
 */
export function gownGrid(
  b: Body,
  mode: WearMode,
  art: GownArt,
  rows: number[],
  cols = 4,
): Pt[] | null {
  if (!b.shL || !b.shR) return null;
  const shMid = lerpPt(b.shL, b.shR, 0.5);
  const shAxis = norm(sub(b.shL, b.shR)); // image +x = toward landmark 11
  const shW = dist(b.shL, b.shR);
  const down: Pt = { x: -shAxis.y, y: shAxis.x };
  if (down.y < 0) {
    down.x = -down.x;
    down.y = -down.y;
  }

  // Hips: measured, or estimated below the shoulders (selfie framing).
  let hipMid: Pt;
  let hipAxis: Pt;
  let hipW: number;
  if (b.hipL && b.hipR) {
    hipMid = lerpPt(b.hipL, b.hipR, 0.5);
    hipAxis = norm(sub(b.hipL, b.hipR));
    hipW = dist(b.hipL, b.hipR);
  } else {
    hipMid = add(shMid, mul(down, shW * 1.5));
    hipAxis = shAxis;
    hipW = shW * HIP_TO_SHOULDER;
  }
  // Keep hip axis pointing the same way as the shoulder axis.
  if (hipAxis.x * shAxis.x + hipAxis.y * shAxis.y < 0) hipAxis = mul(hipAxis, -1);
  const sSh = shW / art.shoulderW;
  // Hip width drives the skirt scale, but never let one noisy frame blow it up.
  const sHip = Math.min(sSh * 1.25, Math.max(sSh * 0.8, hipW / (art.shoulderW * HIP_TO_SHOULDER)));
  const keys: Key[] = [
    { y: art.shoulderY, c: shMid, axis: shAxis, s: sSh },
    {
      y: art.shoulderY + (art.hipY - art.shoulderY) * WAIST_T,
      c: lerpPt(shMid, hipMid, WAIST_T),
      axis: norm(lerpPt(shAxis, hipAxis, WAIST_T)),
      s: sSh + (sHip - sSh) * WAIST_T,
    },
    { y: art.hipY, c: hipMid, axis: hipAxis, s: sHip },
  ];

  if (mode === "full") {
    if (!b.anL || !b.anR || art.ankleY === undefined || art.kneeY === undefined) return null;
    const anMid = lerpPt(b.anL, b.anR, 0.5);
    const knMid =
      b.knL && b.knR
        ? lerpPt(b.knL, b.knR, 0.5)
        : lerpPt(hipMid, anMid, (art.kneeY - art.hipY) / (art.ankleY - art.hipY));
    keys.push({ y: art.kneeY, c: knMid, axis: hipAxis, s: sHip });
    keys.push({ y: art.ankleY, c: anMid, axis: hipAxis, s: sHip });
  }

  const at = (y: number): Key => {
    const last = keys[keys.length - 1];
    if (mode === "full" && y > last.y) {
      // Below the ankles (hem): carry on along the hip->ankle line, so the hem
      // follows the ankles without swinging on knee noise.
      const hip = keys[2];
      const t = (y - last.y) / (last.y - hip.y);
      return { y, c: add(last.c, mul(sub(last.c, hip.c), t)), axis: last.axis, s: last.s };
    }
    // Outside the anchors, carry on along the nearest segment's direction.
    let i = 0;
    while (i < keys.length - 2 && y > keys[i + 1].y) i++;
    const a = keys[i];
    const n = keys[i + 1];
    const t = (y - a.y) / (n.y - a.y);
    const tc = Math.min(1, Math.max(0, t));
    return {
      y,
      c: lerpPt(a.c, n.c, t),
      axis: norm(lerpPt(a.axis, n.axis, tc)),
      s: a.s + (n.s - a.s) * tc,
    };
  };

  const out: Pt[] = [];
  for (const y of rows) {
    const k = at(y);
    for (let i = 0; i <= cols; i++) {
      const ix = (art.width * i) / cols - art.centreX;
      out.push(add(k.c, mul(k.axis, ix * k.s)));
    }
  }
  return out;
}

/** Image rows for the grid: 8 quads, with lines on the anchors inside the canvas. */
export function gridRows(art: GownArt): number[] {
  const { shoulderY: s, hipY: h, kneeY: k, ankleY: an, height: H } = art;
  if (k !== undefined && an !== undefined) {
    const w = s + (h - s) * WAIST_T;
    return [0, s, w, h, (h + k) / 2, k, an, (an + H) / 2, H];
  }
  const rows = [0, s];
  for (let i = 1; i <= 7; i++) rows.push(s + ((H - s) * i) / 7);
  return rows;
}

/* -------------------------- arm-in-front test -------------------------- */

export type ArmSeg = { a: Pt; b: Pt; r: number };

/**
 * Cheap arm-in-front test (no segmentation): an upper arm or forearm counts as
 * in front of the gown when its elbow or wrist point lies inside the body
 * outline (shoulders, hips, knees or ankles), i.e. the arm crosses the dress.
 * Returns soft capsules where the gown should be cut away.
 */
export function armsInFront(b: Body, mode: WearMode): ArmSeg[] {
  if (!b.shL || !b.shR) return [];
  const shW = dist(b.shL, b.shR);
  const shMid = lerpPt(b.shL, b.shR, 0.5);
  const down = norm({ x: -(b.shL.y - b.shR.y), y: b.shL.x - b.shR.x });
  if (down.y < 0) {
    down.x = -down.x;
    down.y = -down.y;
  }
  const hipL = b.hipL ?? add(b.shL, mul(down, shW * 1.3));
  const hipR = b.hipR ?? add(b.shR, mul(down, shW * 1.3));
  // Inset the shoulders so an arm hanging at the side isn't "inside".
  const inL = lerpPt(b.shL, shMid, 0.12);
  const inR = lerpPt(b.shR, shMid, 0.12);
  // Hip/knee joints sit inside the body: widen them to the dress outline.
  const widen = (l: Pt, r: Pt, k: number): [Pt, Pt] => {
    const m = lerpPt(l, r, 0.5);
    return [add(m, mul(sub(l, m), 1 + k)), add(m, mul(sub(r, m), 1 + k))];
  };
  const [hl, hr] = widen(hipL, hipR, 0.35);
  const poly: Pt[] = [inR, inL, hl];
  if (mode === "full" && b.knL && b.knR) {
    const [kl, kr] = widen(b.knL, b.knR, 0.35);
    poly.push(kl, kr);
  } else if (mode === "full" && b.anL && b.anR) {
    const [al, ar] = widen(b.anL, b.anR, 0.35);
    poly.push(al, ar);
  }
  poly.push(hr);

  const segs: ArmSeg[] = [];
  const side = (sh: Pt, el: Pt | null, wr: Pt | null) => {
    const elIn = el ? inPolygon(el, poly) : false;
    const wrIn = wr ? inPolygon(wr, poly) : false;
    if (!elIn && !wrIn) return;
    if (el && wr) segs.push({ a: el, b: wr, r: shW * 0.085 });
    if (el && (elIn || wrIn)) segs.push({ a: sh, b: el, r: shW * 0.1 });
    if (!el && wr) segs.push({ a: sh, b: wr, r: shW * 0.09 });
  };
  side(b.shL, b.elL, b.wrL);
  side(b.shR, b.elR, b.wrR);
  return segs;
}

/* ------------------------------ jewellery ------------------------------ */

export type Placement = { x: number; y: number; w: number; rot: number; show: boolean };

/** Screen roll of a left->right vector (clockwise positive, y down). */
const rollOf = (from: Pt, to: Pt) => Math.atan2(to.y - from.y, to.x - from.x);

/**
 * Choker centre on the neck: between the chin (Face Landmarker 152) and the
 * shoulder midpoint, width from the face width. Without a face it falls back
 * to the pose mouth/nose points.
 */
export function chokerPlacement(
  b: Body,
  face: Pt[] | null,
): Placement | null {
  if (!b.shL || !b.shR) return null;
  const shMid = lerpPt(b.shL, b.shR, 0.5);
  const shW = dist(b.shL, b.shR);
  // Left->right on screen for the band.
  const [l, r] = b.shL.x < b.shR.x ? [b.shL, b.shR] : [b.shR, b.shL];
  const rot = rollOf(l, r);
  if (face) {
    const chin = face[FL.chin];
    const faceW = dist(face[FL.cheekR], face[FL.cheekL]);
    const c = lerpPt(chin, shMid, 0.42);
    return { x: c.x, y: c.y, w: faceW * 0.62, rot, show: true };
  }
  if (b.mouth) {
    const chin = lerpPt(b.mouth, shMid, 0.18);
    const c = lerpPt(chin, shMid, 0.42);
    return { x: c.x, y: c.y, w: shW * 0.34, rot, show: true };
  }
  return null;
}

/** Head yaw from the face (positive when the nose moves to screen-right). */
export function faceYaw(face: Pt[]): number {
  const a = face[FL.cheekR];
  const b = face[FL.cheekL];
  const n = face[FL.noseTip];
  const mid = lerpPt(a, b, 0.5);
  const w = dist(a, b) / 2 || 1;
  const axis = norm(sub(b, a));
  const off = ((n.x - mid.x) * axis.x + (n.y - mid.y) * axis.y) / w;
  return Math.asin(Math.max(-0.95, Math.min(0.95, off)));
}

/** Hide an earring when the head turns this far (rad) away from it. */
export const EARRING_MAX_YAW = 0.45;

/**
 * Earring hooks just below the ear points (234/93 and 454/323). Each earring
 * hides when the head turns away from it by more than EARRING_MAX_YAW.
 * Returns [subject's right ear, subject's left ear].
 */
export function earringPlacements(face: Pt[]): [Placement, Placement] {
  const faceW = dist(face[FL.cheekR], face[FL.cheekL]);
  const faceH = dist(face[FL.foreheadTop], face[FL.chin]);
  const up = norm(sub(face[FL.foreheadTop], face[FL.chin]));
  const out = norm(sub(face[FL.cheekL], face[FL.cheekR])); // toward subject's left
  const roll = Math.atan2(up.x, -up.y);
  const yaw = faceYaw(face);
  const lobe = (cheek: Pt, ear: Pt, sign: number): Pt => {
    // Continue the cheek->ear line down a little, then nudge outward.
    const base = add(ear, mul(sub(ear, cheek), 1.2));
    return add(add(base, mul(up, -faceH * 0.02)), mul(out, sign * faceW * 0.02));
  };
  const w = faceW * 0.16;
  const r = lobe(face[FL.cheekR], face[FL.earR], -1);
  const l = lobe(face[FL.cheekL], face[FL.earL], 1);
  // yaw > 0: nose moved toward the subject's left, so the left ear turns away.
  return [
    { x: r.x, y: r.y, w, rot: roll, show: yaw > -EARRING_MAX_YAW },
    { x: l.x, y: l.y, w, rot: roll, show: yaw < EARRING_MAX_YAW },
  ];
}

/** Bracelets on both wrists (15/16), across the forearm, a little up from the wrist point. */
export function braceletPlacements(b: Body): [Placement | null, Placement | null] {
  if (!b.shL || !b.shR) return [null, null];
  const shW = dist(b.shL, b.shR);
  const one = (el: Pt | null, wr: Pt | null): Placement | null => {
    if (!wr) return null;
    const dir = el ? norm(sub(wr, el)) : { x: 0, y: 1 };
    const c = el ? lerpPt(wr, el, 0.1) : wr;
    // Band runs across the forearm: rotate the image x axis to the perpendicular.
    const rot = Math.atan2(dir.y, dir.x) - Math.PI / 2;
    return { x: c.x, y: c.y, w: shW * 0.24, rot, show: true };
  };
  return [one(b.elL, b.wrL), one(b.elR, b.wrR)];
}
