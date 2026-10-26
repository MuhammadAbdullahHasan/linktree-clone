# Linkfolio

A Linktree-style "link in bio" app for a small group of people. Each person signs up with an invite code,
claims `yoursite.com/username`, adds links and social icons, styles their page, and sees views and clicks.

Built with Next.js 15 (App Router, TypeScript), Tailwind CSS v4, and SQLite via Drizzle ORM. No outside
services are needed to run it locally.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then set INVITE_CODE
npm run db:migrate           # creates data/linkfolio.db
npm run dev                  # http://localhost:3000
```

All data lives in `data/linkfolio.db`, a single file. Back it up by copying it. `npm run db:studio` opens a
browser view of the tables.

## Put it online (Vercel + Turso)

Vercel can't keep a database file, so the online copy uses [Turso](https://turso.tech), which hosts the
same kind of SQLite database (free tier).

1. Create a Turso database and copy its URL (`libsql://...`) and an auth token.
2. Create the tables in it:
   `DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:migrate`
3. Import the GitHub repo in Vercel and set these environment variables:
   `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `INVITE_CODE`, and `NEXT_PUBLIC_SITE_URL` (your Vercel address).

## How accounts and security work

- Passwords are hashed with scrypt; the plain password is never stored.
- Sign-in creates a random session token in an httpOnly cookie. The database stores only its SHA-256
  hash, so a leaked database can't be used to log in. Sessions last 30 days and extend while in use.
- Repeated wrong passwords are blocked for 15 minutes (10 per account, 30 per IP address).
- Sign-up needs `INVITE_CODE` when it's set. Leave it empty to allow anyone to sign up.
- Every write in `src/app/dashboard/actions.ts` is scoped to the signed-in user's id, so people can only
  change their own pages.
- There is no email sending, so there's no "forgot password". To reset someone's password, delete their
  row in `users` (with `npm run db:studio`) and let them sign up again.

## Where things live

| Path | What it is |
| --- | --- |
| `src/db/schema.ts` | Database tables; run `npm run db:generate` after changing it, then `npm run db:migrate` |
| `src/lib/auth.ts` | Password hashing, sessions, rate limiting |
| `src/app/(auth)/actions.ts` | Sign up, sign in, sign out |
| `src/app/dashboard/actions.ts` | Everything the dashboard saves |
| `src/app/[username]` | Public profile page |
| `src/app/go/[linkId]` | Counts a click, then redirects to the link |
| `src/app/avatar/[userId]` | Serves profile photos (stored in the database, resized in the browser first) |
| `src/components/ProfilePage.tsx` | Renders a profile; shared by the public page and the live preview |
| `src/lib/themes.ts`, `src/lib/socials.tsx` | Theme presets and supported social platforms |
| `src/lib/config.ts` | App name |
