import { redirect } from "next/navigation";
import { requireUser, isManagerUp } from "@/lib/session";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { QRScanner } from "@/components/qr/QRScanner";

export default async function ScanPage() {
  const user = await requireUser();
  if (!isManagerUp(user.role)) redirect("/assets");
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Scan QR Aset"
        description="Arahkan kamera ke QR code aset untuk melihat detailnya."
      />
      <Card>
        <CardContent className="pt-6">
          <QRScanner />
        </CardContent>
      </Card>
    </div>
  );
}
