/**
 * Pure math: where the tiara sits on screen, from Face Landmarker points.
 * No DOM, no camera. Unit-tested with synthetic points (no face images).
 */

export type Pt = { x: number; y: number };
export type NormLandmark = { x: number; y: number; z?: number };

/** Face mesh indices used. */
export const LM = {
  foreheadTop: 10,
  chin: 152,
  noseTip: 1,
  cheekA: 234,
  cheekB: 454,
} as const;

export type Viewport = {
  /** Intrinsic video frame size. */
  videoW: number;
  videoH: number;
  /** Displayed stage size (CSS px), video drawn with object-fit: cover. */
  stageW: number;
  stageH: number;
  /** Front camera is shown mirrored. */
  mirrored: boolean;
};

export type TiaraPose = {
  /** Bottom-centre of the tiara band, stage px (y down). */
  x: number;
  y: number;
  /** Tiara width in stage px. */
  width: number;
  /** Radians. Roll is clockwise-positive in screen space (y down). */
  roll: number;
  /** Radians. Positive when the face turns toward screen-right. */
  yaw: number;
};

/** Normalised landmark -> stage px for an object-fit: cover video. */
export function toStage(p: NormLandmark, v: Viewport): Pt {
  const s = Math.max(v.stageW / v.videoW, v.stageH / v.videoH);
  const ox = (v.stageW - v.videoW * s) / 2;
  const oy = (v.stageH - v.videoH * s) / 2;
  const x = p.x * v.videoW * s + ox;
  const y = p.y * v.videoH * s + oy;
  return { x: v.mirrored ? v.stageW - x : x, y };
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/** Tiara width relative to cheek-to-cheek width. */
export const TIARA_WIDTH_RATIO = 1.02;
/** How far above landmark 10 the band sits, relative to face height. */
export const TIARA_LIFT_RATIO = 0.04;

export function tiaraPose(
  lm: NormLandmark[],
  v: Viewport,
): TiaraPose | null {
  const need = [LM.foreheadTop, LM.chin, LM.noseTip, LM.cheekA, LM.cheekB];
  if (need.some((i) => !lm[i])) return null;

  const top = toStage(lm[LM.foreheadTop], v);
  const chin = toStage(lm[LM.chin], v);
  const nose = toStage(lm[LM.noseTip], v);
  const a = toStage(lm[LM.cheekA], v);
  const b = toStage(lm[LM.cheekB], v);

  const upX = top.x - chin.x;
  const upY = top.y - chin.y;
  const faceH = Math.hypot(upX, upY);
  const faceW = Math.hypot(b.x - a.x, b.y - a.y);
  if (faceH < 8 || faceW < 8) return null;

  const ux = upX / faceH;
  const uy = upY / faceH;
  // 0 when upright (up points to -y on screen); clockwise positive.
  const roll = Math.atan2(ux, -uy);

  // Face "right" axis on screen, perpendicular to up (clockwise 90°).
  const rx = -uy;
  const ry = ux;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const off = ((nose.x - midX) * rx + (nose.y - midY) * ry) / (faceW / 2);
  const yaw = Math.asin(clamp(off * 0.9, -0.85, 0.85));

  const lift = faceH * TIARA_LIFT_RATIO;
  return {
    x: top.x + ux * lift,
    y: top.y + uy * lift,
    width: faceW * TIARA_WIDTH_RATIO,
    roll,
    yaw,
  };
}

/** Exponential smoothing; angles are small so plain lerp is fine. */
export function smoothPose(
  prev: TiaraPose | null,
  next: TiaraPose,
  k = 0.5,
): TiaraPose {
  if (!prev) return next;
  const l = (p: number, n: number) => p + (n - p) * k;
  return {
    x: l(prev.x, next.x),
    y: l(prev.y, next.y),
    width: l(prev.width, next.width),
    roll: l(prev.roll, next.roll),
    yaw: l(prev.yaw, next.yaw),
  };
}
