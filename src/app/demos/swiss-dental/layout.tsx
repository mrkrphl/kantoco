import type { Metadata } from "next";
import localFont from "next/font/local";
import { SWISS } from "@/lib/swiss-dental";
import "./swiss-dental.css";

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-sd-sans",
  display: "swap",
  weight: "100 900",
  preload: true,
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
          __html: `try{document.documentElement.classList.add("js");if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("js-anim")}catch(e){}`,
        }}
      />
      <div className={inter.variable}>{children}</div>
    </>
  );
}
