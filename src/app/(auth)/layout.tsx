import { Package } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel kiri - branding */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-brand-700 to-brand-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold">ASET</div>
            <div className="text-xs text-white/70">AsiaCommerce</div>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Kelola seluruh aset perusahaan dalam satu platform
          </h1>
          <p className="text-white/80">
            Aset fisik & digital, QR tracking, approval workflow, perawatan,
            penyusutan, dan laporan keuangan — semuanya terpusat.
          </p>
        </div>
        <div className="text-sm text-white/60">
          © {new Date().getFullYear()} AsiaCommerce. All rights reserved.
        </div>
      </div>

      {/* Panel kanan - form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
