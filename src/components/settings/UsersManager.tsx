"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Loader2, UserCog, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "@/components/ui/toaster";
import { ROLE_LABELS } from "@/lib/constants";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  profile?: {
    jobTitle: string | null;
    department: string | null;
    employeeId: string | null;
  } | null;
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
  ASSET_MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
  ASSET_HANDLER: "bg-slate-100 text-slate-600 border-slate-200",
};

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function toggleActive(u: User) {
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !u.isActive }),
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
        <Link href="/settings/users/new">
          <Button>
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </Button>
        </Link>
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
                <TableHead>Jabatan</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-slate-800">
                    <Link
                      href={`/settings/users/${u.id}`}
                      className="hover:text-brand-600"
                    >
                      {u.name ?? "-"}
                    </Link>
                    {u.profile?.employeeId && (
                      <span className="block font-mono text-xs text-slate-400">
                        {u.profile.employeeId}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm">
                    {u.profile?.jobTitle ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {u.profile?.department ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        ROLE_COLORS[u.role] ?? "bg-slate-100 text-slate-600"
                      }
                    >
                      {ROLE_LABELS[u.role] ?? u.role}
                    </Badge>
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
                    <div className="flex justify-end gap-1">
                      <Link href={`/settings/users/${u.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      {u.id !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(u)}
                        >
                          {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
