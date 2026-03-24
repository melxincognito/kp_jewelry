import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Uses the lightweight authConfig (no Prisma) so it runs safely in the Edge Runtime.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/messages/:path*"],
};
