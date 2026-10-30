import type { Metadata } from "next";
import { Anton, Archivo, Great_Vibes, Space_Mono } from "next/font/google";
import { cgr } from "@/lib/cgr-rentals";
import "./cgr.css";

// Round 7.2 type (Design stamp r7.2/font.md). Self-hosted by next/font at
// build time: no font files live in the repo.
// - Display: Anton 400 (single weight) for the edge-bleeding headings, the
//   h1, buttons, the magnet and the wordmark. latin-ext carries ñ and ₱.
// - Body: Archivo at normal width (variable wght, no wdth axis).
// - Mono: Space Mono 400/700 for meta lines (unchanged).
// - Script: Great Vibes for the hero rotator and the footer "see you" only;
//   it never sets a price.
// Display, body and mono use display "block": a fallback face can't match
// Anton's metrics, so a late swap would move GOWNS and the nav (r7 measured
// CLS ~0.005 with swap). next/font preloads them, so the block period is
// short. The script accent is absolutely placed, so it keeps swap.
const display = Anton({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "block",
  variable: "--nf-display",
});

const body = Archivo({
  subsets: ["latin", "latin-ext"],
  display: "block",
  variable: "--nf-body",
});

const mono = Space_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  display: "block",
  variable: "--nf-mono",
});

const hand = Great_Vibes({
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
    <div className={`cgr-fonts ${display.variable} ${body.variable} ${mono.variable} ${hand.variable}`}>
      {children}
    </div>
  );
}
