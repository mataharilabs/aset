/** Bangun string CSV dari header + baris. Escape sesuai RFC 4180. */
export function buildCsv(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): string {
  const escape = (val: string | number | null | undefined) => {
    const s = val === null || val === undefined ? "" : String(val);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ];
  // BOM agar Excel membaca UTF-8 dengan benar
  return "﻿" + lines.join("\r\n");
}
