import Link from "next/link";
import DashboardNav from "@/components/DashboardNav";
import ShareLink from "@/components/ShareLink";
import { APP_NAME } from "@/lib/config";
import { switchProfile } from "@/app/dashboard/profiles/actions";
import { currentAdminId } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [{ profile }, user, adminId] = await Promise.all([getDashboardData(), getCurrentUser(), currentAdminId()]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/dashboard" className="text-lg font-extrabold tracking-tight">
            {APP_NAME}
            <span className="text-accent">.</span>
          </Link>
          <DashboardNav showProfiles={!!adminId} />
          <div className="ml-auto">
            <ShareLink username={profile.username} />
          </div>
        </div>
      </header>
      {user?.managed && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-sm text-amber-900">
            <span>
              Editing <strong>{profile.displayName || `@${profile.username}`}</strong>, a customer profile
            </span>
            {user.actingAs && (
              <form action={switchProfile.bind(null, null)} className="ml-auto">
                <button type="submit" className="font-semibold underline underline-offset-2 hover:no-underline">
                  Back to my profile
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
