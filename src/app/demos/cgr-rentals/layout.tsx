import type { Metadata } from "next";
import { Archivo, Space_Mono, Mrs_Saint_Delafield } from "next/font/google";
import { cgr } from "@/lib/cgr-rentals";
import "./cgr.css";

// Round 7 type (Design stamp r7/direction.md §1). Self-hosted by next/font at
// build time: no font files live in the repo. Archivo is the variable font
// (wght 100-900, wdth 62-125), so no weight option. Archivo and Space Mono
// carry latin-ext, which has ₱ (U+20B1). Mrs Saint Delafield has no ₱, so
// it never sets a price: it is used twice only ("for your debut", "see you").
const display = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
  variable: "--nf-display",
});

const mono = Space_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "swap",
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
