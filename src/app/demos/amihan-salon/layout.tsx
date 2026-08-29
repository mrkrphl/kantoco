import type { Metadata } from "next";
import { Karla, Syne } from "next/font/google";
import "./amihan.css";

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-amihan-display",
});

const body = Karla({
  subsets: ["latin"],
  variable: "--font-amihan-body",
});

export const metadata: Metadata = {
  title: "Amihan Salon — sample by KantoCo",
  description:
    "Labeled KantoCo demo of a monsoon-minded hair shop. Sample only. Not real client work.",
  robots: { index: false, follow: false },
};

export default function AmihanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${body.variable}`}>{children}</div>
  );
}
