import type { Metadata } from "next";
import { Archivo_Narrow, IBM_Plex_Mono } from "next/font/google";
import "./aninag.css";

const display = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-aninag-display",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-aninag-mono",
});

export const metadata: Metadata = {
  title: "Aninag Studio, sample by KantoCo",
  description:
    "KantoCo sample of a photo studio in Parañaque. This is a sample site, not real client work.",
  robots: { index: false, follow: false },
};

export default function AninagLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
