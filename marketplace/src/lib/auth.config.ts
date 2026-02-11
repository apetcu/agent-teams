import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    jwt({ token }) {
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = (token.id ?? token.sub) as string;
        session.user.role = token.role as "customer" | "vendor" | "admin";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
