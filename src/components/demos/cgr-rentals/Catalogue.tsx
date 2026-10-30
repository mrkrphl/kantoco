"use client";

import { GOWNS } from "@/lib/cgr-rentals";
import { Story } from "@/components/demos/cgr-rentals/Story";
import { Spreads } from "@/components/demos/cgr-rentals/Spreads";
import { Rail } from "@/components/demos/cgr-rentals/Rail";
import { Testimonials } from "@/components/demos/cgr-rentals/Testimonials";

/**
 * r7.11 home (Design r7.11 home.html): hero (Mavy's scroll spin, "Gowns",
 * the "for your ___" loop, one line, one button) -> 01 Evening, 02 Bridal,
 * 03 Filipiniana, the Crowns band, 04 Barong -> the Rail (dark) -> one
 * review at a time -> Visit footer (Shell). Each section: one focal point,
 * one line, one action.
 */
export function Catalogue() {
  return (
    <div className="cgr-home">
      <Story />
      <Spreads />
      <Rail items={GOWNS} />
      <Testimonials />
    </div>
  );
}
