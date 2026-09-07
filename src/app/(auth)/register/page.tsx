"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, UserPlus } from "lucide-react";
import { registerCompany, type RegisterState } from "@/lib/actions/register";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <UserPlus className="h-4 w-4" />
      {pending ? "Memproses..." : "Daftar"}
    </Button>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction] = useActionState<RegisterState, FormData>(
    registerCompany,
    {}
  );

  useEffect(() => {
    if (state.success) {
      toast("Registrasi berhasil! Silakan masuk.", "success");
      router.push("/login");
    }
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">
          Daftar Perusahaan
        </h2>
        <p className="text-sm text-slate-500">
          Buat akun perusahaan & user Super Admin pertama.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="companyName">Nama Perusahaan</Label>
          <Input
            id="companyName"
            name="companyName"
            placeholder="PT AsiaCommerce"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Lengkap Anda</Label>
          <Input id="name" name="name" placeholder="Budi Santoso" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@perusahaan.com"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimal 6 karakter"
            required
          />
        </div>

        {state.error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {state.error}
          </div>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
