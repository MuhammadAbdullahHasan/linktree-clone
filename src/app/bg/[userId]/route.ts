import { eq } from "drizzle-orm";
import { db, profiles } from "@/db";

/** Serves a page background photo. URLs carry ?v=<version>, so responses can be cached forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const [row] = await db
    .select({ bgImage: profiles.bgImage, bgImageType: profiles.bgImageType })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (!row?.bgImage || !row.bgImageType) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(row.bgImage), {
    headers: {
      "Content-Type": row.bgImageType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
