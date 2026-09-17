-- Contact email thread (sent + received) for admin inbox view.
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Inbound webhook + auto-reply write via service role (bypasses RLS).
-- Admins read/mark-read via browser (RLS + is_admin()).

create table if not exists public.contact_emails (
  id uuid primary key default gen_random_uuid(),
  contact_id text not null,
  direction text not null,
  subject text,
  body_text text not null default '',
  from_email text,
  to_email text,
  resend_id text,
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'contact_emails_direction_ok'
      and conrelid = 'public.contact_emails'::regclass
  ) then
    alter table public.contact_emails
      add constraint contact_emails_direction_ok
      check (direction in ('in', 'out'));
  end if;
end $$;

create index if not exists contact_emails_contact_sent_idx
  on public.contact_emails (contact_id, sent_at asc);

create index if not exists contact_emails_unread_idx
  on public.contact_emails (contact_id)
  where direction = 'in' and read_at is null;

create unique index if not exists contact_emails_resend_id_uidx
  on public.contact_emails (resend_id)
  where resend_id is not null;

alter table public.contact_emails enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    raise notice 'public.is_admin() absente — exécutez aussi sql/admin-security.sql';
    return;
  end if;

  execute 'drop policy if exists "admins manage contact_emails" on public.contact_emails';
  execute $pol$
    create policy "admins manage contact_emails"
      on public.contact_emails
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
  $pol$;
end $$;

grant select, insert, update, delete on public.contact_emails to authenticated;
revoke all on public.contact_emails from anon;

comment on table public.contact_emails is
  'Fil email admin/étudiant (envoyés out + reçus in via Resend)';
comment on column public.contact_emails.read_at is
  'Null = non lu (badge rouge). Rempli quand un admin ouvre la fiche.';
