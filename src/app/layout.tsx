import type { Metadata } from "next";
import { Bricolage_Grotesque, Newsreader } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

// No route renders text in Newsreader today; it is only the body fallback in
// globals.css. preload: false keeps the face and --font-body available
// site-wide but stops the file being fetched on pages that never draw with
// it. /demos/cgr-rentals also points its page shell at a system face in
// cgr.css, so it never fetches Newsreader at all.
const body = Newsreader({
  subsets: ["latin"],
  variable: "--font-body",
  preload: false,
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
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
