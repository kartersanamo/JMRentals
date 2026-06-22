import { auth } from "@/lib/auth";
import { canAccessRolePath, getRoleHome } from "@/lib/rbac";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

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
  ],
};
