import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import "./hinog.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-hinog-display",
});

const body = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-hinog-body",
});

export const metadata: Metadata = {
  title: "Hinog Bakery, sample by KantoCo",
  description:
    "KantoCo sample of a bakery counter in Parañaque. This is a sample site, not real client work.",
  robots: { index: false, follow: false },
};

export default function HinogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${body.variable}`}>{children}</div>
  );
}
