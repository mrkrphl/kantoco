import type { Metadata } from "next";
import { Archivo, Kalam } from "next/font/google";
import "./buhol.css";

const hand = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-buhol-hand",
});

const sans = Archivo({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-buhol-sans",
});

export const metadata: Metadata = {
  title: "Buhol Blooms — sample by KantoCo",
  description:
    "Labeled KantoCo demo of a flower stall. Sample only. Not real client work.",
  robots: { index: false, follow: false },
};

export default function BuholLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${hand.variable} ${sans.variable}`}>{children}</div>;
}
