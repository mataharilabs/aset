import { prisma } from "@/lib/prisma";

/**
 * Generate system code unik untuk aset: AC-YYYY-XXXX
 * XXXX = urutan berdasarkan jumlah aset company + 1 (di-pad 4 digit).
 * Loop untuk memastikan tidak bentrok.
 */
export async function generateSystemCode(companyId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `AC-${year}-`;

  const count = await prisma.asset.count({ where: { companyId } });
  let seq = count + 1;

  // Cari kode yang belum terpakai (jaga-jaga jika ada gap/duplikat)
  for (let i = 0; i < 1000; i++) {
    const code = `${prefix}${String(seq).padStart(4, "0")}`;
    const exists = await prisma.asset.findUnique({
      where: { systemCode: code },
      select: { id: true },
    });
    if (!exists) return code;
    seq++;
  }
  // Fallback dengan timestamp
  return `${prefix}${Date.now().toString().slice(-6)}`;
}

/** Generate kode transaksi: TXN-YYYY-XXXX */
export async function generateTransactionCode(
  companyId: string
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;
  const count = await prisma.assetTransaction.count({ where: { companyId } });
  let seq = count + 1;

  for (let i = 0; i < 1000; i++) {
    const code = `${prefix}${String(seq).padStart(4, "0")}`;
    const exists = await prisma.assetTransaction.findUnique({
      where: { transactionCode: code },
      select: { id: true },
    });
    if (!exists) return code;
    seq++;
  }
  return `${prefix}${Date.now().toString().slice(-6)}`;
}
