# Linkfolio

A Linktree-style "link in bio" app. Anyone can sign up, claim `yoursite.com/username`, add links and social
icons, style their page, and see views and clicks.

Built with Next.js 15 (App Router, TypeScript), Tailwind CSS v4 and Supabase (Postgres, Auth, Storage).

## Setup

1. Create a Supabase project, then run `supabase/migrations/0001_init.sql` in the SQL editor
   (or apply it with the Supabase CLI).
2. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key
   (Supabase → Project Settings → API).
3. In Supabase → Authentication → URL Configuration, set the Site URL to your site and add
   `http://localhost:3000/auth/callback` (plus your production `/auth/callback`) to Redirect URLs.
4. `npm install` then `npm run dev`, and open http://localhost:3000.

Optional: enable Google under Authentication → Providers, then set `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true`.

## Where things live

| Path | What it is |
| --- | --- |
| `src/app/[username]` | Public profile page |
| `src/app/go/[linkId]` | Counts a click, then redirects to the link |
| `src/app/dashboard` | Links editor, Appearance, Analytics, Settings, and all server actions (`actions.ts`) |
| `src/components/ProfilePage.tsx` | Renders a profile; shared by the public page and the live preview |
| `src/lib/themes.ts` | Theme presets and the theme schema |
| `src/lib/socials.tsx` | Supported social platforms |
| `src/lib/config.ts` | App name and site URL |
| `supabase/migrations` | Database schema, row-level security, analytics functions, avatar storage |

## Notes

- Row-level security means users can only change their own data. Analytics events are written only
  through the `record_view` / `record_click` database functions, and an owner's own visits aren't counted.
- Links must be `http(s)`, `mailto:` or `tel:`, which is enforced in both the app and the database.
- Adding a social platform: add it to `src/lib/socials.tsx` and to the `social_links.platform` check in a new migration.
