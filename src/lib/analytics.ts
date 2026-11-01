import { and, count, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db, events, links, users } from "@/db";
import { getCurrentUser } from "@/lib/auth";

/** The page's owner, or the admin who runs it for a customer, looking at their own page. */
async function viewerOwns(profileId: string) {
  const viewer = await getCurrentUser();
  if (!viewer) return false;
  if (viewer.id === profileId || viewer.realId === profileId) return true;
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, profileId), eq(users.managedBy, viewer.realId)))
    .limit(1);
  return !!row;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Records a page view unless the viewer owns the page. */
export async function recordView(profileId: string, referrer: string | null) {
  if (await viewerOwns(profileId)) return;
  await db.insert(events).values({ profileId, type: "view", referrer: referrer?.slice(0, 500) ?? null });
}

/** Records a click (unless the owner clicked) and returns the link's URL, or null if it's gone or hidden. */
export async function recordClick(linkId: string, referrer: string | null) {
  const [link] = await db
    .select({ url: links.url, userId: links.userId })
    .from(links)
    .where(and(eq(links.id, linkId), eq(links.isActive, true)))
    .limit(1);
  if (!link) return null;

  if (!(await viewerOwns(link.userId))) {
    await db
      .insert(events)
      .values({ profileId: link.userId, linkId, type: "click", referrer: referrer?.slice(0, 500) ?? null });
  }
  return link.url;
}

/** Daily views and clicks (UTC days) for the last `days` days, oldest first, with empty days filled in. */
export async function dailyActivity(profileId: string, days: number) {
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  const start = new Date(today - (days - 1) * DAY_MS);
  const day = sql<string>`strftime('%Y-%m-%d', ${events.createdAt} / 1000, 'unixepoch')`;

  const rows = await db
    .select({
      day,
      views: sql<number>`sum(case when ${events.type} = 'view' then 1 else 0 end)`,
      clicks: sql<number>`sum(case when ${events.type} = 'click' then 1 else 0 end)`,
    })
    .from(events)
    .where(and(eq(events.profileId, profileId), gte(events.createdAt, start)))
    .groupBy(day);

  const byDay = new Map(rows.map((r) => [r.day, r]));
  return Array.from({ length: days }, (_, i) => {
    const key = new Date(start.getTime() + i * DAY_MS).toISOString().slice(0, 10);
    const row = byDay.get(key);
    return { day: key, views: Number(row?.views ?? 0), clicks: Number(row?.clicks ?? 0) };
  });
}

/** Clicks per link id over the last `days` days. */
export async function clicksPerLink(profileId: string, days: number) {
  const rows = await db
    .select({ linkId: events.linkId, clicks: count() })
    .from(events)
    .where(
      and(
        eq(events.profileId, profileId),
        eq(events.type, "click"),
        isNotNull(events.linkId),
        gte(events.createdAt, new Date(Date.now() - days * DAY_MS)),
      ),
    )
    .groupBy(events.linkId);
  return new Map(rows.map((r) => [r.linkId as string, r.clicks]));
}
