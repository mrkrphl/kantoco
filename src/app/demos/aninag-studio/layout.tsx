import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";
import "./aninag.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-aninag-display",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-aninag-mono",
});

export const metadata: Metadata = {
  title: "Aninag Studio — sample by KantoCo",
  description:
    "Labeled KantoCo demo of a photo studio. Sample only. Not real client work.",
  robots: { index: false, follow: false },
};

export default function AninagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
