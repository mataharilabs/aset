"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Email atau password salah.";
        default:
          return "Gagal masuk. Coba lagi.";
      }
    }
    throw error; // redirect throw harus dilempar ulang
  }
}

export async function logout() {
  // Mode SSO: logout global lewat SSO (menghapus cookie .asiacommerce.net).
  if (process.env.SSO_ENABLED === "true" && process.env.SSO_URL) {
    redirect(`${process.env.SSO_URL}/logout`);
  }
  await signOut({ redirectTo: "/login" });
}
