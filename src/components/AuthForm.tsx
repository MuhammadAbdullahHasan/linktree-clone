"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error") ? "That sign-in link didn't work. Please try again." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const claimed = searchParams.get("username");
  const afterSignup = claimed ? `/onboarding?username=${encodeURIComponent(claimed)}` : "/onboarding";
  const googleEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(afterSignup)}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.session) {
      router.replace(afterSignup);
      router.refresh();
    } else {
      setNotice(`We sent a confirmation link to ${email}. Open it to finish signing up.`);
    }
  }

  async function onGoogle() {
    const supabase = createClient();
    const next = mode === "signup" ? afterSignup : "/dashboard";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setError(error.message);
  }

  if (notice) {
    return (
      <div className="card p-6 text-center">
        <h1 className="text-xl font-bold">Check your inbox</h1>
        <p className="mt-2 text-sm text-neutral-600">{notice}</p>
      </div>
    );
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
            : "Free forever. Set up in under a minute."}
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
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && <p className="mt-1.5 text-xs text-neutral-500">At least 8 characters.</p>}
        </div>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200" /> OR <span className="h-px flex-1 bg-neutral-200" />
          </div>
          <button type="button" onClick={onGoogle} className="btn-secondary w-full py-3">
            Continue with Google
          </button>
        </>
      )}

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
