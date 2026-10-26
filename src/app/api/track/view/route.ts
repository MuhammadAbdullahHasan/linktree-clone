import { NextResponse, type NextRequest } from "next/server";
import { recordView } from "@/lib/analytics";
import { profileByUsername } from "@/lib/profile-query";

export async function POST(request: NextRequest) {
  let body: { username?: unknown; referrer?: unknown };
  try {
    body = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof body.username !== "string" || body.username.length > 30) {
    return new NextResponse(null, { status: 400 });
  }

  const profile = await profileByUsername(body.username);
  if (profile) await recordView(profile.id, typeof body.referrer === "string" ? body.referrer : null);
  return new NextResponse(null, { status: 204 });
}
