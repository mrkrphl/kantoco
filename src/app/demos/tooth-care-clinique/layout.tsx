import type { Metadata } from "next";
import localFont from "next/font/local";
import { tcc } from "@/lib/tooth-care-clinique";
import "./tooth-care-clinique.css";

const display = localFont({
  src: "./fonts/bricolage-grotesque.woff2",
  variable: "--font-tcc-display",
  display: "swap",
  weight: "200 800",
  preload: true,
  adjustFontFallback: "Arial",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

const sans = localFont({
  src: "./fonts/manrope.woff2",
  variable: "--font-tcc-sans",
  display: "swap",
  weight: "200 800",
  preload: true,
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: tcc.title,
  description: tcc.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: tcc.title,
    description: tcc.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: tcc.title,
    description: tcc.description,
  },
};

export default function ToothCareCliniqueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{document.documentElement.classList.add("js");if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-anim");window.setTimeout(function(){if(!document.documentElement.hasAttribute("data-tcc-live"))document.documentElement.classList.remove("js-anim")},8000)}}catch(e){}`,
        }}
      />
      <div className={`${display.variable} ${sans.variable}`}>{children}</div>
    </>
  );
}
