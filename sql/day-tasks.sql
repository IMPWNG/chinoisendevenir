-- Tâches du jour (admin ou GrokBot). Un dossier, un jour, une source.
-- Run in the Supabase SQL editor. Safe to re-run.

create table if not exists public.day_tasks (
  id uuid primary key default gen_random_uuid(),
  contact_id text not null,
  day date not null,
  task text not null,
  source text not null default 'admin',
  done boolean not null default false,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'day_tasks_source_ok'
      and conrelid = 'public.day_tasks'::regclass
  ) then
    alter table public.day_tasks
      add constraint day_tasks_source_ok
      check (source in ('admin', 'grokbot'));
  end if;
end $$;

create unique index if not exists day_tasks_contact_day_source_uidx
  on public.day_tasks (contact_id, day, source);

create index if not exists day_tasks_day_idx
  on public.day_tasks (day);

alter table public.day_tasks enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    raise notice 'public.is_admin() absente — exécutez aussi sql/admin-security.sql';
    return;
  end if;

  execute 'drop policy if exists "admins manage day_tasks" on public.day_tasks';
  execute $pol$
    create policy "admins manage day_tasks"
      on public.day_tasks
      for all
      to authenticated
      using (public.is_admin())
      with check (public.is_admin())
  $pol$;
end $$;

grant select, insert, update, delete on public.day_tasks to authenticated;
revoke all on public.day_tasks from anon;

comment on table public.day_tasks is
  'Tâche du jour liée à un dossier. source admin = fiche, grokbot = compte rendu.';
