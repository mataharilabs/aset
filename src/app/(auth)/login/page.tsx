"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AlertCircle, LogIn } from "lucide-react";
import { authenticate } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      <LogIn className="h-4 w-4" />
      {pending ? "Memproses..." : "Masuk"}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, formAction] = useActionState(authenticate, undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-1 lg:hidden">
        <div className="text-2xl font-bold text-brand-700">ASET</div>
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">Selamat datang</h2>
        <p className="text-sm text-slate-500">
          Masuk untuk mengelola aset perusahaan Anda.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@perusahaan.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </div>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-slate-500">
        Belum punya akun perusahaan?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-600 hover:underline"
        >
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}
