// Label & metadata untuk enum-enum di aplikasi (Bahasa Indonesia)

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ASSET_MANAGER: "Asset Manager",
  ASSET_HANDLER: "Asset Handler",
};

export const ASSET_TYPE_LABELS: Record<string, string> = {
  PHYSICAL: "Fisik",
  DIGITAL: "Digital",
};

export const ASSET_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Non-Aktif",
  IN_MAINTENANCE: "Perawatan",
  DISPOSED: "Dihapus",
  TRANSFERRED: "Dipindahkan",
  LOST: "Hilang",
};

export const ASSET_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  IN_MAINTENANCE: "bg-amber-100 text-amber-700 border-amber-200",
  DISPOSED: "bg-red-100 text-red-700 border-red-200",
  TRANSFERRED: "bg-blue-100 text-blue-700 border-blue-200",
  LOST: "bg-red-100 text-red-700 border-red-200",
};

export const CONDITION_LABELS: Record<string, string> = {
  EXCELLENT: "Sangat Baik",
  GOOD: "Baik",
  FAIR: "Cukup",
  POOR: "Buruk",
  DAMAGED: "Rusak",
};

export const DEPRECIATION_LABELS: Record<string, string> = {
  STRAIGHT_LINE: "Garis Lurus",
  DECLINING_BALANCE: "Saldo Menurun",
  DOUBLE_DECLINING: "Saldo Menurun Ganda",
};

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  MUTATION: "Mutasi",
  DISPOSAL: "Penghapusan",
  REVERSE_DISPOSAL: "Batal Penghapusan",
  HANDOVER: "Serah Terima",
};

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const MAINTENANCE_TYPE_LABELS: Record<string, string> = {
  SCHEDULED: "Terjadwal",
  CORRECTIVE: "Perbaikan",
  PREVENTIVE: "Pencegahan",
  ONE_TIME: "Sekali",
};

export const MAINTENANCE_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Terjadwal",
  IN_PROGRESS: "Berlangsung",
  COMPLETED: "Selesai",
  OVERDUE: "Terlambat",
  CANCELLED: "Dibatalkan",
};

export const MAINTENANCE_FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  QUARTERLY: "Triwulan",
  SEMI_ANNUAL: "Semester",
  ANNUAL: "Tahunan",
};

export const FINANCIAL_TYPE_LABELS: Record<string, string> = {
  INCOME: "Pemasukan",
  EXPENSE: "Pengeluaran",
  TAX: "Pajak",
  INSURANCE: "Asuransi",
};

// Navigasi berdasarkan role
export type NavRole = "SUPER_ADMIN" | "ASSET_MANAGER" | "ASSET_HANDLER";

export const ALL_ROLES: NavRole[] = [
  "SUPER_ADMIN",
  "ASSET_MANAGER",
  "ASSET_HANDLER",
];
export const MANAGER_UP: NavRole[] = ["SUPER_ADMIN", "ASSET_MANAGER"];
export const ADMIN_ONLY: NavRole[] = ["SUPER_ADMIN"];
