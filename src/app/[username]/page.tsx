import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProfilePage from "@/components/ProfilePage";
import ViewTracker from "@/components/ViewTracker";
import { APP_NAME } from "@/lib/config";
import { getPublicPage } from "@/lib/page-data";

type Params = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;
  const page = (await getPublicPage(decodeURIComponent(username)))?.page;
  if (!page) return { title: `Not found | ${APP_NAME}` };

  const title = page.displayName ? `${page.displayName} (@${page.username})` : `@${page.username}`;
  const description = page.bio || `Links from @${page.username}`;
  return {
    title: `${title} | ${APP_NAME}`,
    description,
    openGraph: {
      title,
      description,
      images: page.avatarUrl ? [{ url: page.avatarUrl }] : undefined,
    },
    twitter: { card: "summary" },
  };
}

export default async function UsernamePage({ params }: Params) {
  const { username } = await params;
  const page = (await getPublicPage(decodeURIComponent(username)))?.page;
  if (!page) notFound();

  return (
    <>
      <ProfilePage data={page} />
      <ViewTracker username={page.username} />
    </>
  );
}
