-- Brouillon du contrat de prestation, pour reprendre la saisie.
-- À lancer dans l'éditeur SQL Supabase. Idempotent.

alter table public.contacts
  add column if not exists contrat jsonb not null default '{}'::jsonb;

comment on column public.contacts.contrat is
  'Brouillon admin du contrat : identité, tuteurs, payeur, devise, copie admin.';
