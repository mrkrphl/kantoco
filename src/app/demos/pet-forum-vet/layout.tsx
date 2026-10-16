import type { Metadata } from "next";
import localFont from "next/font/local";
import { pf, PF_SIGN_PRELOAD } from "@/lib/pet-forum-vet";
import "./pet-forum-vet.css";

const display = localFont({
  src: "./fonts/outfit-latin-ext.woff2",
  variable: "--font-pf-display",
  display: "swap",
  weight: "100 900",
  preload: true,
  adjustFontFallback: "Arial",
});

const sans = localFont({
  src: "./fonts/onest-latin-ext.woff2",
  variable: "--font-pf-sans",
  display: "swap",
  weight: "100 900",
  preload: true,
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: pf.title,
  description: pf.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: pf.title,
    description: pf.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: pf.title,
    description: pf.description,
  },
};

export default function PetForumVetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{document.documentElement.classList.add("js");if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-anim");window.setTimeout(function(){if(!document.documentElement.hasAttribute("data-pf-live")){document.documentElement.classList.remove("js-anim")}},2500)}}catch(e){}`,
        }}
      />
      <link
        rel="preload"
        as="image"
        href={PF_SIGN_PRELOAD}
        type="image/webp"
        fetchPriority="high"
      />
      <div className={`${display.variable} ${sans.variable}`}>{children}</div>
    </>
  );
}
