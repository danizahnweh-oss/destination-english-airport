-- ============================================================
-- Destination English — Supabase setup
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- 1) One table holds every answer of every group, one row per field.
create table if not exists public.entries (
  group_id   text not null,
  field_key  text not null,
  value      text,
  updated_at timestamptz not null default now(),
  primary key (group_id, field_key)
);

-- 2) Turn on Row Level Security and allow the public (anon) key to
--    read & write. This is a low-stakes classroom app with no personal
--    data, so open access by group code is acceptable.
alter table public.entries enable row level security;

drop policy if exists "anon read entries"   on public.entries;
drop policy if exists "anon insert entries" on public.entries;
drop policy if exists "anon update entries" on public.entries;

create policy "anon read entries"
  on public.entries for select
  to anon, authenticated
  using (true);

create policy "anon insert entries"
  on public.entries for insert
  to anon, authenticated
  with check (true);

create policy "anon update entries"
  on public.entries for update
  to anon, authenticated
  using (true) with check (true);

-- 3) Broadcast row changes over Realtime so all devices update live.
alter publication supabase_realtime add table public.entries;

-- Done. Now copy your Project URL + anon key into assets/config.js
-- ============================================================
