import { signOut } from "@/app/(auth)/actions";
import UsernameForm from "@/components/UsernameForm";
import { getDashboardData } from "@/lib/dashboard-data";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { email, profile } = await getDashboardData();

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
          Signed in as <strong className="text-neutral-900">{email}</strong>
        </p>
        <form action={signOut} className="mt-5">
          <button type="submit" className="btn-secondary">Sign out</button>
        </form>
      </section>
    </div>
  );
}
