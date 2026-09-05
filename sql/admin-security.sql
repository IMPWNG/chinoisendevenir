-- =============================================================================
-- Admin security: only YOU can grant access. Run this in the Supabase SQL editor.
--
-- What this does:
-- 1. Creates public.admin_users (the only list of people allowed in /admin)
-- 2. Locks contacts, suivi_actions, universities so only those people can read/write
-- 3. Keeps student-documents private (the app uses the server key, not the browser)
--
-- Students and the public form keep working: they go through API routes that use
-- the service role, which bypasses RLS.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Allowlist table — insert rows yourself, nobody can self-promote
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists admin_users_email_idx
  on public.admin_users (lower(email));

alter table public.admin_users enable row level security;

drop policy if exists "admins can read admin_users" on public.admin_users;

-- No insert/update/delete policies on purpose.
-- Adding an admin is only possible here in the SQL editor (or with the service role).

-- -----------------------------------------------------------------------------
-- 2) Helper used by RLS — runs as the function owner so it can read admin_users
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 3) Replace every existing policy on sensitive tables
-- -----------------------------------------------------------------------------
do $$
declare
  r record;
  t text;
begin
  foreach t in array array['contacts', 'suivi_actions', 'universities', 'admin_users']
  loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    for r in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', r.policyname, t);
    end loop;
  end loop;
end $$;

alter table public.contacts enable row level security;
alter table public.suivi_actions enable row level security;
alter table public.universities enable row level security;

create policy "admins manage contacts"
  on public.contacts
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins manage suivi_actions"
  on public.suivi_actions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins manage universities"
  on public.universities
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can read admin_users"
  on public.admin_users
  for select
  to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.contacts to authenticated;
grant select, insert, update, delete on public.suivi_actions to authenticated;
grant select, insert, update, delete on public.universities to authenticated;
grant select on public.admin_users to authenticated;

revoke all on public.contacts from anon;
revoke all on public.suivi_actions from anon;
revoke all on public.universities from anon;
revoke all on public.admin_users from anon;

-- -----------------------------------------------------------------------------
-- 4) Storage: student documents are not readable from the browser
--    (admin + student UIs already use /api/... with the service role)
-- -----------------------------------------------------------------------------
do $$
declare r record;
begin
  if to_regclass('storage.objects') is null then
    return;
  end if;
  for r in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        qual ilike '%student-documents%'
        or with_check ilike '%student-documents%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 5) Grant admin access — REPLACE the emails / UUIDs below
--
-- How to find a user id:
--   Authentication → Users → click the user → copy UUID
--   or run:
--     select id, email from auth.users order by created_at;
-- -----------------------------------------------------------------------------

-- insert into public.admin_users (user_id, email)
-- values
--   ('PASTE-YOUR-UUID', 'you@email.com'),
--   ('PASTE-ASSOCIATE-UUID', 'associate@email.com')
-- on conflict (user_id) do update set email = excluded.email;
--
-- For a limited admin (students only, no universities / matching / WhatsApp / bulk):
--   1) Run sql/admin-roles.sql
--   2) insert into public.admin_users (user_id, email, role)
--      values ('PASTE-UUID', 'associate@email.com', 'limited')
--      on conflict (user_id) do update
--        set email = excluded.email, role = excluded.role;
--   3) Optionally set ADMIN_LIMITED_EMAILS=associate@email.com

-- Optional extra lock on the Auth JWT (not required if admin_users is filled):
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where id in (
--   select user_id from public.admin_users
-- );
