import type { Metadata } from "next";
import { Cabin, Kalam } from "next/font/google";
import "./buhol.css";

const hand = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-buhol-hand",
});

const sans = Cabin({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-buhol-sans",
});

export const metadata: Metadata = {
  title: "Buhol Blooms, sample by KantoCo",
  description:
    "KantoCo sample of a flower stall in Parañaque. This is a sample site, not real client work.",
  robots: { index: false, follow: false },
};

export default function BuholLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${hand.variable} ${sans.variable}`}>{children}</div>;
}
