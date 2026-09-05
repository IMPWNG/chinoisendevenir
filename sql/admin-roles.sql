-- Additive: limited admin role. Run after sql/admin-security.sql.
-- Limited admins can manage students, but not universities.

alter table public.admin_users
  add column if not exists role text not null default 'full';

alter table public.admin_users
  drop constraint if exists admin_users_role_check;

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('full', 'limited'));

create or replace function public.is_full_admin()
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
      and role = 'full'
  );
$$;

revoke all on function public.is_full_admin() from public;
revoke all on function public.is_full_admin() from anon;
grant execute on function public.is_full_admin() to authenticated;

drop policy if exists "admins manage universities" on public.universities;
drop policy if exists "full admins manage universities" on public.universities;

create policy "full admins manage universities"
  on public.universities
  for all
  to authenticated
  using (public.is_full_admin())
  with check (public.is_full_admin());

drop policy if exists "admins manage contacts" on public.contacts;
drop policy if exists "admins read contacts" on public.contacts;
drop policy if exists "admins insert contacts" on public.contacts;
drop policy if exists "admins update contacts" on public.contacts;
drop policy if exists "full admins delete contacts" on public.contacts;

create policy "admins read contacts"
  on public.contacts
  for select
  to authenticated
  using (public.is_admin());

create policy "admins insert contacts"
  on public.contacts
  for insert
  to authenticated
  with check (public.is_admin());

create policy "admins update contacts"
  on public.contacts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "full admins delete contacts"
  on public.contacts
  for delete
  to authenticated
  using (public.is_full_admin());

-- Grant limited access:
-- insert into public.admin_users (user_id, email, role)
-- values ('PASTE-UUID', 'associate@email.com', 'limited')
-- on conflict (user_id) do update
--   set email = excluded.email, role = excluded.role;
