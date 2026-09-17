-- Owner / attribution for admin team commissions.
-- last_touched_* : dernière personne admin ayant modifié le dossier
-- closed_by / closed_at : figé au premier passage en client_payé (primes)

alter table public.contacts
  add column if not exists last_touched_by text,
  add column if not exists last_touched_at timestamptz,
  add column if not exists closed_by text,
  add column if not exists closed_at timestamptz;

create index if not exists contacts_last_touched_by_idx
  on public.contacts (lower(last_touched_by));

create index if not exists contacts_closed_by_idx
  on public.contacts (lower(closed_by));

comment on column public.contacts.last_touched_by is
  'Email admin de la dernière personne ayant touché le contact';
comment on column public.contacts.last_touched_at is
  'Horodatage du dernier touché admin';
comment on column public.contacts.closed_by is
  'Email admin qui a passé le contact en client_payé (attribution prime, figé)';
comment on column public.contacts.closed_at is
  'Horodatage du passage en client_payé';
