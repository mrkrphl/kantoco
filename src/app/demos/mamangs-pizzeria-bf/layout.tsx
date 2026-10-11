import type { Metadata } from "next";
import localFont from "next/font/local";
import { mamangs } from "@/lib/mamangs";
import "./mamangs.css";

const display = localFont({
  src: "./fonts/bricolage-grotesque-latin.woff2",
  variable: "--font-mp-display",
  display: "swap",
  weight: "200 800",
  preload: true,
  adjustFontFallback: "Arial",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

const sans = localFont({
  src: "./fonts/figtree-latin.woff2",
  variable: "--font-mp-sans",
  display: "swap",
  weight: "300 900",
  preload: true,
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: mamangs.title,
  description: mamangs.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: mamangs.title,
    description: mamangs.description,
  },
};

export default function MamangsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-anim");setTimeout(function(){if(!window.__mpStarted)document.documentElement.classList.remove("js-anim")},2500)}}catch(e){}`,
        }}
      />
      <div className={`${display.variable} ${sans.variable}`}>{children}</div>
    </>
  );
}
