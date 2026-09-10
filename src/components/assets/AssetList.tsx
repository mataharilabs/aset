"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Loader2, Package, Plus, Monitor, Box } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AssetStatusBadge } from "./AssetStatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  ASSET_STATUS_LABELS,
  ASSET_TYPE_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type Asset = {
  id: string;
  systemCode: string;
  name: string;
  assetType: string;
  status: string;
  currentValue: string | null;
  quantity: number | null;
  quantityUnit: string | null;
  purchaseDate: string | null;
  category?: { name: string } | null;
  location?: { name: string } | null;
  owner?: { name: string } | null;
};

type Option = { id: string; name: string };

export function AssetList({ canCreate }: { canCreate: boolean }) {
  const [items, setItems] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [assetType, setAssetType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Option[]>([]);

  useEffect(() => {
    fetch("/api/assets/options")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (assetType) params.set("assetType", assetType);
      if (categoryId) params.set("categoryId", categoryId);
      params.set("limit", "50");
      const res = await fetch(`/api/assets?${params}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, assetType, categoryId]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari nama / kode / serial..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua Status</option>
            {Object.entries(ASSET_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
          >
            <option value="">Semua Tipe</option>
            {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Belum ada aset"
            description="Mulai dengan menambahkan aset pertama Anda."
            action={
              canCreate ? (
                <Link href="/assets/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Tambah Aset
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
              {total} aset ditemukan
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Owner / PIC</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tgl Beli</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Link
                        href={`/assets/${a.id}`}
                        className="font-mono text-xs font-medium text-brand-600 hover:underline"
                      >
                        {a.systemCode}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/assets/${a.id}`}
                        className="font-medium text-slate-800 hover:text-brand-600"
                      >
                        {a.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        {a.assetType === "DIGITAL" ? (
                          <Monitor className="h-3.5 w-3.5" />
                        ) : (
                          <Box className="h-3.5 w-3.5" />
                        )}
                        {ASSET_TYPE_LABELS[a.assetType]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.category?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {a.quantity ?? 1}
                      {a.quantityUnit ? ` ${a.quantityUnit}` : ""}
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.owner?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.location?.name ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {a.purchaseDate ? formatDate(a.purchaseDate) : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(a.currentValue)}
                    </TableCell>
                    <TableCell>
                      <AssetStatusBadge status={a.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Card>
    </div>
  );
}
