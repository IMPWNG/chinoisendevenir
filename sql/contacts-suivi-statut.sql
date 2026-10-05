-- Allow both legacy and canonical suivi_statut values.
-- Old CHECK had 'perdu' / 'nouveau' / etc. and rejected 'prospect_perdu'.

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
      'contact_pris',
      'en_cours',
      'serieux',
      'qualifie',
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
      'inscrit',
      'perdu',
      'prospect_perdu'
    )
  );
