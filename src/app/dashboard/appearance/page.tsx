import AppearanceEditor from "@/components/AppearanceEditor";
import { getDashboardData } from "@/lib/dashboard-data";
import { resolveTheme } from "@/lib/themes";

export const metadata = { title: "Appearance" };

export default async function AppearancePage() {
  const { profile, links, socials } = await getDashboardData();
  return (
    <AppearanceEditor
      username={profile.username}
      initialProfile={{
        displayName: profile.displayName ?? "",
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl,
      }}
      initialTheme={resolveTheme(profile.theme)}
      initialSocials={socials}
      links={links.filter((l) => l.isActive)}
    />
  );
}
