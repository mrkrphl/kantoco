import type { Metadata } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";
import "./haligi.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-haligi-display",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-haligi-body",
});

export const metadata: Metadata = {
  title: "Haligi Auto Care — sample by KantoCo",
  description:
    "Labeled KantoCo demo of a neighborhood auto bay. Sample only. Not real client work.",
  robots: { index: false, follow: false },
};

export default function HaligiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${body.variable}`}>{children}</div>
  );
}
