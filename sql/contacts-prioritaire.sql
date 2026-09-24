-- Suivi prioritaire: flag on the contact, independent of suivi_statut.
-- Several rows can be true at once. Run in the Supabase SQL editor. Safe to re-run.

alter table public.contacts
  add column if not exists prioritaire boolean not null default false;

comment on column public.contacts.prioritaire is
  'Suivi prioritaire : plusieurs dossiers peuvent être marqués, sans changer le statut CRM';
