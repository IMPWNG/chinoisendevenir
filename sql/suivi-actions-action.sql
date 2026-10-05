-- Allow WhatsApp (and other app actions) on the dossier history.

alter table public.suivi_actions drop constraint if exists suivi_actions_action_check;

alter table public.suivi_actions
  add constraint suivi_actions_action_check
  check (
    action = any (array[
      'appel',
      'appel_effectue',
      'email_envoye',
      'email_formules',
      'relance',
      'relance_1',
      'relance_2',
      'relance_formules',
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
      'formule_choisie',
      'whatsapp_envoye',
      'whatsapp_contact',
      'whatsapp_liste',
      'whatsapp_formules',
      'reponse_whatsapp',
      'matching',
      'matching_payload',
      'attribution'
    ]::text[])
  );
