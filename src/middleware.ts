import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth-cookie";

// Fast redirect when there's no session cookie at all. Pages still verify the session against the database.
export function middleware(request: NextRequest) {
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding"],
};
