"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/public/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Daftar Aset", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Link publik disalin ke clipboard", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // dibatalkan / gagal
    }
  }

  return (
    <Button variant="outline" onClick={share}>
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      Share
    </Button>
  );
}
