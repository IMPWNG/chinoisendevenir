-- The lead form stores a free-text field when the student picks "Autre".
-- contacts_domaine_etudes_check only allowed the fixed dropdown list, so those
-- submissions failed with 23514 and never created a contact.

alter table public.contacts
  drop constraint if exists contacts_domaine_etudes_check;
