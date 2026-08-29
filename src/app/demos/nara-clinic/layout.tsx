import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./nara.css";

const naraSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nara",
});

export const metadata: Metadata = {
  title: "Nara Clinic — sample by KantoCo",
  description:
    "Labeled KantoCo demo of a neighborhood clinic. Sample only. Not real client work.",
  robots: { index: false, follow: false },
};

export default function NaraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={naraSans.variable}>{children}</div>;
}
