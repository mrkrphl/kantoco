import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./alonday.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-alonday-display",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-alonday-sans",
});

export const metadata: Metadata = {
  title: "Alonday Dental Clinic, sample by KantoCo",
  description:
    "KantoCo pitch sample for Alonday Dental Clinic on El Grande Avenue, BF Homes, Parañaque. Sample only. Not live. They did not hire KantoCo.",
  robots: { index: false, follow: false },
};

export default function AlondayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${sans.variable}`}>{children}</div>
  );
}
