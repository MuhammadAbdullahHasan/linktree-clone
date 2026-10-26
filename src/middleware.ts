import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Public profile pages and click redirects don't need a session refresh.
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/signup", "/auth/:path*"],
};
