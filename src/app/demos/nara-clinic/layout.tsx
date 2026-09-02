import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import "./nara.css";

const serif = Noto_Serif({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-nara-serif",
});

const sans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nara-sans",
});

export const metadata: Metadata = {
  title: "Nara Clinic, sample by KantoCo",
  description:
    "KantoCo sample of a neighborhood clinic in Parañaque. This is a sample site, not real client work.",
  robots: { index: false, follow: false },
};

export default function NaraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${serif.variable} ${sans.variable}`}>{children}</div>;
}
