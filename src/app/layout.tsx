import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Newsreader({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "KantoCo",
  description:
    "We’re KantoCo. We make websites for small businesses in Parañaque and nearby.",
  openGraph: {
    title: "KantoCo",
    description:
      "We’re KantoCo. We make websites for small businesses in Parañaque and nearby.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <Script id="c408-js-anim" strategy="beforeInteractive">
          {`(function(){try{if(location.pathname.indexOf("/demos/cafe-408-bf")===0&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("js-anim")}catch(e){}})()`}
        </Script>
        {children}
      </body>
    </html>
  );
}
