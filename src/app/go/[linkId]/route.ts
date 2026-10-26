import { NextResponse, type NextRequest } from "next/server";
import { recordClick } from "@/lib/analytics";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Counts a link click, then sends the visitor on to the link's URL. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  if (!UUID.test(linkId)) return NextResponse.redirect(new URL("/", request.url));

  const url = await recordClick(linkId, request.headers.get("referer"));
  if (!url) return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.redirect(url, { status: 302 });
}
