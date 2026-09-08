# ASET — AsiaCommerce Assets Management

Sistem manajemen aset fisik & digital: QR tracking, approval workflow, perawatan, penyusutan, keuangan, dan laporan.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + komponen UI custom
- **Prisma 6** + **PostgreSQL (Neon)** — via Neon serverless driver (koneksi lewat WebSocket/443)
- **Auth.js v5** (NextAuth) — login credentials + role-based session
- **Recharts**, **qrcode.react**, **html5-qrcode**

## Fitur

- Multi-perusahaan (multi-tenant) dengan isolasi data per `companyId`
- 3 role: **Super Admin**, **Asset Manager**, **Asset Handler**
- Aset fisik & digital, kode otomatis `AC-YYYY-XXXX`
- Master data: kategori, lokasi, merk, owner
- QR code per aset (cetak label + halaman scan publik `/scan/[code]`) + scanner kamera
- Transaksi aset (mutasi / penghapusan / serah terima) dengan **approval**
- Perawatan berjadwal + tandai selesai
- Keuangan aset (pemasukan/pengeluaran/pajak/asuransi) + ringkasan
- Laporan penyusutan (garis lurus / saldo menurun) + ekspor CSV/Excel + cetak PDF
- Audit log & notifikasi in-app
- Manajemen pengguna & profil perusahaan

## Menjalankan Lokal

### 1. Environment

Salin `.env.example` ke `.env` dan isi:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="<hasil: openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
```

> **Neon:** pastikan project **Active** di https://console.neon.tech (compute free-tier bisa auto-suspend). Gunakan connection string **pooler**.

### 2. Setup Database

```bash
npm install
npm run db:push     # buat semua tabel di Neon
npm run db:seed     # isi data demo
```

### 3. Jalankan

```bash
npm run dev         # http://localhost:3000
```

## Kredensial Demo (setelah seed)

| Role          | Email                    | Password    |
| ------------- | ------------------------ | ----------- |
| Super Admin   | admin@asiacommerce.net   | password123 |
| Asset Manager | manager@asiacommerce.net | password123 |
| Asset Handler | handler@asiacommerce.net | password123 |

Atau daftar perusahaan baru di `/register`.

## Script

| Script              | Fungsi                         |
| ------------------- | ------------------------------ |
| `npm run dev`       | Development server             |
| `npm run build`     | Build production               |
| `npm run db:push`   | Sinkron schema ke database     |
| `npm run db:seed`   | Isi data demo                  |
| `npm run db:studio` | Prisma Studio (GUI database)   |

## Struktur

```
src/
├── app/
│   ├── (auth)/            login, register
│   ├── (dashboard)/       dashboard, assets, transactions, maintenance,
│   │                      financial, reports, audit, master, settings, scan
│   ├── scan/[code]/       halaman scan QR publik
│   └── api/               REST API (assets, master, transactions, ...)
├── components/            ui, layout, assets, qr, transactions, dll
├── lib/                   prisma, auth/session, validations, services
└── middleware.ts          proteksi route
```

## Deploy (Vercel)

1. Push ke GitHub, import di Vercel
2. Set env vars (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST=true`)
3. Deploy — `npm run build` menjalankan `prisma generate` otomatis

## Integrasi SSO (sso.asiacommerce.net)

ASET dapat memakai **SSO terpusat** (`sso.asiacommerce.net`) sebagai sumber identitas &
login tunggal lintas aplikasi `*.asiacommerce.net`. Diaktifkan lewat flag `SSO_ENABLED`.

**Env ASET (Vercel) untuk mode SSO:**

```
SSO_ENABLED=true
SSO_URL=https://sso.asiacommerce.net
AUTH_SECRET=<SAMA PERSIS dengan SSO>     # wajib identik agar cookie terbaca
COOKIE_DOMAIN=.asiacommerce.net
AUTH_TRUST_HOST=true
DATABASE_URL=<Neon ASET (tetap)>
```

**Perilaku saat `SSO_ENABLED=true`:**

- Cookie sesi Auth.js di-scope `.asiacommerce.net` (nama & secret sama dgn SSO) → `auth()`
  ASET membaca sesi terbitan SSO tanpa login ulang.
- Middleware: request belum login → redirect ke `${SSO_URL}/login?callbackUrl=...`.
- Halaman `/login`, `/register`, `/settings/users` ASET → redirect ke SSO. Logout → `${SSO_URL}/logout`.
- **Role & company tetap referensi LOKAL**: `ensureLocalUser()` (`src/lib/session.ts`) mencocokkan
  user berdasarkan **email**, membuat/menyinkron baris `users` lokal (company default ASET),
  role diambil dari klaim `apps["ASET"]` pada JWT SSO. Data aset (difilter `companyId` lokal)
  tetap konsisten.
- User tanpa peran ASET di SSO → halaman `/no-access`.

**Mematikan SSO:** set `SSO_ENABLED=false` (atau hapus) → ASET kembali ke login lokal seperti semula.

> Manajemen user, profil (personal + kepegawaian), dan role per-aplikasi dikelola di SSO
> (repo `mataharilabs/sso`). Field payroll/absensi/cuti/pendidikan/performa = domain HRIS.
