import { signOut } from "@/app/(auth)/actions";
import UsernameForm from "@/components/UsernameForm";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [{ profile }, user] = await Promise.all([getDashboardData(), getCurrentUser()]);

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>

      <section className="card p-6">
        <h2 className="text-lg font-bold">Username</h2>
        <p className="mt-1 mb-5 text-sm text-neutral-600">
          Changing it changes your page address. Your old link will stop working.
        </p>
        <UsernameForm initial={profile.username} submitLabel="Save username" />
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-bold">Account</h2>
        <p className="mt-1 text-sm text-neutral-600">
          {user?.managed ? (
            <>This customer profile has no login of its own; it&apos;s managed from the admin account.</>
          ) : (
            <>Signed in as <strong className="text-neutral-900">{user?.realEmail}</strong></>
          )}
        </p>
        <form action={signOut} className="mt-5">
          <button type="submit" className="btn-secondary">Sign out</button>
        </form>
      </section>
    </div>
  );
}
