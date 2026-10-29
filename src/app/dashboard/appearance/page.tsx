import AppearanceEditor from "@/components/AppearanceEditor";
import { getDashboardData } from "@/lib/dashboard-data";
import { resolveTheme } from "@/lib/themes";

export const metadata = { title: "Appearance" };

export default async function AppearancePage() {
  const { profile, links, socials } = await getDashboardData();
  return (
    <AppearanceEditor
      username={profile.username}
      verified={profile.verified}
      initialProfile={{
        displayName: profile.displayName ?? "",
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl,
        coverUrl: profile.coverUrl,
      }}
      initialTheme={resolveTheme(profile.theme)}
      initialSocials={socials}
      links={links.filter((l) => l.isActive)}
    />
  );
}
