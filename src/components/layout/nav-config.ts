import type { NavRole } from "@/lib/constants";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Wrench,
  Wallet,
  FileBarChart,
  ScrollText,
  Database,
  Building2,
  QrCode,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: NavRole[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

const ALL: NavRole[] = ["SUPER_ADMIN", "ASSET_MANAGER", "ASSET_HANDLER"];
const MANAGER: NavRole[] = ["SUPER_ADMIN", "ASSET_MANAGER"];
const ADMIN: NavRole[] = ["SUPER_ADMIN"];

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ALL },
      { label: "Aset", href: "/assets", icon: Package, roles: ALL },
      { label: "Transaksi", href: "/transactions", icon: ArrowLeftRight, roles: ALL },
      { label: "Perawatan", href: "/maintenance", icon: Wrench, roles: ALL },
      { label: "Scan QR", href: "/scan", icon: QrCode, roles: ALL },
    ],
  },
  {
    title: "Keuangan & Laporan",
    items: [
      { label: "Keuangan", href: "/financial", icon: Wallet, roles: MANAGER },
      { label: "Laporan", href: "/reports", icon: FileBarChart, roles: MANAGER },
      { label: "Audit Log", href: "/audit", icon: ScrollText, roles: MANAGER },
    ],
  },
  {
    title: "Master Data",
    items: [
      { label: "Master Data", href: "/master", icon: Database, roles: MANAGER },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      { label: "Perusahaan", href: "/settings/company", icon: Building2, roles: ADMIN },
    ],
  },
];

export function navForRole(role: NavRole): NavGroup[] {
  return NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => i.roles.includes(role)),
  })).filter((g) => g.items.length > 0);
}
