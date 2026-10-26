import { redirect } from "next/navigation";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <Suspense>
      <AuthForm mode="login" inviteRequired={false} />
    </Suspense>
  );
}
