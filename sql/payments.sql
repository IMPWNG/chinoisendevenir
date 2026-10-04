-- Airwallex payments: plans, installments, intents, webhook events.
-- Run by hand in the Supabase SQL editor. Safe to re-run. Do not apply from the app.
--
-- The browser never reads these tables. API routes use the service role, which
-- bypasses RLS (same pattern as matching_runs / contacts written from the server).

create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  contact_id text not null,
  formule text not null,
  currency text not null default 'EUR',
  total_cents integer not null check (total_cents > 0),
  mode text not null check (mode in ('full', 'installments')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists payment_plans_contact_uidx
  on public.payment_plans (contact_id);

create table if not exists public.payment_installments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.payment_plans (id) on delete cascade,
  contact_id text not null,
  sequence integer not null check (sequence >= 1),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'EUR',
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, sequence)
);

create index if not exists payment_installments_contact_idx
  on public.payment_installments (contact_id, sequence);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  installment_id uuid not null references public.payment_installments (id) on delete cascade,
  request_id text not null unique,
  merchant_order_id text not null unique,
  airwallex_intent_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists payment_intents_installment_idx
  on public.payment_intents (installment_id, created_at desc);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  airwallex_event_id text not null unique,
  name text not null,
  contact_id text,
  plan_id uuid,
  installment_id uuid references public.payment_installments (id) on delete set null,
  intent_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payment_events_contact_idx
  on public.payment_events (contact_id, created_at desc);

alter table public.payment_plans enable row level security;
alter table public.payment_installments enable row level security;
alter table public.payment_intents enable row level security;
alter table public.payment_events enable row level security;

revoke all on public.payment_plans from public, anon, authenticated;
revoke all on public.payment_installments from public, anon, authenticated;
revoke all on public.payment_intents from public, anon, authenticated;
revoke all on public.payment_events from public, anon, authenticated;

grant select, insert, update, delete on public.payment_plans to service_role;
grant select, insert, update, delete on public.payment_installments to service_role;
grant select, insert, update, delete on public.payment_intents to service_role;
grant select, insert, update, delete on public.payment_events to service_role;

comment on table public.payment_plans is
  'Un échéancier par dossier. full = un seul versement (le total). installments = plusieurs lignes.';
comment on table public.payment_installments is
  'Versement : montant, ordre, statut. L''accès s''ouvre au premier versement payé (séquence 1) ou quand tout est payé.';
comment on table public.payment_events is
  'Journal idempotent des webhooks Airwallex (airwallex_event_id unique). Pas de double crédit.';
