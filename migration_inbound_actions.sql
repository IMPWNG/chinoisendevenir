BEGIN;

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS formule text;

ALTER TABLE suivi_actions
  DROP CONSTRAINT IF EXISTS suivi_actions_action_check;

ALTER TABLE suivi_actions
  ADD CONSTRAINT suivi_actions_action_check CHECK (
    action IN (
      'appel',
      'appel_effectue',
      'email_envoye',
      'email_formules',
      'relance',
      'relance_1',
      'relance_2',
      'qualification',
      'changement_statut',
      'note_ajoutee',
      'contact_appele',
      'document_envoye',
      'rendez_vous_fixe',
      'paiement_recu',
      'inscription_effectuee',
      'contact_modifier',
      'dossier_complet',
      'reponse_client',
      'formule_choisie'
    )
  );

COMMIT;
