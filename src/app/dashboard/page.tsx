import { and, eq, isNull } from "drizzle-orm";
import { after } from "next/server";
import LinksManager from "@/components/LinksManager";
import { db, links as linksTable } from "@/db";
import { refreshLinkImage } from "@/lib/link-preview";
import { getDashboardData } from "@/lib/dashboard-data";
import { toPageData } from "@/lib/page-data";

export const metadata = { title: "Links" };

export default async function LinksPage() {
  const { profile, links, socials } = await getDashboardData();

  // Links saved before preview images existed get theirs fetched in the background.
  after(async () => {
    const unchecked = await db
      .select({ id: linksTable.id, url: linksTable.url })
      .from(linksTable)
      .where(and(eq(linksTable.userId, profile.id), isNull(linksTable.imageCheckedAt)));
    await Promise.all(unchecked.map((l) => refreshLinkImage(l.id, l.url)));
  });
  return <LinksManager initialLinks={links} page={toPageData(profile, [], socials)} />;
}
