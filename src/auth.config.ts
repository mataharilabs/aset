import type { NextAuthConfig } from "next-auth";

// Konfigurasi edge-safe (tanpa Prisma / bcrypt).
// Dipakai bersama oleh middleware dan auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const isPublic =
        path.startsWith("/login") ||
        path.startsWith("/register") ||
        path.startsWith("/scan") ||
        path === "/";

      if (isPublic) return true;
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role!;
        token.companyId = user.companyId!;
        token.companyName = user.companyName!;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
        session.user.companyId = token.companyId as string;
        session.user.companyName = token.companyName as string;
      }
      return session;
    },
  },
  providers: [], // diisi di auth.ts
} satisfies NextAuthConfig;
