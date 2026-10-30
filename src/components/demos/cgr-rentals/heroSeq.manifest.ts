/**
 * Hero frame-sequence manifest (r7.7). Story.tsx reads only this, so a
 * recut set drops in by changing this file and the files under
 * public/demos/cgr-rentals/<dir>/, nothing else.
 *
 * - `count`: number of frames, indexed 0..count-1.
 * - `pattern`: file name with `{n}` (zero-padded to `pad` digits); ignored
 *   when `files` lists the names explicitly (in play order).
 * - `landed`: the frame where Mavy lands facing front (the clip's 3.5 s mark
 *   on the 0.6 s..8 s cut: round((3.5 - 0.6) / (7.95 - 0.6) x 35) = 14). It
 *   loads first, gates the fallback, and is the reduced-motion still.
 * - `width` x `height`: the frame size in px (colour WebP with alpha).
 *
 * Default: the r7.6.5 set, seq/mavy-00.webp .. seq/mavy-35.webp, 540x960.
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
  count: 36,
  pattern: "mavy-{n}.webp",
  pad: 2,
  landed: 14,
  width: 540,
  height: 960,
};

/** File name of frame i (0-based). */
export function seqFile(m: HeroSeqManifest, i: number): string {
  if (m.files && m.files[i]) return m.files[i];
  return m.pattern.replace("{n}", String(i).padStart(m.pad, "0"));
}
