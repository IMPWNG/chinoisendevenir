-- Student space unlock: flag on the contact, independent of suivi_statut.
-- Run in the Supabase SQL editor. Safe to re-run.

alter table public.contacts
  add column if not exists espace_debloque boolean not null default false;

comment on column public.contacts.espace_debloque is
  'Espace étudiant débloqué par l''admin, indépendant du statut CRM (client_payé)';

update public.contacts
set espace_debloque = true
where espace_debloque = false
  and suivi_statut in (
    'client_payé',
    'dossier_préparation',
    'dossier_incomplet',
    'candidature_envoyée',
    'admission_reçue',
    'visa_préparation',
    'arrive_chine',
    'dossier_terminé',
    'inscrit'
  );
