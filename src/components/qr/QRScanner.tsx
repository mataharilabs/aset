"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function QRScanner() {
  const router = useRouter();
  const containerId = "qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  function handleDecoded(text: string) {
    // text bisa berupa URL penuh (.../scan/CODE) atau kode langsung
    let code = text.trim();
    try {
      const u = new URL(text);
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("scan");
      if (idx >= 0 && parts[idx + 1]) code = parts[idx + 1];
    } catch {
      // bukan URL, pakai teks apa adanya
    }
    stop();
    router.push(`/scan/${encodeURIComponent(code)}`);
  }

  async function start() {
    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => handleDecoded(decoded),
        () => {}
      );
      setScanning(true);
    } catch {
      toast("Tidak bisa mengakses kamera. Izinkan akses kamera.", "error");
    }
  }

  async function stop() {
    const s = scannerRef.current;
    if (s) {
      try {
        await s.stop();
        await s.clear();
      } catch {
        /* ignore */
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div
        id={containerId}
        className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-slate-900"
        style={{ minHeight: scanning ? 300 : 0 }}
      />
      <div className="flex justify-center">
        {scanning ? (
          <Button variant="destructive" onClick={stop}>
            <CameraOff className="h-4 w-4" />
            Hentikan
          </Button>
        ) : (
          <Button onClick={start}>
            <Camera className="h-4 w-4" />
            Mulai Scan
          </Button>
        )}
      </div>
    </div>
  );
}
