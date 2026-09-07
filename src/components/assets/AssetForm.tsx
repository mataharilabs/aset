"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import {
  assetSchema,
  type AssetInput,
  type AssetFormInput,
  type AssetFormOutput,
} from "@/lib/validations/asset";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import {
  ASSET_STATUS_LABELS,
  CONDITION_LABELS,
  DEPRECIATION_LABELS,
} from "@/lib/constants";

type Option = { id: string; name: string };
type Options = {
  categories: Option[];
  brands: Option[];
  locations: Option[];
  owners: Option[];
  users: Option[];
};

type Props = {
  assetId?: string;
  initial?: Partial<AssetInput>;
};

export function AssetForm({ assetId, initial }: Props) {
  const router = useRouter();
  const [options, setOptions] = useState<Options>({
    categories: [],
    brands: [],
    locations: [],
    owners: [],
    users: [],
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssetFormInput, unknown, AssetFormOutput>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      assetType: "PHYSICAL",
      status: "ACTIVE",
      condition: "GOOD",
      depreciationMethod: "STRAIGHT_LINE",
      tags: [],
      ...initial,
    },
  });

  const assetType = watch("assetType");

  useEffect(() => {
    fetch("/api/assets/options")
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => {});
  }, []);

  async function onSubmit(values: AssetFormOutput) {
    try {
      const url = assetId ? `/api/assets/${assetId}` : "/api/assets";
      const method = assetId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Gagal menyimpan aset");
      }
      const saved = await res.json();
      toast(`Aset berhasil ${assetId ? "diperbarui" : "ditambahkan"}`, "success");
      router.push(`/assets/${saved.id}`);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  const err = (name: keyof AssetInput) =>
    errors[name] ? (
      <p className="text-xs text-red-500">{String(errors[name]?.message)}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Umum</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nama Aset *</Label>
            <Input {...register("name")} placeholder="Contoh: Laptop Dell XPS" />
            {err("name")}
          </div>
          <div className="space-y-1.5">
            <Label>Tipe Aset</Label>
            <Select {...register("assetType")}>
              <option value="PHYSICAL">Fisik</option>
              <option value="DIGITAL">Digital</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Kategori *</Label>
            <Select {...register("categoryId")}>
              <option value="">Pilih kategori</option>
              {options.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {err("categoryId")}
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select {...register("status")}>
              {Object.entries(ASSET_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Kondisi</Label>
            <Select {...register("condition")}>
              {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Deskripsi</Label>
            <Textarea {...register("description")} />
          </div>
        </CardContent>
      </Card>

      {assetType === "PHYSICAL" ? (
        <Card>
          <CardHeader>
            <CardTitle>Identitas Fisik</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Serial Number</Label>
              <Input {...register("serialNumber")} />
            </div>
            <div className="space-y-1.5">
              <Label>Kode Produksi</Label>
              <Input {...register("productionCode")} />
            </div>
            <div className="space-y-1.5">
              <Label>Merk</Label>
              <Select {...register("brandId")}>
                <option value="">Pilih merk</option>
                {options.brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input {...register("model")} />
            </div>
            <div className="space-y-1.5">
              <Label>Warna</Label>
              <Input {...register("color")} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Identitas Digital</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Domain</Label>
              <Input {...register("domain")} placeholder="contoh.com" />
            </div>
            <div className="space-y-1.5">
              <Label>License Key</Label>
              <Input {...register("licenseKey")} />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Kadaluarsa</Label>
              <Input type="date" {...register("expiryDate")} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Kepemilikan & Lokasi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Owner / PIC</Label>
            <Select {...register("ownerId")}>
              <option value="">Pilih owner</option>
              {options.owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Lokasi</Label>
            <Select {...register("locationId")}>
              <option value="">Pilih lokasi</option>
              {options.locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ditugaskan ke</Label>
            <Select {...register("assignedToId")}>
              <option value="">Pilih pengguna</option>
              {options.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Keuangan & Penyusutan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tanggal Pembelian</Label>
            <Input type="date" {...register("purchaseDate")} />
          </div>
          <div className="space-y-1.5">
            <Label>Harga Pembelian (Rp)</Label>
            <Input type="number" step="any" {...register("purchasePrice")} />
          </div>
          <div className="space-y-1.5">
            <Label>Nilai Saat Ini (Rp)</Label>
            <Input type="number" step="any" {...register("currentValue")} />
          </div>
          <div className="space-y-1.5">
            <Label>Nilai Sisa / Salvage (Rp)</Label>
            <Input type="number" step="any" {...register("salvageValue")} />
          </div>
          <div className="space-y-1.5">
            <Label>Umur Ekonomis (tahun)</Label>
            <Input type="number" {...register("usefulLifeYears")} />
          </div>
          <div className="space-y-1.5">
            <Label>Metode Penyusutan</Label>
            <Select {...register("depreciationMethod")}>
              {Object.entries(DEPRECIATION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Catatan</Label>
            <Textarea {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan Aset
        </Button>
      </div>
    </form>
  );
}
