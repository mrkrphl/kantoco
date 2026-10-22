import type { Metadata, Viewport } from "next";
import { cgr } from "@/lib/cgr-gowns";
import "./cgr-gowns.css";

export const metadata: Metadata = {
  title: cgr.title,
  description: cgr.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ef",
};

export default function CgrGownsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
