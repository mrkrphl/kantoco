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
          __html: `try{document.documentElement.classList.add("js");window.setTimeout(function(){document.documentElement.classList.remove("js-anim");var n=document.querySelectorAll(".pf-name-rise,.pf-cta-anim,.pf-frame,.pf-frame img,.pf-reveal,.pf-sticker,.pf-blob,.pf-paw,.pf-card-in,.pf-name-line");for(var i=0;i<n.length;i++){n[i].style.transform="none";n[i].style.opacity="1";n[i].style.clipPath="none";n[i].style.overflow="visible"}var w=document.querySelectorAll(".pf-win,.pf-win img");for(var j=0;j<w.length;j++){w[j].style.opacity="1";w[j].style.visibility="visible"}},2500)}catch(e){}`,
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
