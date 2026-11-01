import { NextResponse } from "next/server";
import { consumeHandoff, HANDOFF_SESSION_DAYS, isManagedBy } from "@/lib/admin";
import { createSession, getCurrentUser, setActingAs } from "@/lib/auth";

/**
 * Opens a one-time link from the Control Room. The browser gets a short session that can only
 * edit that one profile. If the admin is already signed in here, it switches them to it instead.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const profileId = token ? await consumeHandoff(token) : null;
  const headers = { "cache-control": "no-store", "referrer-policy": "no-referrer" };
  if (!profileId) {
    return new NextResponse("This link has expired or was already used. Open the profile again from the Control Room.", {
      status: 410,
      headers: { ...headers, "content-type": "text/plain; charset=utf-8" },
    });
  }

  const current = await getCurrentUser();
  if (current && (await isManagedBy(current.realId, profileId))) {
    await setActingAs(profileId);
  } else {
    await createSession(profileId, HANDOFF_SESSION_DAYS);
  }
  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303, headers });
}
