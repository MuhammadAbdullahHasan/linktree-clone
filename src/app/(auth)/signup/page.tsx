import { redirect } from "next/navigation";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <Suspense>
      <AuthForm mode="signup" inviteRequired={Boolean(process.env.INVITE_CODE)} />
    </Suspense>
  );
}
