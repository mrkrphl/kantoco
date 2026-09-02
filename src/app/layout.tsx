import type { Metadata } from "next";
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
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
