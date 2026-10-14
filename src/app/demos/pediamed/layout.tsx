import type { Metadata } from "next";
import localFont from "next/font/local";
import { pediamed } from "@/lib/pediamed";
import "./pediamed.css";

const display = localFont({
  src: "./fonts/fredoka-latin-ext.woff2",
  variable: "--font-pm-display",
  display: "swap",
  weight: "300 700",
  preload: true,
  adjustFontFallback: "Arial",
});

const sans = localFont({
  src: "./fonts/figtree-latin-ext.woff2",
  variable: "--font-pm-sans",
  display: "swap",
  weight: "300 900",
  preload: true,
  adjustFontFallback: "Arial",
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
