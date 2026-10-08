-- Documents the admin asks each student to upload.
-- Run in the Supabase SQL editor. Safe to re-run.

alter table public.contacts
  add column if not exists documents_demandes jsonb not null default '[]'::jsonb;

comment on column public.contacts.documents_demandes is
  'Clés du catalogue cochées par l''admin. Seules ces pièces apparaissent dans l''espace étudiant.';
