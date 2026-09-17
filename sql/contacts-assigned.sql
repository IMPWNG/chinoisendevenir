-- Manual dossier assignment (admin checkbox).
-- Run in Supabase SQL editor. Safe to re-run.
-- Replaces automatic last_touched / closed_by attribution.

alter table public.contacts
  add column if not exists assigned_to text,
  add column if not exists assigned_at timestamptz;

create index if not exists contacts_assigned_to_idx
  on public.contacts (lower(assigned_to));

comment on column public.contacts.assigned_to is
  'Email admin responsable du dossier (case à cocher manuelle)';
comment on column public.contacts.assigned_at is
  'Horodatage de l''attribution manuelle';
