-- Chạy một lần trong Supabase SQL Editor của project MỚI.
-- CẢNH BÁO: Bất cứ ai có link web đều có thể đọc, thêm, sửa, xóa dữ liệu.
create table if not exists public.members (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) between 1 and 60),
 created_at timestamptz not null default now()
);
create unique index if not exists members_name_unique on public.members(lower(name));
create table if not exists public.characters (
 id uuid primary key default gen_random_uuid(),
 member_id uuid not null references public.members(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 60),
 role text not null check(role in ('tank','heal','chanter','dps')),
 power integer not null check(power between 0 and 99999),
 created_at timestamptz not null default now()
);
create table if not exists public.team_state (
 id integer primary key check(id=1),
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
insert into public.team_state(id,payload) values(1,'{}') on conflict(id) do nothing;
alter table public.members enable row level security;
alter table public.characters enable row level security;
alter table public.team_state enable row level security;
-- Dùng cho nhóm tin cậy, không dùng cho dữ liệu riêng tư.
create policy "friends all members" on public.members for all to anon using(true) with check(true);
create policy "friends all characters" on public.characters for all to anon using(true) with check(true);
create policy "friends all teams" on public.team_state for all to anon using(true) with check(true);
grant select,insert,update,delete on public.members,public.characters,public.team_state to anon;
