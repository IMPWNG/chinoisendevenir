BEGIN;

-- Mapping retenu : les trois premiers statuts suivent leur progression métier.
-- appel_réservé reste le même statut ; son ordre change uniquement dans l'UI.
UPDATE contacts
SET suivi_statut = CASE suivi_statut
  WHEN 'nouveau_prospect' THEN 'mail_bienvenue_envoyé'
  WHEN 'informations_reçues' THEN 'choix_des_formules'
  WHEN 'profil_analyser' THEN 'formule_choisie'
  WHEN 'appel_réservé' THEN 'appel_réservé'
  ELSE suivi_statut
END
WHERE suivi_statut IN (
  'nouveau_prospect',
  'informations_reçues',
  'profil_analyser',
  'appel_réservé'
);

ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_suivi_statut_check;

ALTER TABLE contacts
  ADD CONSTRAINT contacts_suivi_statut_check CHECK (
    suivi_statut IN (
      'mail_bienvenue_envoyé',
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
      'perdu'
    )
  );

COMMIT;
