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

## Data User & Roadmap SSO

`User` (inti auth: email, password, role, phone) sengaja dipisah dari `UserProfile`
(1‑1: data personal + kepegawaian dasar). Field payroll/absensi/cuti/pendidikan/performa
**tidak** disimpan di sini — itu domain aplikasi **HRIS** terpisah.

Arah SSO lintas aplikasi (`aset`, `hris`, dll di `*.asiacommerce.net`):

- **Central Identity DB**: pindahkan `User` + `UserProfile` + auth ke satu database Neon
  terpisah sebagai sumber identitas tunggal.
- **Shared session**: semua app memakai **`AUTH_SECRET` yang sama** dan cookie Auth.js
  di-scope `domain=.asiacommerce.net` → login sekali berlaku di semua subdomain.
- **DB per app**: tiap app punya database domainnya sendiri, mereferensikan user lewat
  `userId` (bukan foreign key lintas-DB, karena Prisma tidak mendukungnya).
- **Ekstraksi nanti**: ASET menyimpan tabel `users` ringkas (id, email, nama) yang
  disinkron dari Identity DB (via API/OIDC), sementara relasi domain (aset, transaksi)
  tetap memakai `userId`.

Desain sekarang sudah SSO-ready: `email` unik global, auth terpisah di `User`,
data profil terisolasi di `UserProfile`.
