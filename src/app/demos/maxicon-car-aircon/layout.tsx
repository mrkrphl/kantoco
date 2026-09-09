import type { Metadata } from "next";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import "./maxicon.css";

const display = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-maxicon-display",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-maxicon-mono",
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
    <div className={`${display.variable} ${mono.variable}`}>{children}</div>
  );
}
