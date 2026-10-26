import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";
import ShareLink from "@/components/ShareLink";
import { APP_NAME } from "@/lib/config";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getDashboardData();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/dashboard" className="text-lg font-extrabold tracking-tight">
            {APP_NAME}
            <span className="text-accent">.</span>
          </Link>
          <DashboardNav />
          <div className="ml-auto">
            <ShareLink username={profile.username} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
