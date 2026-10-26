import Link from "next/link";
import ClaimUsername from "@/components/ClaimUsername";
import ProfilePage from "@/components/ProfilePage";
import { APP_NAME } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { THEME_PRESETS } from "@/lib/themes";
import type { PageData } from "@/lib/types";

const DEMO: PageData = {
  username: "maya.creates",
  displayName: "Maya Okafor",
  bio: "Ceramicist & weekend baker. New pieces every first Friday.",
  avatarUrl: null,
  theme: THEME_PRESETS.find((p) => p.id === "sunset")!.theme,
  links: [
    { id: "1", title: "Shop the new collection", url: "#" },
    { id: "2", title: "Studio workshop tickets", url: "#" },
    { id: "3", title: "Watch: throwing a vase in 60s", url: "#" },
  ],
  socials: [
    { id: "a", platform: "instagram", url: "#" },
    { id: "b", platform: "tiktok", url: "#" },
    { id: "c", platform: "youtube", url: "#" },
  ],
};

const FEATURES = [
  { title: "One link, everything", body: "Put every link, shop, video and social profile behind a single address." },
  { title: "Make it yours", body: "Themes, gradients, button styles and fonts. See every change live as you edit." },
  { title: "Know what works", body: "See page views and clicks per link, day by day, so you know what people want." },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5">
        <span className="text-xl font-extrabold tracking-tight">
          {APP_NAME}
          <span className="text-accent">.</span>
        </span>
        <nav className="ml-auto flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn hover:bg-neutral-200/70">Log in</Link>
              <Link href="/signup" className="btn-primary">Sign up free</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-20 lg:grid-cols-[1fr_340px] lg:pt-16">
          <div>
            <h1 className="max-w-2xl text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
              Everything you do, <span className="text-accent">one link</span> away.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-600">
              Build a page for all your links in a minute. Share it in your bio, your email signature, or anywhere
              people find you.
            </p>
            <div className="mt-8 max-w-md">
              <ClaimUsername />
            </div>
          </div>

          <div className="mx-auto w-[300px] rotate-2">
            <div className="h-[560px] overflow-hidden rounded-[44px] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl">
              <div className="pointer-events-none h-full overflow-hidden rounded-[34px]" aria-hidden>
                <ProfilePage data={DEMO} preview />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <h2 className="text-lg font-bold">{f.title}</h2>
                <p className="mt-2 text-neutral-600">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500">
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
