import { eq } from "drizzle-orm";
import { db, profiles } from "@/db";

/** Serves a cover photo. URLs carry ?v=<version>, so responses can be cached forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const [row] = await db
    .select({ cover: profiles.cover, coverType: profiles.coverType })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (!row?.cover || !row.coverType) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(row.cover), {
    headers: {
      "Content-Type": row.coverType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
