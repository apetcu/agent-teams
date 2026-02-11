import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as any;
  const isAuthenticated = !!req.auth;

  // Admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated || user?.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  // Vendor routes - require vendor or admin role
  if (pathname.startsWith("/vendor")) {
    if (!isAuthenticated || !["vendor", "admin"].includes(user?.role)) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  // Protected customer routes
  const protectedPaths = ["/checkout", "/orders", "/wishlist", "/cart"];
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/wishlist",
    "/cart",
  ],
};
