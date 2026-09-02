import type { Metadata } from "next";
import { Bodoni_Moda, Figtree } from "next/font/google";
import "./amihan.css";

const display = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-amihan-display",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-amihan-body",
});

export const metadata: Metadata = {
  title: "Amihan Salon, sample by KantoCo",
  description:
    "KantoCo sample of a neighborhood salon in Parañaque. This is a sample site, not real client work.",
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
