"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function ClearAuditButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function clear() {
    if (!confirm("Hapus SEMUA audit log? Tidak bisa dibatalkan.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/audit", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error ?? "Gagal");
      toast("Audit log dibersihkan", "success");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={clear}
      disabled={loading}
      className="text-red-600 hover:bg-red-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Bersihkan Log
    </Button>
  );
}
