BEGIN;

ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_suivi_statut_check;

ALTER TABLE contacts
  ADD CONSTRAINT contacts_suivi_statut_check CHECK (
    suivi_statut IN (
      'mail_bienvenue_envoyé',
      'relance_1_envoyée',
      'relance_2_envoyée',
      'choix_des_formules',
      'formule_choisie',
      'prospect_à_qualifier',
      'offre_envoyée',
      'attente_paiement',
      'client_payé',
      'appel_réservé',
      'dossier_préparation',
      'candidature_envoyée',
      'admission_reçue',
      'dossier_terminé',
      'nouveau',
      'contact_pris',
      'en_cours',
      'serieux',
      'qualifie',
      'inscrit',
      'perdu',
      'nouveau_prospect'
    )
  );

COMMIT;
