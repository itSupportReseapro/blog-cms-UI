import { NextResponse } from "next/server";

const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/signup",
  "/verify-otp",
  "/reset-password",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("blog_cms_token")?.value;

  if (pathname.startsWith("/blog") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/blog/:path*", "/login", "/forgot-password", "/signup", "/verify-otp", "/reset-password"],
};
