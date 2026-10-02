-- File d'envoi automatique (email ou WhatsApp), 5 messages / heure.
-- À lancer dans l'éditeur SQL Supabase. Idempotent.
-- Écrit uniquement par la service role (API admin + cron). Pas d'accès navigateur.

create table if not exists public.outbound_drip (
  id uuid primary key default gen_random_uuid(),
  contact_id text not null,
  channel text not null,
  subject text,
  title text,
  subtitle text,
  body text not null,
  status text not null default 'pending',
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  error text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'outbound_drip_channel_ok'
      and conrelid = 'public.outbound_drip'::regclass
  ) then
    alter table public.outbound_drip
      add constraint outbound_drip_channel_ok
      check (channel in ('email', 'whatsapp'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'outbound_drip_status_ok'
      and conrelid = 'public.outbound_drip'::regclass
  ) then
    alter table public.outbound_drip
      add constraint outbound_drip_status_ok
      check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled'));
  end if;
end $$;

create index if not exists outbound_drip_pending_idx
  on public.outbound_drip (scheduled_at)
  where status = 'pending';

create index if not exists outbound_drip_sent_at_idx
  on public.outbound_drip (sent_at desc)
  where status = 'sent';

create index if not exists outbound_drip_attempt_idx
  on public.outbound_drip (updated_at desc)
  where status in ('sent', 'failed');

alter table public.outbound_drip enable row level security;

revoke all on public.outbound_drip from anon, authenticated;
grant all on public.outbound_drip to service_role;

comment on table public.outbound_drip is
  'File d''envoi automatique admin : 5 emails ou WhatsApp par heure, vidée par le cron.';
