"use client";

import { GOWNS } from "@/lib/cgr-rentals";
import { Story } from "@/components/demos/cgr-rentals/Story";
import { MoodBoard } from "@/components/demos/cgr-rentals/MoodBoard";
import { CoverFlow } from "@/components/demos/cgr-rentals/CoverFlow";
import { useReveal } from "@/components/demos/cgr-rentals/Kinetic";

/**
 * Round 7 home: intro (black stage, Mavy cutout, S-curve breakout) ->
 * mood board (cream, draggable win cards, filters) -> cover flow (oxblood
 * band, every piece) -> footer (in Shell). The r6 steps, grid, lookbook and
 * visit sections are retired from the home page (stamp §4).
 */
export function Catalogue() {
  const ref = useReveal<HTMLDivElement>([]);
  return (
    <div ref={ref} className="cgr-home">
      <Story />
      <MoodBoard />
      <CoverFlow items={GOWNS} />
    </div>
  );
}
