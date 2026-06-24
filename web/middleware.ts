import { auth } from "@/lib/auth";
import { canAccessRolePath, getRoleHome } from "@/lib/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  if (
    pathname.startsWith("/api/auth") &&
    req.method === "POST" &&
    !checkRateLimit(`login-ip:${getClientIp(req)}`, 30, 15 * 60 * 1000)
  ) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please try again later." },
      { status: 429 }
    );
  }

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email";
  const isPortal = pathname.startsWith("/portal");

  if (isPortal && !isLoggedIn) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (isLoggedIn && isAuthPage) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl?.startsWith("/")) {
      return NextResponse.redirect(new URL(callbackUrl, req.nextUrl.origin));
    }
    return NextResponse.redirect(
      new URL(getRoleHome(session.user.role), req.nextUrl.origin)
    );
  }

  if (isLoggedIn && isPortal && session.user) {
    if (!canAccessRolePath(session.user.role, pathname)) {
      return NextResponse.redirect(
        new URL(getRoleHome(session.user.role), req.nextUrl.origin)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/portal/:path*",
    "/login",
    "/register",
    "/verify-email",
    "/api/auth/:path*",
  ],
};
