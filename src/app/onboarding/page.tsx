import { redirect } from "next/navigation";
import UsernameForm from "@/components/UsernameForm";
import { APP_NAME } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Choose your username" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single();
  if (profile?.username) redirect("/dashboard");

  const { username } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col items-center px-4 py-10">
      <p className="text-xl font-extrabold tracking-tight">
        {APP_NAME}
        <span className="text-accent">.</span>
      </p>
      <div className="mt-12 w-full max-w-sm">
        <h1 className="text-3xl font-extrabold tracking-tight">Pick your username</h1>
        <p className="mt-2 text-neutral-600">This is the address people will visit. You can change it later.</p>
        <div className="mt-8">
          <UsernameForm initial={username ?? ""} submitLabel="Continue" redirectTo="/dashboard" />
        </div>
      </div>
    </div>
  );
}
