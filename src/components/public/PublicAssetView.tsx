"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Package,
  Boxes,
  Wrench,
  Wallet,
  Search,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ASSET_TYPE_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_COLORS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

type Asset = {
  id: string;
  systemCode: string;
  name: string;
  assetType: string;
  status: string;
  quantity: number;
  quantityUnit: string | null;
  currentValue: number;
  purchaseDate: string | null;
  category: string | null;
  owner: string | null;
  location: string | null;
};

type Company = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

const PIE_COLORS = [
  "#fe214f",
  "#0040a8",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#64748b",
];

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Package;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function PublicAssetView({
  company,
  assets,
}: {
  company: Company;
  assets: Asset[];
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter(
      (a) =>
        (!q ||
          a.name.toLowerCase().includes(q) ||
          a.systemCode.toLowerCase().includes(q)) &&
        (!type || a.assetType === type) &&
        (!status || a.status === status)
    );
  }, [assets, search, type, status]);

  const totalAssets = assets.length;
  const inMaintenance = assets.filter(
    (a) => a.status === "IN_MAINTENANCE"
  ).length;
  const totalValue = assets.reduce(
    (s, a) => s + a.currentValue * (a.quantity || 1),
    0
  );

  const byStatus = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of assets) m.set(a.status, (m.get(a.status) ?? 0) + 1);
    return Array.from(m, ([k, v]) => ({
      name: ASSET_STATUS_LABELS[k] ?? k,
      value: v,
    }));
  }, [assets]);

  const physical = assets.filter((a) => a.assetType === "PHYSICAL").length;
  const digital = assets.filter((a) => a.assetType === "DIGITAL").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/30 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Info PT */}
        <Card className="mb-6 animate-fade-up">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {company.name}
                </h1>
                <p className="text-sm text-slate-500">Daftar Aset Publik</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-slate-500">
              {company.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {company.email}
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {company.phone}
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {company.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistik + grafik */}
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            <Stat label="Total Aset" value={totalAssets} icon={Package} />
            <Stat
              label="Dalam Perawatan"
              value={inMaintenance}
              icon={Wrench}
            />
            <Stat
              label="Tipe (Fisik / Digital)"
              value={`${physical} / ${digital}`}
              icon={Boxes}
            />
            <Stat
              label="Total Nilai Aset"
              value={formatCurrency(totalValue)}
              icon={Wallet}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {byStatus.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-4 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari nama / kode..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Semua Tipe</option>
              {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Semua Status</option>
              {Object.entries(ASSET_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Tabel */}
        <Card>
          <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
            {filtered.length} dari {totalAssets} aset
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
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs text-brand-600">
                    {a.systemCode}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {a.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {ASSET_TYPE_LABELS[a.assetType]}
                  </TableCell>
                  <TableCell className="text-sm">{a.category ?? "-"}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {a.quantity}
                    {a.quantityUnit ? ` ${a.quantityUnit}` : ""}
                  </TableCell>
                  <TableCell className="text-sm">{a.owner ?? "-"}</TableCell>
                  <TableCell className="text-sm">{a.location ?? "-"}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {a.purchaseDate ? formatDate(a.purchaseDate) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        ASSET_STATUS_COLORS[a.status] ??
                        "bg-slate-100 text-slate-600"
                      }
                    >
                      {ASSET_STATUS_LABELS[a.status] ?? a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {company.name} · AsiaCommerce ASET
        </p>
      </div>
    </div>
  );
}
