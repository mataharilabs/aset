"use client";

import { useState } from "react";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function exportCsv() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/assets");
      if (!res.ok) throw new Error("Gagal mengekspor");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-aset-${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast("Laporan berhasil diunduh", "success");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={exportCsv} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export CSV / Excel
      </Button>
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Cetak / PDF
      </Button>
    </div>
  );
}
