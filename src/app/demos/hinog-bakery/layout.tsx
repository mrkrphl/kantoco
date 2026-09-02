import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Lilita_One } from "next/font/google";
import "./hinog.css";

const enamel = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hinog-enamel",
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
  return <div className={`${enamel.variable} ${body.variable}`}>{children}</div>;
}
