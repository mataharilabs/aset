"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, TrendingUp, TrendingDown, Wallet, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
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
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/toaster";
import { FINANCIAL_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type Row = {
  id: string;
  type: string;
  amount: string;
  description: string;
  date: string;
  asset: { name: string; systemCode: string };
};

const TYPE_COLORS: Record<string, string> = {
  INCOME: "bg-emerald-100 text-emerald-700 border-emerald-200",
  EXPENSE: "bg-red-100 text-red-700 border-red-200",
  TAX: "bg-amber-100 text-amber-700 border-amber-200",
  INSURANCE: "bg-blue-100 text-blue-700 border-blue-200",
};

export function FinancialClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [income, setIncome] = useState("0");
  const [expense, setExpense] = useState("0");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<{ id: string; name: string }[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ type: "EXPENSE" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/financial");
      const data = await res.json();
      setRows(data.items ?? []);
      setIncome(data.totalIncome ?? "0");
      setExpense(data.totalExpense ?? "0");
    } catch {
      toast("Gagal memuat data keuangan", "error");
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

  function openCreate() {
    setEditingId(null);
    setForm({ type: "EXPENSE" });
    setOpen(true);
  }

  function openEdit(f: Row) {
    setEditingId(f.id);
    setForm({
      assetId: (f as unknown as { assetId?: string }).assetId ?? "",
      type: f.type,
      amount: f.amount ? String(f.amount) : "",
      description: f.description ?? "",
      date: f.date ? String(f.date).slice(0, 10) : "",
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const url = editingId ? `/api/financial/${editingId}` : "/api/financial";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? err.issues?.[0]?.message ?? "Gagal");
      }
      toast(editingId ? "Catatan diperbarui" : "Catatan keuangan ditambahkan", "success");
      setOpen(false);
      setEditingId(null);
      setForm({ type: "EXPENSE" });
      load();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus catatan keuangan ini?")) return;
    try {
      const res = await fetch(`/api/financial/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast("Catatan dihapus", "success");
      load();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  const net = Number(income) - Number(expense);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Pemasukan"
          value={formatCurrency(income)}
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard
          label="Total Pengeluaran"
          value={formatCurrency(expense)}
          icon={TrendingDown}
          accent="red"
        />
        <StatCard
          label="Selisih (Net)"
          value={formatCurrency(net)}
          icon={Wallet}
          accent={net >= 0 ? "emerald" : "red"}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Catatan
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Belum ada catatan keuangan"
            description="Catat pemasukan & pengeluaran terkait aset."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aset</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(f.date)}
                  </TableCell>
                  <TableCell className="text-sm">{f.asset.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        TYPE_COLORS[f.type] ?? "bg-slate-100 text-slate-600"
                      }
                    >
                      {FINANCIAL_TYPE_LABELS[f.type] ?? f.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{f.description}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {formatCurrency(f.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(f)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(f.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit Catatan Keuangan" : "Tambah Catatan Keuangan"}
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Jenis</Label>
              <Select
                value={form.type ?? "EXPENSE"}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              >
                {Object.entries(FINANCIAL_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Jumlah (Rp) *</Label>
              <Input
                type="number"
                value={form.amount ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Deskripsi *</Label>
            <Input
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tanggal *</Label>
              <Input
                type="date"
                value={form.date ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Input
                value={form.vendor ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={save}
              disabled={saving || !form.assetId || !form.amount}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
