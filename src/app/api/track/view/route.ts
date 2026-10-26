import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  await supabase.rpc("record_view", {
    p_username: body.username,
    p_referrer: typeof body.referrer === "string" ? body.referrer : null,
  });
  return new NextResponse(null, { status: 204 });
}
