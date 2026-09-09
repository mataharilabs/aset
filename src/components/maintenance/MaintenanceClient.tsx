"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Wrench, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/toaster";
import {
  MAINTENANCE_TYPE_LABELS,
  MAINTENANCE_STATUS_LABELS,
  MAINTENANCE_FREQUENCY_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduledDate: string;
  cost: string | null;
  asset: { name: string; systemCode: string };
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
};

export function MaintenanceClient({ canManage }: { canManage: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<{ id: string; name: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({
    type: "PREVENTIVE",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance");
      setRows(await res.json());
    } catch {
      toast("Gagal memuat perawatan", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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
  }, [load]);

  function openEdit(m: Row) {
    setEditingId(m.id);
    setForm({
      assetId: (m as unknown as { assetId?: string }).assetId ?? "",
      title: m.title,
      type: m.type,
      scheduledDate: m.scheduledDate ? String(m.scheduledDate).slice(0, 10) : "",
      cost: m.cost ? String(m.cost) : "",
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const url = editingId ? `/api/maintenance/${editingId}` : "/api/maintenance";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? err.issues?.[0]?.message ?? "Gagal");
      }
      toast(
        editingId ? "Perawatan diperbarui" : "Jadwal perawatan dibuat",
        "success"
      );
      setOpen(false);
      setEditingId(null);
      setForm({ type: "PREVENTIVE" });
      load();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus jadwal perawatan ini?")) return;
    try {
      const res = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast("Perawatan dihapus", "success");
      load();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async function complete(id: string) {
    if (!confirm("Tandai perawatan ini selesai?")) return;
    try {
      const res = await fetch(`/api/maintenance/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Gagal");
      toast("Perawatan selesai", "success");
      load();
    } catch {
      toast("Gagal menandai selesai", "error");
    }
  }

  return (
    <div>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => {
              setEditingId(null);
              setForm({ type: "PREVENTIVE" });
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Jadwal Baru
          </Button>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Belum ada jadwal perawatan"
            description="Buat jadwal perawatan untuk aset Anda."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Aset</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Biaya</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium text-slate-800">
                    {m.title}
                  </TableCell>
                  <TableCell className="text-sm">
                    {m.asset.name}
                    <span className="block font-mono text-xs text-slate-400">
                      {m.asset.systemCode}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {MAINTENANCE_TYPE_LABELS[m.type]}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(m.scheduledDate)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(m.cost)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        STATUS_COLORS[m.status] ??
                        "bg-slate-100 text-slate-600"
                      }
                    >
                      {MAINTENANCE_STATUS_LABELS[m.status] ?? m.status}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {m.status !== "COMPLETED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => complete(m.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Selesai
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(m.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit Perawatan" : "Jadwal Perawatan Baru"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Aset *</Label>
            <Select
              value={form.assetId ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, assetId: e.target.value }))}
            >
              <option value="">Pilih aset</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Judul *</Label>
            <Input
              value={form.title ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Servis rutin"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Jenis</Label>
              <Select
                value={form.type ?? "PREVENTIVE"}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              >
                {Object.entries(MAINTENANCE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Frekuensi</Label>
              <Select
                value={form.frequency ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, frequency: e.target.value }))
                }
              >
                <option value="">-</option>
                {Object.entries(MAINTENANCE_FREQUENCY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal *</Label>
              <Input
                type="date"
                value={form.scheduledDate ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, scheduledDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Perkiraan Biaya (Rp)</Label>
              <Input
                type="number"
                value={form.cost ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Vendor</Label>
            <Input
              value={form.vendor ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving || !form.assetId}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
