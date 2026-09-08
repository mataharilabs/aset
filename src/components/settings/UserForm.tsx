"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import {
  ROLE_LABELS,
  GENDER_LABELS,
  MARITAL_STATUS_LABELS,
  EMPLOYMENT_STATUS_LABELS,
} from "@/lib/constants";

type Option = { id: string; name: string };

export type UserFormInitial = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  reportsToId: string | null;
  profile: Record<string, unknown> | null;
};

type Props = {
  userId?: string;
  initial?: UserFormInitial;
};

// Field profil yang berupa tanggal → di-slice ke yyyy-mm-dd untuk input date
const DATE_FIELDS = new Set(["birthDate", "joinDate", "endDate"]);

function toDateInput(v: unknown): string {
  if (!v) return "";
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export function UserForm({ userId, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(userId);
  const [managers, setManagers] = useState<Option[]>([]);
  const [saving, setSaving] = useState(false);

  // State akun
  const [account, setAccount] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    password: "",
    role: initial?.role ?? "ASSET_HANDLER",
    phone: initial?.phone ?? "",
    reportsToId: initial?.reportsToId ?? "",
  });

  // State profil (semua string untuk input)
  const [profile, setProfile] = useState<Record<string, string>>(() => {
    const p = (initial?.profile ?? {}) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(p)) {
      if (v == null) {
        out[k] = "";
      } else if (DATE_FIELDS.has(k)) {
        out[k] = toDateInput(v);
      } else {
        out[k] = String(v);
      }
    }
    return out;
  });

  useEffect(() => {
    fetch("/api/assets/options")
      .then((r) => r.json())
      .then((d) =>
        setManagers(
          (d.users ?? []).filter((u: Option) => u.id !== userId)
        )
      )
      .catch(() => {});
  }, [userId]);

  const setP = (k: string, v: string) =>
    setProfile((prev) => ({ ...prev, [k]: v }));

  async function submit() {
    if (!account.name || !account.email) {
      toast("Nama dan email wajib diisi", "error");
      return;
    }
    if (!isEdit && !account.password) {
      toast("Password wajib diisi untuk user baru", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: account.name,
        email: account.email,
        role: account.role,
        phone: account.phone || null,
        reportsToId: account.reportsToId || null,
        profile,
      };
      if (account.password) payload.password = account.password;

      const url = isEdit ? `/api/users/${userId}` : "/api/users";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(
          data.error ?? data.issues?.[0]?.message ?? "Gagal menyimpan"
        );
      }
      toast(
        `Pengguna berhasil ${isEdit ? "diperbarui" : "ditambahkan"}`,
        "success"
      );
      router.push("/settings/users");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Segment: Akun & Akses */}
      <Card>
        <CardHeader>
          <CardTitle>Akun & Akses</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nama Lengkap *</Label>
            <Input
              value={account.name}
              onChange={(e) =>
                setAccount((a) => ({ ...a, name: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email (untuk login / SSO) *</Label>
            <Input
              type="email"
              value={account.email}
              onChange={(e) =>
                setAccount((a) => ({ ...a, email: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              Password {isEdit ? "(kosongkan jika tidak diubah)" : "*"}
            </Label>
            <Input
              type="password"
              placeholder={isEdit ? "••••••" : "Minimal 6 karakter"}
              value={account.password}
              onChange={(e) =>
                setAccount((a) => ({ ...a, password: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>No. HP / WhatsApp</Label>
            <Input
              value={account.phone}
              onChange={(e) =>
                setAccount((a) => ({ ...a, phone: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role (Akses ASET)</Label>
            <Select
              value={account.role}
              onChange={(e) =>
                setAccount((a) => ({ ...a, role: e.target.value }))
              }
            >
              {Object.entries(ROLE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Atasan Langsung</Label>
            <Select
              value={account.reportsToId}
              onChange={(e) =>
                setAccount((a) => ({ ...a, reportsToId: e.target.value }))
              }
            >
              <option value="">- Tidak ada -</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Segment: Data Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Data Personal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Panggilan" k="nickname" profile={profile} onChange={setP} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tempat Lahir" k="birthPlace" profile={profile} onChange={setP} />
            <div className="space-y-1.5">
              <Label>Tanggal Lahir</Label>
              <Input
                type="date"
                value={profile.birthDate ?? ""}
                onChange={(e) => setP("birthDate", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Jenis Kelamin</Label>
            <Select
              value={profile.gender ?? ""}
              onChange={(e) => setP("gender", e.target.value)}
            >
              <option value="">-</option>
              {Object.entries(GENDER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status Pernikahan</Label>
            <Select
              value={profile.maritalStatus ?? ""}
              onChange={(e) => setP("maritalStatus", e.target.value)}
            >
              <option value="">-</option>
              {Object.entries(MARITAL_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <Field label="NIK (No. KTP)" k="nik" profile={profile} onChange={setP} />
          <Field label="No. KK" k="kkNumber" profile={profile} onChange={setP} />
          <Field label="NPWP" k="npwp" profile={profile} onChange={setP} />
          <Field label="No. Paspor / KITAS" k="passportNumber" profile={profile} onChange={setP} />
          <Field label="Email Pribadi" k="personalEmail" type="email" profile={profile} onChange={setP} />
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Alamat KTP</Label>
            <Textarea
              value={profile.addressKtp ?? ""}
              onChange={(e) => setP("addressKtp", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Alamat Domisili</Label>
            <Textarea
              value={profile.addressDomicile ?? ""}
              onChange={(e) => setP("addressDomicile", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Segment: Kontak Darurat */}
      <Card>
        <CardHeader>
          <CardTitle>Kontak Darurat</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Nama" k="emergencyName" profile={profile} onChange={setP} />
          <Field label="Hubungan" k="emergencyRelation" profile={profile} onChange={setP} />
          <Field label="No. Telepon" k="emergencyPhone" profile={profile} onChange={setP} />
        </CardContent>
      </Card>

      {/* Segment: Kepegawaian */}
      <Card>
        <CardHeader>
          <CardTitle>Kepegawaian</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="ID Karyawan" k="employeeId" profile={profile} onChange={setP} />
          <Field label="Jabatan" k="jobTitle" profile={profile} onChange={setP} />
          <Field label="Departemen / Divisi" k="department" profile={profile} onChange={setP} />
          <Field label="Level / Golongan" k="level" profile={profile} onChange={setP} />
          <Field label="Lokasi Kerja" k="workLocation" profile={profile} onChange={setP} />
          <div className="space-y-1.5">
            <Label>Status Kerja</Label>
            <Select
              value={profile.employmentStatus ?? ""}
              onChange={(e) => setP("employmentStatus", e.target.value)}
            >
              <option value="">-</option>
              {Object.entries(EMPLOYMENT_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal Bergabung</Label>
            <Input
              type="date"
              value={profile.joinDate ?? ""}
              onChange={(e) => setP("joinDate", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tanggal Selesai / Akhir Kontrak</Label>
            <Input
              type="date"
              value={profile.endDate ?? ""}
              onChange={(e) => setP("endDate", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
        <Button onClick={submit} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  k,
  profile,
  onChange,
  type = "text",
}: {
  label: string;
  k: string;
  profile: Record<string, string>;
  onChange: (k: string, v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={profile[k] ?? ""}
        onChange={(e) => onChange(k, e.target.value)}
      />
    </div>
  );
}
