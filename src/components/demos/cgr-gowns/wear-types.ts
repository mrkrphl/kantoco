import type { ArmSeg, Placement, Pt, WearMode } from "@/lib/cgr-wear-pose";

/** One frame's worth of what the wear overlay should draw (stage px). */
export type WearDraw = {
  mode: WearMode | null;
  /** Gown grid vertices for `mode`, or null when the body isn't found. */
  grid: Pt[] | null;
  arms: ArmSeg[];
  choker: Placement | null;
  bracelets: [Placement | null, Placement | null];
  /** [subject's right ear, subject's left ear]. */
  earrings: [Placement | null, Placement | null];
  tiara: Placement | null;
};
