"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/app/(auth)/actions";

type Props = { mode: "login" | "signup"; inviteRequired: boolean };

export default function AuthForm({ mode, inviteRequired }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const claimed = searchParams.get("username");
  const afterSignup = claimed ? `/onboarding?username=${encodeURIComponent(claimed)}` : "/onboarding";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result =
      mode === "login" ? await signIn({ email, password }) : await signUp({ email, password, inviteCode });
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.replace(mode === "login" ? "/dashboard" : afterSignup);
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your page"}
      </h1>
      <p className="mt-2 text-neutral-600">
        {mode === "login"
          ? "Log in to manage your links."
          : claimed
            ? `Sign up to claim @${claimed}.`
            : "Set up your page in under a minute."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={mode === "signup" ? 8 : undefined}
            maxLength={200}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && <p className="mt-1.5 text-xs text-neutral-500">At least 8 characters.</p>}
        </div>
        {mode === "signup" && inviteRequired && (
          <div>
            <label htmlFor="invite" className="label">Invite code</label>
            <input
              id="invite"
              required
              autoComplete="off"
              className="input"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-600">
        {mode === "login" ? (
          <>No account yet? <Link href="/signup" className="font-semibold text-accent">Sign up</Link></>
        ) : (
          <>Already have an account? <Link href="/login" className="font-semibold text-accent">Log in</Link></>
        )}
      </p>
    </div>
  );
}
