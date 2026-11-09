import type { Metadata } from "next";
import { CGR_BASE } from "@/lib/cgr-rentals";
import { CgrShell } from "@/components/demos/cgr-rentals/Shell";
import { ShopQr } from "@/components/demos/cgr-rentals/ShopQr";

export const metadata: Metadata = {
  title: "Shop link · CGR",
  robots: { index: false, follow: false },
};

/**
 * r9: printable / screenshotable counter page. The QR opens the catalogue
 * with src=qr so the reservation is attributed. No paid QR service.
 */
export default function ShopLinkPage() {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://kantoco-git-cursor-cgr-rentals-app-mrkrphls-projects.vercel.app";
  const url = `${site}${CGR_BASE}?src=qr&utm_medium=qr&utm_source=shop`;
  return (
    <CgrShell current="Catalogue">
      <main className="shop-link">
        <h1>Scan to browse gowns</h1>
        <p>Open the catalogue on your phone. Reserve online, get first pick of fitting slots.</p>
        <ShopQr url={url} />
        <p className="shop-url">
          <a href={url}>{url}</a>
        </p>
        <p className="shop-note">SAMPLE · NOT LIVE · KantoCo pitch page</p>
        <p className="shop-note" style={{ textTransform: "none", letterSpacing: 0, marginTop: 12 }}>
          Go-live: swap this QR URL to the production domain (same path, keep <code>?src=qr</code>) before printing for the counter.
        </p>
      </main>
    </CgrShell>
  );
}
