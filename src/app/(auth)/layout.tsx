import { Package, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel kiri - branding */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-blob absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-blob absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-accent-300/20 blur-3xl [animation-delay:4s]" />
        </div>

        <div className="animate-fade-up relative z-10 flex items-center gap-3">
          <div className="animate-floaty flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold">ASET</div>
            <div className="text-xs text-white/70">AsiaCommerce</div>
          </div>
        </div>

        <div className="animate-fade-up delay-200 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Manajemen aset terpusat
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Kelola seluruh aset perusahaan dalam satu platform
          </h1>
          <p className="text-white/80">
            Aset fisik & digital, QR tracking, approval workflow, perawatan,
            penyusutan, dan laporan keuangan — semuanya terpusat.
          </p>
        </div>

        <div className="animate-fade-up delay-300 relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} AsiaCommerce. All rights reserved.
        </div>
      </div>

      {/* Panel kanan - form */}
      <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-brand-50/40 to-white p-6">
        <div className="animate-blob pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl lg:hidden" />
        <div className="animate-fade-up delay-100 relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
