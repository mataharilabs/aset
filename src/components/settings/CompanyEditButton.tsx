"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toaster";

type Company = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export function CompanyEditButton({
  canEdit,
  company,
}: {
  canEdit: boolean;
  company: Company;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: company.name ?? "",
    email: company.email ?? "",
    phone: company.phone ?? "",
    address: company.address ?? "",
  });

  function onClick() {
    if (!canEdit) {
      toast("Hanya Super Admin yang dapat mengedit profil perusahaan", "info");
      return;
    }
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error)
        throw new Error(data.error ?? data.issues?.[0]?.message ?? "Gagal");
      toast("Profil perusahaan diperbarui", "success");
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="outline" onClick={onClick}>
        <Pencil className="h-4 w-4" />
        Edit
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Edit Profil Perusahaan">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Perusahaan *</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Telepon</Label>
            <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Alamat</Label>
            <Textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
