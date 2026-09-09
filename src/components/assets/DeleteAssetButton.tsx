"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function DeleteAssetButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!confirm("Hapus aset ini permanen? Tindakan tidak bisa dibatalkan."))
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error ?? "Gagal menghapus");
      toast("Aset dihapus", "success");
      router.push("/assets");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={remove} disabled={loading} className="text-red-600 hover:bg-red-50">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Hapus
    </Button>
  );
}
