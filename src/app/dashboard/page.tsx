import LinksManager from "@/components/LinksManager";
import { getDashboardData } from "@/lib/dashboard-data";
import { toPageData } from "@/lib/page-data";

export const metadata = { title: "Links" };

export default async function LinksPage() {
  const { profile, links, socials } = await getDashboardData();
  return <LinksManager initialLinks={links} page={toPageData(profile, [], socials)} />;
}
