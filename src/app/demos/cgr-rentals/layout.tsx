import type { Metadata } from "next";
import { Archivo, Space_Mono, Mrs_Saint_Delafield } from "next/font/google";
import { cgr } from "@/lib/cgr-rentals";
import "./cgr.css";

// Round 7 type (Design stamp r7/direction.md §1). Self-hosted by next/font at
// build time: no font files live in the repo. Archivo is the variable font
// (wght 100-900, wdth 62-125), so no weight option. Archivo and Space Mono
// carry latin-ext, which has ₱ (U+20B1). Mrs Saint Delafield has no ₱, so
// it never sets a price: it is used twice only ("for your debut", "see you").
// Archivo and Space Mono use display "block" (not the stamp's "swap"): no
// fallback face can match Archivo at wdth 125, so a late swap moved GOWNS and
// the nav (CLS ~0.005 on cold loads). Both are preloaded by next/font, so the
// block period is short; the hand accent is absolutely placed and keeps swap.
const display = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "block",
  variable: "--nf-display",
});

const mono = Space_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "block",
  variable: "--nf-mono",
});

const hand = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--nf-hand",
});

export const metadata: Metadata = {
  title: cgr.title,
  description: cgr.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: cgr.title,
    description: cgr.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: cgr.title,
    description: cgr.description,
  },
};

export default function CgrRentalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`cgr-fonts ${display.variable} ${mono.variable} ${hand.variable}`}>
      {children}
    </div>
  );
}
