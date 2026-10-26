import AppearanceEditor from "@/components/AppearanceEditor";
import { getDashboardData } from "@/lib/dashboard-data";
import { resolveTheme } from "@/lib/themes";

export const metadata = { title: "Appearance" };

export default async function AppearancePage() {
  const { profile, links, socials } = await getDashboardData();
  return (
    <AppearanceEditor
      userId={profile.id}
      username={profile.username}
      initialProfile={{
        displayName: profile.display_name ?? "",
        bio: profile.bio ?? "",
        avatarUrl: profile.avatar_url,
      }}
      initialTheme={resolveTheme(profile.theme)}
      initialSocials={socials}
      links={links.filter((l) => l.is_active)}
    />
  );
}
