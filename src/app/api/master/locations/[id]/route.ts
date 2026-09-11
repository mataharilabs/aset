import { ok } from "@/lib/api";

// Lokasi = cermin master Office di SSO. Ubah/hapus hanya di SSO.
const forbidden = () =>
  ok(
    { error: "Lokasi dikelola di SSO (Lokasi Kantor). Tidak bisa diubah/dihapus dari ASET." },
    403
  );

export async function PUT() {
  return forbidden();
}

export async function DELETE() {
  return forbidden();
}
