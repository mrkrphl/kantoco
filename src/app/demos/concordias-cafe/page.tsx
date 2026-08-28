import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import ConcordiaExperience from "@/components/cafe/ConcordiaExperience";

const cafeDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-cafe-display",
});

const cafeSans = Outfit({
  subsets: ["latin"],
  variable: "--font-cafe-sans",
});

export const metadata: Metadata = {
  title: "Concordia’s Cafe — labeled KantoCo demo",
  description:
    "Demo site by KantoCo — sample only. Not real client work. All-day cafe on Aguirre Ave, BF Homes, Parañaque.",
  robots: { index: false, follow: false },
};

export default function ConcordiaCafePage() {
  return (
    <div className={`${cafeDisplay.variable} ${cafeSans.variable}`}>
      <ConcordiaExperience />
    </div>
  );
}
