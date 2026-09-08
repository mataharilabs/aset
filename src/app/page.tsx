import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";

export default async function HomePage() {
  // Cukup cek sesi mentah; kontrol akses ASET ditangani di /dashboard.
  if (await isAuthenticated()) redirect("/dashboard");
  redirect("/login");
}
