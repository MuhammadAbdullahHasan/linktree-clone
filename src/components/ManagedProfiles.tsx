"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProfile, deleteProfile, switchProfile } from "@/app/dashboard/profiles/actions";
import type { ManagedProfile } from "@/lib/admin";

type Own = { username: string; displayName: string | null; avatarUrl: string | null };

export default function ManagedProfiles({ host, own, profiles, activeId }: { host: string; own: Own; profiles: ManagedProfile[]; activeId: string | null }) {
  return (
    <div className="space-y-8">
      <NewProfileForm host={host} />
      <section className="space-y-3" aria-labelledby="list-h">
        <h2 id="list-h" className="text-sm font-semibold text-neutral-500">
          {profiles.length} customer {profiles.length === 1 ? "profile" : "profiles"}
        </h2>
        <ul className="card divide-y divide-neutral-200">
          <Row avatarUrl={own.avatarUrl} name={own.displayName} username={own.username} badge="Your profile" active={!activeId} switchTo={null} />
          {profiles.map((p) => (
            <Row key={p.id} id={p.id} avatarUrl={p.avatarUrl} name={p.displayName} username={p.username} active={p.id === activeId} switchTo={p.id} stats={p} />
          ))}
        </ul>
        {profiles.length === 0 && <p className="text-sm text-neutral-500">No customer profiles yet. Create the first one above.</p>}
      </section>
    </div>
  );
}

function NewProfileForm({ host }: { host: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createProfile({ username, displayName });
      if (!res.ok) { setError(res.error); return; }
      setUsername(""); setDisplayName("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <h2 className="text-lg font-bold">New customer profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="np-name" className="label">Name on the page</label>
          <input id="np-name" className="input" maxLength={60} placeholder="Chai Corner Café" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="np-user" className="label">Username</label>
          <div className="flex items-center rounded-xl border border-neutral-300 bg-white focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/15">
            <span className="pl-3.5 text-[15px] text-neutral-500">{host}/</span>
            <input
              id="np-user"
              required
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              maxLength={30}
              className="w-full min-w-0 bg-transparent py-2.5 pr-3.5 text-[15px] outline-none"
              placeholder="chaicorner"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
            />
          </div>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={pending || username.length < 3} className="btn-primary">
        {pending ? "Creating…" : "Create profile"}
      </button>
    </form>
  );
}

type RowProps = {
  id?: string;
  avatarUrl: string | null;
  name: string | null;
  username: string;
  badge?: string;
  active: boolean;
  switchTo: string | null;
  stats?: { views30d: number; clicks30d: number };
};

function Row({ id, avatarUrl, name, username, badge, active, switchTo, stats }: RowProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const remove = () => startTransition(async () => {
    const res = await deleteProfile(id!);
    if (!res.ok) setError(res.error);
    router.refresh();
  });

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- small same-origin avatar
          <img src={avatarUrl} alt="" className="size-11 flex-none rounded-full object-cover" />
        ) : (
          <span aria-hidden className="grid size-11 flex-none place-items-center rounded-full bg-neutral-200 font-semibold text-neutral-600 uppercase">
            {(name || username || "?").charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate font-semibold">
            <span className="truncate">{name || `@${username}`}</span>
            {badge && <span className="flex-none rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{badge}</span>}
            {active && <span className="flex-none rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">Open now</span>}
          </p>
          <p className="truncate text-sm text-neutral-500">
            @{username}
            {stats && <> · {stats.views30d} views · {stats.clicks30d} clicks <span className="text-neutral-400">(30 days)</span></>}
          </p>
        </div>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-700">Delete @{username} and all its links?</span>
          <button type="button" onClick={remove} disabled={pending} className="btn bg-red-600 text-white hover:bg-red-700">{pending ? "Deleting…" : "Delete"}</button>
          <button type="button" onClick={() => setConfirming(false)} className="btn-secondary">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <a href={`/${username}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">View page</a>
          {!active && (
            <form action={switchProfile.bind(null, switchTo)}>
              <button type="submit" className="btn-primary">{switchTo ? "Edit" : "Back to mine"}</button>
            </form>
          )}
          {id && <button type="button" onClick={() => setConfirming(true)} className="btn-secondary text-red-600">Delete</button>}
        </div>
      )}
      {error && <p role="alert" className="w-full text-sm text-red-600">{error}</p>}
    </li>
  );
}
