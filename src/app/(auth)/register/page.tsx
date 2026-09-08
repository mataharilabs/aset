import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  // Mode SSO: registrasi/identitas dikelola terpusat di SSO.
  if (process.env.SSO_ENABLED === "true" && process.env.SSO_URL) {
    redirect(`${process.env.SSO_URL}/register`);
  }
  return <RegisterForm />;
}
