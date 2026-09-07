export type DepreciationMethod =
  | "STRAIGHT_LINE"
  | "DECLINING_BALANCE"
  | "DOUBLE_DECLINING";

export type DepreciationYear = {
  year: number;
  openingValue: number;
  depreciation: number;
  accumulated: number;
  closingValue: number;
};

/**
 * Hitung jadwal penyusutan tahunan.
 * @param cost harga perolehan
 * @param salvage nilai sisa
 * @param life umur ekonomis (tahun)
 * @param method metode penyusutan
 */
export function computeDepreciation(
  cost: number,
  salvage: number,
  life: number,
  method: DepreciationMethod
): DepreciationYear[] {
  if (!cost || !life || life <= 0) return [];
  const schedule: DepreciationYear[] = [];
  let book = cost;
  let accumulated = 0;

  const straightAmt = (cost - salvage) / life;
  const ddbRate = (method === "DOUBLE_DECLINING" ? 2 : 1.5) / life;

  for (let y = 1; y <= life; y++) {
    let dep: number;
    if (method === "STRAIGHT_LINE") {
      dep = straightAmt;
    } else {
      // Declining / double declining: rate * nilai buku, jangan turun di bawah salvage
      dep = book * ddbRate;
      if (book - dep < salvage) dep = book - salvage;
    }
    if (dep < 0) dep = 0;

    const opening = book;
    accumulated += dep;
    book = opening - dep;

    schedule.push({
      year: y,
      openingValue: round(opening),
      depreciation: round(dep),
      accumulated: round(accumulated),
      closingValue: round(book),
    });
  }
  return schedule;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
