"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** r9: QR for the shop counter. Generated in the browser; no paid API. */
export function ShopQr({ url }: { url: string }) {
  const [src, setSrc] = useState<string>("");
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 280,
      color: { dark: "#3b0a1a", light: "#ffffff" },
    }).then((u) => {
      if (live) setSrc(u);
    });
    return () => {
      live = false;
    };
  }, [url]);
  if (!src) return <div className="shop-qr-ph" aria-hidden="true" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="shop-qr" src={src} width={280} height={280} alt={`QR code for ${url}`} />;
}
