import type { Metadata } from "next";
import { CAFE408 } from "@/lib/cafe408";
import "./cafe408.css";

export const metadata: Metadata = {
  title: CAFE408.title,
  description: CAFE408.description,
  robots: { index: false, follow: false },
  openGraph: {
    title: CAFE408.title,
    description: CAFE408.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: CAFE408.title,
    description: CAFE408.description,
  },
};

export default function Cafe408Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("js-anim");window.setTimeout(function(){if(!document.documentElement.hasAttribute("data-c408-live"))document.documentElement.classList.remove("js-anim")},8000)}}catch(e){}`,
        }}
      />
      <link
        rel="preload"
        href="/demos/cafe-408-bf/fonts/BricolageGrotesque-Latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/demos/cafe-408-bf/fonts/Newsreader-Latin.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}
