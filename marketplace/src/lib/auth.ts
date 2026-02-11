import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import dbConnect from "@/lib/db";
import User from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: "customer" | "vendor" | "admin";
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
    async signIn({ user }) {
      if (!user.email) return false;
      await dbConnect();
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        await User.create({
          name: user.name ?? "Unknown",
          email: user.email,
          image: user.image ?? undefined,
          role: "customer",
        });
      } else if (user.image && existingUser.image !== user.image) {
        existingUser.image = user.image;
        await existingUser.save();
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "customer" | "vendor" | "admin";
      }
      return session;
    },
  },
});
