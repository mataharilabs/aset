import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  // Mode SSO: login terpusat — arahkan ke SSO.
  if (process.env.SSO_ENABLED === "true" && process.env.SSO_URL) {
    redirect(`${process.env.SSO_URL}/login`);
  }
  return <LoginForm />;
}
