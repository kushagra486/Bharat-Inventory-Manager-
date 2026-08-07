"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ data, size = 180 }: { data: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(data, { width: size, margin: 1 }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [data, size]);

  if (!dataUrl) {
    return <div className="animate-pulse rounded-xl bg-muted" style={{ width: size, height: size }} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="UPI QR code" width={size} height={size} className="rounded-xl" />;
}
