-- Suivi manuel des 3 échéances sur la fiche étudiant.
-- À lancer dans l'éditeur SQL Supabase. Idempotent.
-- Les admins (complet et restreint) écrivent via la session déjà autorisée sur contacts.

alter table public.contacts
  add column if not exists paiements jsonb not null default '{}'::jsonb;

comment on column public.contacts.paiements is
  'Suivi manuel des 3 échéances : {"e1":true,"e2":false,"e3":false}';
