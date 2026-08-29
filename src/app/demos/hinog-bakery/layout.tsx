import type { Metadata } from "next";
import { Bungee, Roboto_Mono } from "next/font/google";
import "./hinog.css";

const enamel = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hinog-enamel",
});

const ticket = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-hinog-ticket",
});

export const metadata: Metadata = {
  title: "Hinog Bakery — sample by KantoCo",
  description:
    "Labeled KantoCo demo of a bakery counter. Sample only. Not real client work.",
  robots: { index: false, follow: false },
};

export default function HinogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={`${enamel.variable} ${ticket.variable}`}>{children}</div>;
}
