import type { Metadata } from "next";
import { Bodoni_Moda, Cormorant_Garamond, Jost } from "next/font/google";
import { cgr } from "@/lib/cgr-rentals";
import "./cgr.css";

// Couture type (round 6). Self-hosted by next/font at build time: no font
// files live in the repo. Cormorant carries latin-ext so ₱ (U+20B1) renders
// in the text face; prices and arrows never use Bodoni or Jost.
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--nf-display",
  display: "swap",
});

const text = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--nf-text",
  display: "swap",
});

const label = Jost({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--nf-label",
  display: "swap",
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
    <div className={`cgr-fonts ${display.variable} ${text.variable} ${label.variable}`}>
      {children}
    </div>
  );
}
