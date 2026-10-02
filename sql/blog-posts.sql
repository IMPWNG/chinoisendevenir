-- AI-generated blog articles (merged with src/lib/blog/posts.ts on the public site).
-- Safe to run more than once. The app uses the service role (bypasses RLS).

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  published_at date not null,
  live boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by text
);

create index if not exists blog_posts_live_idx
  on public.blog_posts (live, published_at desc);

alter table public.blog_posts enable row level security;

revoke all on public.blog_posts from anon;
revoke all on public.blog_posts from authenticated;
grant select, insert, update, delete on public.blog_posts to service_role;
