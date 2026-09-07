"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, UserCog } from "lucide-react";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/toaster";
import { ROLE_LABELS } from "@/lib/constants";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
};

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({
    role: "ASSET_HANDLER",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      setRows(await res.json());
    } catch {
      toast("Gagal memuat pengguna", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error)
        throw new Error(data.error ?? data.issues?.[0]?.message ?? "Gagal");
      toast("Pengguna ditambahkan", "success");
      setOpen(false);
      setForm({ role: "ASSET_HANDLER" });
      load();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function updateUser(id: string, patch: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) throw new Error(data.error ?? "Gagal");
      load();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={UserCog} title="Belum ada pengguna" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-slate-800">
                    {u.name ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      disabled={u.id === currentUserId}
                      onChange={(e) =>
                        updateUser(u.id, { role: e.target.value })
                      }
                      className="h-8 w-40 text-xs"
                    >
                      {Object.entries(ROLE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        u.isActive
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }
                    >
                      {u.isActive ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {u.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateUser(u.id, { isActive: !u.isActive })
                        }
                      >
                        {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                    )}
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
        title="Tambah Pengguna"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama *</Label>
            <Input
              value={form.name ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password *</Label>
            <Input
              type="password"
              value={form.password ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select
              value={form.role ?? "ASSET_HANDLER"}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={save}
              disabled={saving || !form.email || !form.password || !form.name}
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
