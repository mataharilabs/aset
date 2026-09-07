import Link from "next/link";
import { redirect } from "next/navigation";
import { Tag, MapPin, Award, UserCircle, ChevronRight } from "lucide-react";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";

const items = [
  {
    href: "/master/categories",
    label: "Kategori",
    desc: "Kategori & sub-kategori aset",
    icon: Tag,
  },
  {
    href: "/master/locations",
    label: "Lokasi",
    desc: "Lokasi penempatan aset",
    icon: MapPin,
  },
  {
    href: "/master/brands",
    label: "Merk",
    desc: "Merk / brand aset",
    icon: Award,
  },
  {
    href: "/master/owners",
    label: "Owner / PIC",
    desc: "Pemilik & penanggung jawab",
    icon: UserCircle,
  },
];

export default async function MasterPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  return (
    <div>
      <PageHeader
        title="Master Data"
        description="Kelola data referensi untuk aset."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link key={it.href} href={it.href}>
              <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">
                    {it.label}
                  </div>
                  <div className="text-sm text-slate-500">{it.desc}</div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
