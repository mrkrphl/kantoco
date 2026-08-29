import type { Metadata } from "next";
import { Anton, Manrope, Source_Serif_4 } from "next/font/google";
import ConcordiaExperience from "@/components/cafe/ConcordiaExperience";

const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cafe-display",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-cafe-sans",
});

const accent = Source_Serif_4({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "600"],
  variable: "--font-cafe-accent",
});

export const metadata: Metadata = {
  title: "Concordia's Cafe — labeled KantoCo demo",
  description:
    "Demo site by KantoCo — sample only. Not real client work. Neighborhood cafe on Aguirre Ave, BF Homes, Paranaque.",
  robots: { index: false, follow: false },
};

export default function ConcordiaCafePage() {
  return (
    <div className={`${display.variable} ${sans.variable} ${accent.variable}`}>
      <ConcordiaExperience />
    </div>
  );
}
