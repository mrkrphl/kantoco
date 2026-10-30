"use client";

import { GOWNS } from "@/lib/cgr-rentals";
import { Story } from "@/components/demos/cgr-rentals/Story";
import { Rack } from "@/components/demos/cgr-rentals/Rack";
import { CoverFlow } from "@/components/demos/cgr-rentals/CoverFlow";
import { Testimonials } from "@/components/demos/cgr-rentals/Testimonials";
import { useReveal } from "@/components/demos/cgr-rentals/Kinetic";

/**
 * Round 7 home: intro (black stage, Mavy cutout, S-curve breakout) ->
 * r7.3 racks (catalogue, Filipiniana band, men's formal, accessories) ->
 * cover flow (oxblood band, every piece) -> r7.6.4 reviews (hidden when
 * testimonials.ts is empty) -> footer (in Shell). The r7 mood
 * board (MoodBoard.tsx) is no longer rendered. The r6 steps, grid, lookbook and
 * visit sections are retired from the home page (stamp §4).
 */
export function Catalogue() {
  const ref = useReveal<HTMLDivElement>([]);
  return (
    <div ref={ref} className="cgr-home">
      <Story />
      <Rack />
      <CoverFlow items={GOWNS} />
      <Testimonials />
    </div>
  );
}
