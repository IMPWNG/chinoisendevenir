-- Appointments (admin calendar) + AI email drafts waiting for review.
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Admins read/write via the browser (RLS + is_admin()).
-- Inbound email analysis uses the service role (bypasses RLS).

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  contact_id text not null,
  title text not null default 'Appel téléphonique',
  kind text not null default 'appel',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed',
  notes text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_time_ok'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_time_ok check (ends_at > starts_at);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_kind_ok'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_kind_ok
      check (kind in ('appel', 'visio', 'autre'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_status_ok'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_status_ok
      check (status in ('proposed', 'confirmed', 'cancelled'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_source_ok'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_source_ok
      check (source in ('manual', 'ai_offer', 'ai_reply'));
  end if;
end $$;

create index if not exists appointments_starts_at_idx
  on public.appointments (starts_at);

create index if not exists appointments_range_idx
  on public.appointments (starts_at, ends_at)
  where status <> 'cancelled';

create index if not exists appointments_contact_idx
  on public.appointments (contact_id, starts_at desc);

create table if not exists public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  contact_id text not null,
  appointment_id uuid,
  kind text not null default 'confirmation',
  subject text not null default '',
  title text not null default '',
  subtitle text not null default '',
  body text not null default '',
  inbound_excerpt text,
  analysis jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'email_drafts_appointment_fkey'
      and conrelid = 'public.email_drafts'::regclass
  ) then
    alter table public.email_drafts
      add constraint email_drafts_appointment_fkey
      foreign key (appointment_id)
      references public.appointments(id)
      on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'email_drafts_kind_ok'
      and conrelid = 'public.email_drafts'::regclass
  ) then
    alter table public.email_drafts
      add constraint email_drafts_kind_ok
      check (kind in ('offer', 'confirmation', 'reschedule'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'email_drafts_status_ok'
      and conrelid = 'public.email_drafts'::regclass
  ) then
    alter table public.email_drafts
      add constraint email_drafts_status_ok
      check (status in ('pending', 'sent', 'discarded'));
  end if;
end $$;

create index if not exists email_drafts_contact_idx
  on public.email_drafts (contact_id, created_at desc);

create index if not exists email_drafts_pending_idx
  on public.email_drafts (contact_id, created_at desc)
  where status = 'pending';

create index if not exists email_drafts_appointment_idx
  on public.email_drafts (appointment_id);

alter table public.appointments enable row level security;
alter table public.email_drafts enable row level security;

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

  execute 'drop policy if exists "admins manage appointments" on public.appointments';
  execute $pol$
    create policy "admins manage appointments"
      on public.appointments
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
  $pol$;

  execute 'drop policy if exists "admins manage email_drafts" on public.email_drafts';
  execute $pol$
    create policy "admins manage email_drafts"
      on public.email_drafts
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
  $pol$;
end $$;

grant select, insert, update, delete on public.appointments to authenticated;
grant select, insert, update, delete on public.email_drafts to authenticated;
revoke all on public.appointments from anon;
revoke all on public.email_drafts from anon;
