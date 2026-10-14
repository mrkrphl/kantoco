import type { Metadata } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { pediamed } from "@/lib/pediamed";
import "./pediamed.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
  variable: "--font-pm-display",
});

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-pm-sans",
});

export const metadata: Metadata = {
  title: pediamed.title,
  description: pediamed.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: pediamed.title,
    description: pediamed.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: pediamed.title,
    description: pediamed.description,
  },
};

export default function PediamedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-anim");window.setTimeout(function(){if(!document.documentElement.hasAttribute("data-pm-live"))document.documentElement.classList.remove("js-anim")},8000)}}catch(e){}`,
        }}
      />
      <div className={`${display.variable} ${sans.variable}`}>{children}</div>
    </>
  );
}
