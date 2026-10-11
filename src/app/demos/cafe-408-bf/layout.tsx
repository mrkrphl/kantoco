import type { Metadata } from "next";
import { CAFE408 } from "@/lib/cafe408";
import "./cafe408.css";

export const metadata: Metadata = {
  title: CAFE408.title,
  description: CAFE408.description,
  robots: { index: false, follow: false },
};

export default function Cafe408Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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
