import type { Metadata } from "next";
import { Archivo_Black, Figtree } from "next/font/google";
import "./globals.css";

const display = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "KantoCo — Sites for the corner.",
  description:
    "Fixed websites for local shops in Parañaque & nearby — clinic, salon, auto. Message us on Facebook.",
  openGraph: {
    title: "KantoCo — Sites for the corner.",
    description:
      "Fixed websites for local shops in Parañaque & nearby — clinic, salon, auto.",
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
