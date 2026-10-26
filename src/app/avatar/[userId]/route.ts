import { eq } from "drizzle-orm";
import { db, profiles } from "@/db";

/** Serves a profile photo. URLs carry ?v=<version>, so responses can be cached forever. */
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const [row] = await db
    .select({ avatar: profiles.avatar, avatarType: profiles.avatarType })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (!row?.avatar || !row.avatarType) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(row.avatar), {
    headers: {
      "Content-Type": row.avatarType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
