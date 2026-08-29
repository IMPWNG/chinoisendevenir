-- Student auth / lookup indexes. Run in the Supabase SQL editor.
-- Safe to re-run.

do $$
begin
  if to_regclass('public.contacts') is not null then
    execute 'create index if not exists contacts_email_lower_idx on public.contacts (lower(email))';
  end if;

  if to_regclass('public.suivi_actions') is not null then
    execute 'create index if not exists suivi_actions_contact_id_idx on public.suivi_actions (contact_id)';
  end if;
end $$;

-- RLS helper: evaluate auth.uid() once per query, not per row
do $$
begin
  if to_regclass('public.admin_users') is null then
    return;
  end if;

  execute $fn$
    create or replace function public.is_admin()
    returns boolean
    language sql
    stable
    security definer
    set search_path = public
    as $body$
      select exists (
        select 1
        from public.admin_users
        where user_id = (select auth.uid())
      );
    $body$;
  $fn$;
end $$;
