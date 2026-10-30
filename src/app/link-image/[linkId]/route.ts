import { eq } from "drizzle-orm";
import { db, links } from "@/db";

/** Serves a link's stored preview image. URLs carry ?v=<checked time>, so responses can be cached forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ linkId: string }> }) {
  const { linkId } = await params;
  const [row] = await db
    .select({ data: links.imageData, type: links.imageType, isActive: links.isActive })
    .from(links)
    .where(eq(links.id, linkId))
    .limit(1);
  // Hidden links stay private, images included.
  if (!row?.data || !row.type || !row.isActive) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
