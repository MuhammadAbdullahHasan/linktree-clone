import { notFound } from "next/navigation";
import ManagedProfiles from "@/components/ManagedProfiles";
import { currentAdminId, listManaged } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { siteHost } from "@/lib/config";
import { profileById } from "@/lib/profile-query";

export const metadata = { title: "Profiles" };

export default async function ProfilesPage() {
  const adminId = await currentAdminId();
  if (!adminId) notFound();
  const [user, own, managed] = await Promise.all([getCurrentUser(), profileById(adminId), listManaged(adminId)]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Profiles</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Customer pages you run for them. Customers don&apos;t get a login; open one here to edit its links and look.
        </p>
      </div>
      <ManagedProfiles
        host={siteHost()}
        own={{ username: own?.username ?? "", displayName: own?.displayName ?? null, avatarUrl: own?.avatarUrl ?? null }}
        profiles={managed}
        activeId={user?.actingAs ?? null}
      />
    </div>
  );
}
