"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  systemCode: string;
  name: string;
  companyName: string;
};

export function QRLabel({ systemCode, name, companyName }: Props) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/scan/${systemCode}`);
  }, [systemCode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        {/* Label yang dicetak */}
        <div
          id="qr-label"
          className="flex w-72 flex-col items-center gap-3 rounded-xl border-2 border-slate-800 bg-white p-6"
        >
          <div className="text-center">
            <div className="text-sm font-bold text-slate-900">
              {companyName}
            </div>
            <div className="text-[11px] text-slate-500">Manajemen Aset</div>
          </div>
          {url && (
            <QRCodeSVG
              value={url}
              size={180}
              level="M"
              marginSize={1}
            />
          )}
          <div className="text-center">
            <div className="font-mono text-sm font-bold text-slate-900">
              {systemCode}
            </div>
            <div className="mt-0.5 max-w-[220px] truncate text-xs text-slate-600">
              {name}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 no-print">
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Cetak Label
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const svg = document.querySelector("#qr-label svg");
            if (!svg) return;
            const data = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([data], { type: "image/svg+xml" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `QR-${systemCode}.svg`;
            link.click();
          }}
        >
          <Download className="h-4 w-4" />
          Unduh SVG
        </Button>
      </div>

      {url && (
        <p className="text-center text-xs text-slate-400">
          URL: <span className="font-mono">{url}</span>
        </p>
      )}
    </div>
  );
}
