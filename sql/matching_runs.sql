-- Matching runs: full student–university analysis saved per contact.
-- Safe to run more than once. The app uses the service role (bypasses RLS).

create table if not exists public.matching_runs (
  id uuid primary key default gen_random_uuid(),
  contact_id text not null,
  created_at timestamptz not null default now(),
  created_by text,
  recommended_formula integer,
  top_university text,
  top_score integer,
  client_message text,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists matching_runs_contact_idx
  on public.matching_runs (contact_id, created_at desc);

alter table public.matching_runs enable row level security;

revoke all on public.matching_runs from anon;
grant select, insert, update, delete on public.matching_runs to service_role;
