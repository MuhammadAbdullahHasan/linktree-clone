"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setUsername } from "@/app/dashboard/actions";
import { siteHost } from "@/lib/config";

type Props = {
  initial: string;
  submitLabel: string;
  /** Where to go after saving; stays on the page when omitted. */
  redirectTo?: string;
};

export default function UsernameForm({ initial, submitLabel, redirectTo }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await setUsername(value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setValue(result.data);
      if (redirectTo) router.replace(redirectTo);
      else setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="label">Username</label>
        <div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
          <span className="pl-3.5 text-[15px] text-neutral-500">{siteHost()}/</span>
          <input
            id="username"
            required
            autoFocus
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            maxLength={30}
            className="w-full min-w-0 bg-transparent py-2.5 pr-3.5 text-[15px] outline-none"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toLowerCase().replace(/\s/g, ""));
              setSaved(false);
            }}
          />
        </div>
        {error && <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p>}
        {saved && <p className="mt-1.5 text-sm text-emerald-700">Saved.</p>}
      </div>
      <button type="submit" disabled={pending || value.length < 3} className="btn-primary w-full py-3">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
