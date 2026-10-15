import type { Metadata } from "next";
import localFont from "next/font/local";
import { PLATE_PRELOAD, PLATE_SIZES, SWISS } from "@/lib/swiss-dental";
import "./swiss-dental.css";

const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  variable: "--font-sd-display",
  display: "swap",
  weight: "100 900",
  preload: true,
  adjustFontFallback: "Arial",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const schibsted = localFont({
  src: "./fonts/schibsted-latin.woff2",
  variable: "--font-sd-body",
  display: "swap",
  weight: "400 900",
  preload: true,
  adjustFontFallback: "Arial",
});

const schibstedItalic = localFont({
  src: "./fonts/schibsted-italic-latin.woff2",
  variable: "--font-sd-body-italic",
  display: "swap",
  weight: "400 900",
  style: "italic",
  preload: false,
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: SWISS.title,
  description: SWISS.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: SWISS.title,
    description: SWISS.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SWISS.title,
    description: SWISS.description,
  },
};

export default function SwissDentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{document.documentElement.classList.add("js");if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-anim")}window.setTimeout(function(){document.documentElement.classList.remove("js-anim");document.documentElement.classList.remove("sd-opener-anim");document.querySelectorAll(".sd-name-rise").forEach(function(el){el.classList.add("sd-name-in");el.style.transform="none"})},2500)}catch(e){}`,
        }}
      />
      <link
        rel="preload"
        as="image"
        href={PLATE_PRELOAD.mobileWebp}
        type="image/webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={PLATE_PRELOAD.desktopWebp}
        type="image/webp"
        media="(min-width: 768px)"
        imageSrcSet={PLATE_PRELOAD.desktopWebpSrcSet}
        imageSizes={PLATE_SIZES}
        fetchPriority="high"
      />
      <div
        className={`${archivo.variable} ${schibsted.variable} ${schibstedItalic.variable}`}
      >
        {children}
      </div>
    </>
  );
}
