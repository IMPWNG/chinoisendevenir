-- Allow both legacy and canonical suivi_statut values.
-- The public form was writing "bienvenue_envoyé", which the old CHECK rejected.

alter table public.contacts drop constraint if exists contacts_suivi_statut_check;

alter table public.contacts
  add constraint contacts_suivi_statut_check
  check (
    suivi_statut is null
    or suivi_statut in (
      'nouveau',
      'nouveau_prospect',
      'mail_bienvenue_envoyé',
      'bienvenue_envoyé',
      'prospect_à_qualifier',
      'a_qualifier',
      'appel_réservé',
      'choix_des_formules',
      'formules_présentées',
      'formule_choisie',
      'offre_envoyée',
      'relance_1_envoyée',
      'relance_2_envoyée',
      'relance_en_cours',
      'attente_paiement',
      'client_payé',
      'dossier_préparation',
      'dossier_incomplet',
      'candidature_envoyée',
      'admission_reçue',
      'visa_préparation',
      'arrive_chine',
      'dossier_terminé',
      'prospect_perdu'
    )
  );
