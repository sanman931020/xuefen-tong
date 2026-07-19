import type { NextAuthConfig } from "next-auth";

/**
 * Edge／middleware 可用設定（不可 import Prisma）
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  session: { strategy: "jwt" as const },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (!token.id && token.sub) token.id = token.sub;
      return token;
    },
    async session({ session, token }) {
      const id = (token.id ?? token.sub) as string | undefined;
      if (session.user && id) session.user.id = id;
      return session;
    },
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
} satisfies NextAuthConfig;
