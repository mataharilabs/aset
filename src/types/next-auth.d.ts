import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "ASSET_MANAGER" | "ASSET_HANDLER";
      companyId: string;
      companyName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "SUPER_ADMIN" | "ASSET_MANAGER" | "ASSET_HANDLER";
    companyId?: string;
    companyName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "SUPER_ADMIN" | "ASSET_MANAGER" | "ASSET_HANDLER";
    companyId: string;
    companyName: string;
  }
}
