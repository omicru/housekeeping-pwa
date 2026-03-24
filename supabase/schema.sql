-- Housekeeping Hotel PWA schema (Postgres/Supabase)
create type public.app_role as enum ('supervisor', 'cameriera', 'facchino');
create type public.room_type as enum ('singola', 'doppia', 'tripla', 'quadrupla');
create type public.hk_status as enum ('partenza', 'fermata', 'occupata', 'gia_pulita', 'fuori_servizio', 'ispezione', 'vip', 'urgente');
create type public.work_status as enum ('da_fare', 'in_corso', 'completata');
create type public.facchino_status as enum ('da_fare', 'in_corso', 'fatto');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null,
  is_active boolean default true
);

create table public.workdays (
  id uuid primary key default gen_random_uuid(),
  work_date date unique not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now()
);

create table public.hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text unique not null,
  floor int not null,
  default_room_type public.room_type not null,
  has_balcony boolean default false,
  allows_extra_bed boolean default false
);

create table public.daily_room_assignments (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays(id) on delete cascade,
  room_id uuid not null references public.hotel_rooms(id),
  room_type public.room_type not null,
  housekeeping_status public.hk_status not null,
  people_count int not null check (people_count between 1 and 4),
  extra_bed boolean default false,
  balcony boolean default false,
  special_notes text,
  supervisor_note text,
  assigned_user_id uuid not null references public.profiles(id),
  workflow_status public.work_status default 'da_fare',
  started_at timestamptz,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id),
  modified boolean default false,
  last_updated_at timestamptz default now()
);

create table public.facchino_tasks (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays(id) on delete cascade,
  title text not null,
  zone text not null,
  priority text not null,
  suggested_time text,
  status public.facchino_status default 'da_fare',
  note text,
  assigned_user_id uuid not null references public.profiles(id),
  updated_at timestamptz default now(),
  completed_by uuid references public.profiles(id)
);

create table public.linen_entries (
  id uuid primary key default gen_random_uuid(),
  room_assignment_id uuid not null references public.daily_room_assignments(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  federe int not null default 0,
  lenzuolo int not null default 0,
  coprilenzuolo int not null default 0,
  asciugamani_viso int not null default 0,
  asciugamani_grandi int not null default 0,
  asciugamani_bidet int not null default 0,
  created_at timestamptz default now()
);

create table public.issue_reports (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays(id),
  created_by uuid not null references public.profiles(id),
  room_assignment_id uuid references public.daily_room_assignments(id),
  task_id uuid references public.facchino_tasks(id),
  category text not null,
  note text,
  created_at timestamptz default now()
);

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid not null references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id text not null,
  detail text
);

create table public.app_settings (
  id int primary key default 1,
  mandatory_linen_on_complete boolean not null default true
);

alter table public.profiles enable row level security;
alter table public.daily_room_assignments enable row level security;
alter table public.facchino_tasks enable row level security;
alter table public.linen_entries enable row level security;
alter table public.issue_reports enable row level security;
alter table public.activity_log enable row level security;

create policy "profiles_self_or_supervisor" on public.profiles for select
using (
  auth.uid() = id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'supervisor')
);

create policy "rooms_supervisor_or_assigned" on public.daily_room_assignments for select
using (
  assigned_user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'supervisor')
);

create policy "tasks_supervisor_or_assigned" on public.facchino_tasks for select
using (
  assigned_user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'supervisor')
);
