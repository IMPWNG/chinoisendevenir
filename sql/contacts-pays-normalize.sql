-- Normalize contact country spellings. Safe to re-run.
-- Prefer: npx tsx scripts/normalize-contact-countries.ts
-- This file covers the variants seen in the admin filter.

update public.contacts
set pays = 'République démocratique du Congo'
where lower(regexp_replace(pays, '[^[:alnum:]'' ]', '', 'g')) in (
  'drc', 'rdc', 'la rdc', 'rdc congo', 'rdcongo', 'rd congo'
)
or pays ilike '%démocratique du congo%'
or pays ilike '%democratique du congo%';

update public.contacts
set pays = 'République du Congo'
where pays ilike 'république du congo'
  and pays not ilike '%démocratique%'
  and pays not ilike '%democratique%';

update public.contacts set pays = 'Mali' where pays ilike 'le mali' or pays ilike 'mali';
update public.contacts set pays = 'Sénégal' where pays ilike 'senegal' or pays ilike 'sénégal';
update public.contacts set pays = 'Guinée' where pays ilike 'guinée%' or pays ilike 'guinee%';
update public.contacts set pays = 'Madagascar' where pays ilike 'madagascar';
update public.contacts set pays = 'Tchad' where pays ilike 'tchad';
update public.contacts set pays = 'Côte d''Ivoire' where pays ilike 'cote d%ivoire' or pays ilike 'côte d%ivoire';
update public.contacts set pays = 'République centrafricaine' where pays ilike 'république centrafricaine' or pays ilike 'republique centrafricaine';
update public.contacts set pays = 'Tanzanie' where pays ilike 'tanzanie' or pays ilike 'tanzania';
update public.contacts set pays = 'Haïti' where pays ilike 'haiti' or pays ilike 'haïti';
update public.contacts set pays = 'France' where pays ilike 'france';
update public.contacts set pays = 'Gabon' where pays ilike 'gabon';
update public.contacts set pays = 'Djibouti' where pays ilike 'djibouti';
update public.contacts set pays = 'Niger' where lower(pays) = 'niger';
update public.contacts set pays = 'Rwanda' where pays ilike 'rwanda';
update public.contacts set pays = 'Mauritanie' where pays ilike 'mauritanie';
