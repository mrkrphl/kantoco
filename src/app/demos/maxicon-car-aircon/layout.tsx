import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Sans } from "next/font/google";
import "./maxicon.css";

const display = Big_Shoulders({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-maxicon-display",
  adjustFontFallback: false,
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-maxicon-body",
});

export const metadata: Metadata = {
  title: "Maxicon Car Aircon Specialist, sample by KantoCo",
  description:
    "KantoCo pitch sample for Maxicon Car Aircon Specialist on President’s Avenue, BF Homes, Parañaque. Sample only. Not live. They did not hire KantoCo.",
  robots: { index: false, follow: false },
};

export default function MaxiconLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${body.variable}`}>{children}</div>
  );
}
