import type { Metadata } from "next";
import localFont from "next/font/local";
import "./better-details.css";

const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  variable: "--font-bd-archivo",
  display: "swap",
  weight: "100 900",
  preload: true,
  adjustFontFallback: "Arial",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const plex = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-bd-mono",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  title: "Better Details · KantoCo sample (not live)",
  description:
    "KantoCo sample of a paint-protection, ceramic-coating and tint bay in Don Bosco, Parañaque. Not the shop’s website.",
  robots: { index: false, follow: false },
};

export default function BetterDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{document.documentElement.classList.add("js");if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("js-anim")}catch(e){}`,
        }}
      />
      <div className={`${archivo.variable} ${plex.variable}`}>{children}</div>
    </>
  );
}
