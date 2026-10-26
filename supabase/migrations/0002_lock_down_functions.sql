-- Supabase's default privileges grant EXECUTE to anon/authenticated directly,
-- so revoking from PUBLIC alone isn't enough.

-- Trigger-only; must not be callable through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Reporting is for signed-in owners only.
revoke execute on function public.analytics_daily(integer) from anon;
revoke execute on function public.analytics_links(integer) from anon;

-- record_view / record_click stay callable by anon on purpose: visitors aren't signed in.
