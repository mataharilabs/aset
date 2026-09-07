import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { ScrollText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  SCAN: "bg-violet-100 text-violet-700 border-violet-200",
  APPROVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  REJECT: "bg-red-100 text-red-700 border-red-200",
};

export default async function AuditPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    where: { companyId: user.companyId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Riwayat aktivitas seluruh pengguna dalam sistem."
      />
      <Card>
        {logs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="Belum ada aktivitas"
            description="Aktivitas pengguna akan tercatat di sini."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Pengguna</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Entitas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.user.name ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        ACTION_COLORS[log.action] ??
                        "bg-slate-100 text-slate-600"
                      }
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {log.entityType}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
