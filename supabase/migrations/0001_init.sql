-- Linkfolio initial schema: profiles, links, social links, analytics events.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text check (char_length(display_name) <= 60),
  bio text check (char_length(bio) <= 160),
  avatar_url text check (char_length(avatar_url) <= 1024),
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  -- 3-30 chars, lowercase letters/digits/underscore/dot, no leading/trailing dot.
  constraint username_format check (
    username is null or username ~ '^[a-z0-9_][a-z0-9_.]{1,28}[a-z0-9_]$'
  ),
  -- Keep in sync with RESERVED_USERNAMES in src/lib/username.ts.
  constraint username_not_reserved check (
    username is null or username not in (
      'admin', 'api', 'app', 'auth', 'dashboard', 'go', 'help', 'login', 'logout',
      'onboarding', 'privacy', 'settings', 'signin', 'signout', 'signup', 'static',
      'support', 'terms', 'www', 'about', 'blog', 'pricing', 'root', 'favicon.ico',
      'robots.txt', 'sitemap.xml', '_next'
    )
  )
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  url text not null check (
    char_length(url) <= 2048 and url ~* '^(https?://|mailto:|tel:)'
  ),
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index links_user_position_idx on public.links (user_id, position);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in (
    'instagram', 'tiktok', 'youtube', 'x', 'facebook', 'linkedin', 'whatsapp',
    'telegram', 'threads', 'snapchat', 'pinterest', 'spotify', 'github',
    'discord', 'twitch', 'email', 'website'
  )),
  url text not null check (
    char_length(url) <= 2048 and url ~* '^(https?://|mailto:|tel:)'
  ),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, platform)
);

create index social_links_user_position_idx on public.social_links (user_id, position);

create table public.events (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  link_id uuid references public.links (id) on delete set null,
  type text not null check (type in ('view', 'click')),
  referrer text,
  created_at timestamptz not null default now()
);

create index events_profile_created_idx on public.events (profile_id, created_at desc);
create index events_link_idx on public.events (link_id);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.social_links enable row level security;
alter table public.events enable row level security;

create policy "Profiles are public" on public.profiles
  for select using (true);
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Active links are public, owners see all" on public.links
  for select using (is_active or (select auth.uid()) = user_id);
create policy "Users insert own links" on public.links
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own links" on public.links
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own links" on public.links
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Social links are public" on public.social_links
  for select using (true);
create policy "Users insert own social links" on public.social_links
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own social links" on public.social_links
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own social links" on public.social_links
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Events are written only through record_view/record_click below.
create policy "Users read own events" on public.events
  for select to authenticated using ((select auth.uid()) = profile_id);

grant select on public.profiles, public.links, public.social_links to anon, authenticated;
grant update (username, display_name, bio, avatar_url, theme) on public.profiles to authenticated;
grant insert, update, delete on public.links, public.social_links to authenticated;
grant select on public.events to authenticated;

-- ---------------------------------------------------------------------------
-- New user -> profile row
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 60)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Analytics: tracking (public) and reporting (owner only)
-- ---------------------------------------------------------------------------

-- Records a page view. Views by the page owner are ignored.
create function public.record_view(p_username text, p_referrer text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.events (profile_id, type, referrer)
  select p.id, 'view', left(p_referrer, 500)
  from public.profiles p
  where p.username = lower(p_username)
    and p.id is distinct from auth.uid();
end;
$$;

-- Records a click and returns the destination URL (null if the link is gone or hidden).
create function public.record_click(p_link_id uuid, p_referrer text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_user uuid;
begin
  select l.url, l.user_id into v_url, v_user
  from public.links l
  where l.id = p_link_id and l.is_active;

  if v_url is null then
    return null;
  end if;

  if v_user is distinct from auth.uid() then
    insert into public.events (profile_id, link_id, type, referrer)
    values (v_user, p_link_id, 'click', left(p_referrer, 500));
  end if;

  return v_url;
end;
$$;

-- Daily views/clicks for the signed-in user over the last p_days days (UTC).
create function public.analytics_daily(p_days integer)
returns table (day date, views bigint, clicks bigint)
language sql
stable
set search_path = ''
as $$
  with bounds as (
    select greatest(1, least(p_days, 365)) as n, (now() at time zone 'utc')::date as today
  )
  select
    d::date as day,
    count(e.id) filter (where e.type = 'view') as views,
    count(e.id) filter (where e.type = 'click') as clicks
  from bounds b
  cross join generate_series(b.today - (b.n - 1), b.today, interval '1 day') d
  left join public.events e
    on e.profile_id = auth.uid()
   and (e.created_at at time zone 'utc')::date = d::date
  group by d
  order by d;
$$;

-- Clicks per link for the signed-in user over the last p_days days.
create function public.analytics_links(p_days integer)
returns table (link_id uuid, clicks bigint)
language sql
stable
set search_path = ''
as $$
  select e.link_id, count(*) as clicks
  from public.events e
  where e.profile_id = auth.uid()
    and e.type = 'click'
    and e.link_id is not null
    and e.created_at >= now() - make_interval(days => greatest(1, least(p_days, 365)))
  group by e.link_id;
$$;

revoke execute on function public.record_view(text, text) from public;
revoke execute on function public.record_click(uuid, text) from public;
revoke execute on function public.analytics_daily(integer) from public;
revoke execute on function public.analytics_links(integer) from public;
grant execute on function public.record_view(text, text) to anon, authenticated;
grant execute on function public.record_click(uuid, text) to anon, authenticated;
grant execute on function public.analytics_daily(integer) to authenticated;
grant execute on function public.analytics_links(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Avatar storage: public read, owners write inside their own folder
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

create policy "Users read own avatar files" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users upload own avatar files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users update own avatar files" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete own avatar files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
