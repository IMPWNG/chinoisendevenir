-- Retrait du fil « WhatsApp reçu ». Le fil revient si un message plus récent arrive.
-- Run in the Supabase SQL editor. Safe to re-run.

create table if not exists public.whatsapp_inbox_dismissals (
  contact_id text primary key,
  message_at timestamptz not null,
  dismissed_at timestamptz not null default now()
);

alter table public.whatsapp_inbox_dismissals enable row level security;

grant select, insert, update, delete on public.whatsapp_inbox_dismissals to service_role;
revoke all on public.whatsapp_inbox_dismissals from anon, authenticated;

comment on table public.whatsapp_inbox_dismissals is
  'Dernier message WhatsApp retiré du fil admin. Un message plus récent fait revenir le fil.';
