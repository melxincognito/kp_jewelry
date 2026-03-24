import type { NextAuthConfig } from "next-auth";

// Lightweight config with NO database imports — safe for the Edge Runtime used by middleware.
// The full auth config (with Prisma adapter + providers) lives in lib/auth.ts.
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.role === "ADMIN";

      if (nextUrl.pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        if (!isAdmin) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (nextUrl.pathname.startsWith("/messages")) {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        return true;
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
