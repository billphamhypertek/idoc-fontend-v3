import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  isProtectedRoute,
  routes,
} from "~/definitions/constants/routes.constants";

const contentSecurityPolicyHeader = (request: NextRequest) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = ``;
  const result = cspHeader.replace(/\s{2,}/g, " ").trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", result);

  return { requestHeaders, contentSecurityPolicyValue: result };
};

const clearAuthCookies = (response: NextResponse) => {
  response.cookies.delete("tokenInfo");
  return response;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { requestHeaders, contentSecurityPolicyValue } =
    contentSecurityPolicyHeader(request);

  const hasValidToken = request.cookies.get("tokenInfo")?.value;

  const isPublicRoute = routes.publicRoutes.includes(pathname);
  const isAuthRoute = routes.authRoutes.includes(pathname);
  const isProtectedRouted = isProtectedRoute(pathname);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", contentSecurityPolicyValue);

  // Allow public routes
  if (isPublicRoute) {
    return response;
  }

  // If user is on auth route but already logged in, redirect to dashboard
  if (isAuthRoute && hasValidToken && pathname !== "/auto-login") {
    response = NextResponse.redirect(new URL("/", request.url));
    return response;
  }
  // If user is on protected route but not logged in, redirect to login
  if (isProtectedRouted && !hasValidToken) {
    response = NextResponse.redirect(new URL("/login", request.url));
    return clearAuthCookies(response);
  }
  // If user is on root path and not logged in, redirect to login
  if (pathname === "/" && !hasValidToken) {
    response = NextResponse.redirect(new URL("/login", request.url));
    return clearAuthCookies(response);
  }
  // If user is on root path and logged in, redirect to dashboard
  if (pathname === "/" && hasValidToken) {
    return response; // NextResponse.next() với headers ở trên
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};
