"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";

type Option = { id: string; name: string };

export function TransactionForm() {
  const router = useRouter();
  const [assets, setAssets] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);
  const [owners, setOwners] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState("MUTATION");
  const [assetId, setAssetId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [toOwnerId, setToOwnerId] = useState("");
  const [disposalReason, setDisposalReason] = useState("");
  const [disposalValue, setDisposalValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/assets?limit=100")
      .then((r) => r.json())
      .then((d) =>
        setAssets(
          (d.items ?? []).map((a: { id: string; name: string; systemCode: string }) => ({
            id: a.id,
            name: `${a.systemCode} · ${a.name}`,
          }))
        )
      )
      .catch(() => {});
    fetch("/api/assets/options")
      .then((r) => r.json())
      .then((d) => {
        setLocations(d.locations ?? []);
        setOwners(d.owners ?? []);
      })
      .catch(() => {});
  }, []);

  async function submit() {
    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          assetId,
          toLocationId: toLocationId || null,
          toOwnerId: toOwnerId || null,
          disposalReason: disposalReason || null,
          disposalValue: disposalValue || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.error ?? err.issues?.[0]?.message ?? "Gagal mengajukan"
        );
      }
      toast("Transaksi diajukan, menunggu persetujuan", "success");
      router.push("/transactions");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  const isMutation = type === "MUTATION" || type === "HANDOVER";
  const isDisposal = type === "DISPOSAL";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Transaksi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Jenis Transaksi</Label>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Aset *</Label>
          <Select value={assetId} onChange={(e) => setAssetId(e.target.value)}>
            <option value="">Pilih aset</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>

        {isMutation && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Lokasi Tujuan</Label>
              <Select
                value={toLocationId}
                onChange={(e) => setToLocationId(e.target.value)}
              >
                <option value="">Pilih lokasi</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Owner Tujuan</Label>
              <Select
                value={toOwnerId}
                onChange={(e) => setToOwnerId(e.target.value)}
              >
                <option value="">Pilih owner</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {isDisposal && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Alasan Penghapusan *</Label>
              <Textarea
                value={disposalReason}
                onChange={(e) => setDisposalReason(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nilai Pelepasan (Rp)</Label>
              <Input
                type="number"
                value={disposalValue}
                onChange={(e) => setDisposalValue(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Catatan</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button onClick={submit} disabled={saving || !assetId}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Ajukan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
