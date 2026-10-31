import type { Metadata } from "next";
import { Cormorant_Garamond, Figtree, Pinyon_Script } from "next/font/google";
import { cgr } from "@/lib/cgr-rentals";
import { FontGate } from "@/components/demos/cgr-rentals/FontGate";
import "./cgr.css";
import "./r711.css";
import "./r8.css";

// Round 7.6 type (Design stamp r7.6/spec.md). Self-hosted by next/font at
// build time: no font files live in the repo.
// - Display: Cormorant Garamond (variable wght 300-700, normal + italic).
//   Light 300 for the h1 and h2s, italic 400 for the accent words, italic
//   500 for small italic labels. latin carries ñ.
// - Body: Figtree (variable wght) at 400 / 500: lead, labels, buttons. latin-ext
//   carries the ₱ sign.
// - Script: Pinyon Script (400), the only script face: the giant "Gowns",
//   the rotator and the spread words ("Bridal", "Filipiniana", "Barong").
// Great Vibes is retired (r7.6); Anton, Archivo and Space Mono (r7.2-7.4.1).
// Display and body use display "block" (a fallback face can't match their
// metrics, so a late swap would move the h1 and the nav); FontGate keeps the
// width-dependent first-screen nodes hidden until these faces load (CLS 0).
// The script words are absolutely placed and gated the same way (block too,
// so a fallback cursive never flashes before the reveal).
const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "block",
  variable: "--nf-display",
});

const body = Figtree({
  subsets: ["latin", "latin-ext"],
  display: "block",
  variable: "--nf-body",
});

const hand = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  display: "block",
  variable: "--nf-hand",
});

const first = (f: string) => f.split(",")[0].trim();

/** The faces the first screen sets, as CSS font shorthand (style weight size family). */
const FACES = [
  { font: `300 16px ${first(display.style.fontFamily)}`, text: "Aa" },
  { font: `italic 400 16px ${first(display.style.fontFamily)}`, text: "Aa" },
  { font: `400 16px ${first(body.style.fontFamily)}`, text: "Aa\u20b1" },
  { font: `400 16px ${first(hand.style.fontFamily)}`, text: "Gowns for your debut" },
];

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
    <FontGate className={`cgr-fonts ${display.variable} ${body.variable} ${hand.variable}`} faces={FACES}>
      {children}
    </FontGate>
  );
}
