import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Counts a link click, then sends the visitor on to the link's URL. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  if (!UUID.test(linkId)) return NextResponse.redirect(new URL("/", request.url));

  const supabase = await createClient();
  const { data: url } = await supabase.rpc("record_click", {
    p_link_id: linkId,
    p_referrer: request.headers.get("referer"),
  });

  if (typeof url !== "string") return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.redirect(url, { status: 302 });
}
