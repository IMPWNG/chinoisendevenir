-- University database for partner schools + future matching algorithm.
-- Run this once in the Supabase SQL editor.

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name_zh text not null unique,
  name_en text,
  name_fr text,
  slug text unique,
  city text,
  province text,
  country text not null default 'Chine',
  department text,
  emails text[] not null default '{}',
  phone text,
  wechat text,
  website text,
  last_contact_at date,
  last_contact_note text,
  reply_status text check (reply_status is null or reply_status in ('replied', 'no_reply', 'pending')),
  notes text,
  is_partner boolean not null default true,
  is_active boolean not null default true,
  majors text[] not null default '{}',
  required_documents text[] not null default '{}',
  scholarship_amount text,
  scholarship_min numeric,
  scholarship_max numeric,
  min_hsk_level integer,
  language_requirements text,
  tuition_min numeric,
  tuition_max numeric,
  application_deadline text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists universities_city_idx on public.universities (city);
create index if not exists universities_province_idx on public.universities (province);
create index if not exists universities_active_idx on public.universities (is_active);
create index if not exists universities_majors_idx on public.universities using gin (majors);

-- RLS policies live in sql/admin-security.sql (admins only).
-- Do not grant this table to every logged-in user.
alter table public.universities enable row level security;
