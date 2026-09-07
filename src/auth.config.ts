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
        // @ts-expect-error - custom fields diteruskan dari authorize
        token.role = user.role;
        // @ts-expect-error - custom fields diteruskan dari authorize
        token.companyId = user.companyId;
        // @ts-expect-error - custom fields diteruskan dari authorize
        token.companyName = user.companyName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // @ts-expect-error - custom session fields
        session.user.role = token.role;
        // @ts-expect-error - custom session fields
        session.user.companyId = token.companyId;
        // @ts-expect-error - custom session fields
        session.user.companyName = token.companyName;
      }
      return session;
    },
  },
  providers: [], // diisi di auth.ts
} satisfies NextAuthConfig;
