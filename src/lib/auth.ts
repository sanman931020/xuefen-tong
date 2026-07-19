import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  username: z.string().min(4).max(40),
  password: z.string().min(4).max(100),
});

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      username: { label: "帳號", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const username = parsed.data.username.trim().toLowerCase();
      const user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user?.passwordHash) return null;

      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email ?? undefined,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

export const googleAuthEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

if (googleAuthEnabled) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Google：同一 Google 帳號永遠對到同一個 User（跨瀏覽器共用資料）
      if (account?.provider === "google" && account.providerAccountId) {
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          },
        });
        if (existingAccount) {
          user.id = existingAccount.userId;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user?.id) {
        token.id = user.id;
      }

      // OAuth 登入當下再以 Google Account 鎖定 userId，避免不同瀏覽器建出不同帳號
      if (account?.provider === "google" && account.providerAccountId) {
        const linked = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          },
        });
        if (linked) {
          token.id = linked.userId;
        }
      }

      if (!token.id && token.sub) {
        token.id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      const id = (token.id ?? token.sub) as string | undefined;
      if (session.user && id) {
        session.user.id = id;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, displayName: user.name ?? undefined },
        update: {},
      });
    },
  },
  trustHost: true,
});
