import type { Metadata } from "next";
import { Teko, Work_Sans } from "next/font/google";
import "./haligi.css";

const display = Teko({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-haligi-display",
});

const body = Work_Sans({
  subsets: ["latin"],
  variable: "--font-haligi-body",
});

export const metadata: Metadata = {
  title: "Haligi Auto Care, sample by KantoCo",
  description:
    "KantoCo sample of a neighborhood auto bay in Parañaque. This is a sample site, not real client work.",
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
