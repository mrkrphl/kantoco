/**
 * Hero media manifest (r7.7; r7.8 adds the clips). Story.tsx reads only
 * this, so a recut drops in by changing this file and the files under
 * public/demos/cgr-rentals/, nothing else.
 *
 * Frame sequence (desktop default path):
 * - `count`: number of frames, indexed 0..count-1.
 * - `pattern`: file name with `{n}` (zero-padded to `pad` digits); ignored
 *   when `files` lists the names explicitly (in play order).
 * - `landed`: the frame where Mavy stands facing front at rest. It loads
 *   first, gates the fallback, and is the reduced-motion still.
 * - `width` x `height`: the frame size in px (colour WebP with alpha).
 *
 * r7.8: seq/walk-spin-00.webp .. seq/walk-spin-29.webp, 540x960, cut from
 * the first clip below at t = 0.6 + i/29 x (7.29 - 0.05 - 0.6). Frame 00 is
 * empty (she is off-frame), 00-11 the side walk-in, 11-25 the 360 spin,
 * 29 she faces front mid-screen (landed). Until those files are in the
 * repo the landed frame 404s and the hero falls back to the clip.
 */
export type HeroSeqManifest = {
  dir: string;
  count: number;
  pattern: string;
  pad: number;
  files?: readonly string[];
  landed: number;
  width: number;
  height: number;
};

export const HERO_SEQ: HeroSeqManifest = {
  dir: "seq",
  count: 30,
  pattern: "walk-spin-{n}.webp",
  pad: 2,
  landed: 29,
  width: 540,
  height: 960,
};

/** File name of frame i (0-based). */
export function seqFile(m: HeroSeqManifest, i: number): string {
  if (m.files && m.files[i]) return m.files[i];
  return m.pattern.replace("{n}", String(i).padStart(m.pad, "0"));
}

/**
 * Stacked-alpha clips (540x1920: colour top half, matte bottom half), in
 * order of preference. A clip that errors (404 before its file lands, or a
 * decode error) hands over to the next one with its own timings; the last
 * one failing shows the poster.
 * - `seconds`: clip length. The scrub runs `tStart`..end.
 * - `land`: the reduced-motion seek (whole figure, facing front).
 * - `front`: from here on she faces front (the idle breath starts).
 */
export type HeroClip = {
  file: string;
  seconds: number;
  tStart: number;
  land: number;
  front: number;
};

export const HERO_CLIPS: readonly HeroClip[] = [
  // r7.8: the side walk-in (0.75-3.1 s), a 0.25 s dissolve, then the 360 spin
  // (3.3-6.5 s) drifting to mid-frame; front-facing from 6.5 s to the end.
  { file: "mavy-walk-spin360-alpha.mp4", seconds: 7.29, tStart: 0.6, land: 7.2, front: 6.5 },
  // r7.6: walk-in, land at 3.5 s, spin 3.5-6 s (the current repo clip).
  { file: "mavy-side-spin-alpha.mp4", seconds: 8, tStart: 0.6, land: 3.5, front: 6 },
];

/** The clip timeline as intro-scroll progress: where she faces front. */
export function frontAt(c: HeroClip, clipEnd: number): number {
  return ((c.front - c.tStart) / (c.seconds - c.tStart)) * clipEnd;
}
