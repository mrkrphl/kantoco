import type { Metadata } from "next";
import { Outfit, Source_Serif_4 } from "next/font/google";
import "./nara.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-nara-serif",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-nara-sans",
});

export const metadata: Metadata = {
  title: "Nara Clinic, sample by KantoCo",
  description:
    "KantoCo sample of a neighborhood clinic in Parañaque. This is a sample site, not real client work.",
  robots: { index: false, follow: false },
};

export default function NaraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${serif.variable} ${sans.variable}`}>{children}</div>;
}
