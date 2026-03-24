-- Housekeeping Hotel PWA - Supabase schema (V2 realtime + RLS)
create extension if not exists pgcrypto;

create type public.app_role as enum ('supervisor', 'cameriera', 'facchino');
create type public.room_type as enum ('doppia', 'tripla', 'quadrupla');
create type public.workflow_status as enum ('da_fare', 'in_corso', 'completata');
create type public.workday_status as enum ('attivo', 'chiuso');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  floor int not null,
  room_type public.room_type not null,
  people_capacity int not null check (people_capacity between 2 and 4),
  has_minibar boolean not null default true,
  is_active boolean not null default true
);

create table if not exists public.workdays (
  id uuid primary key default gen_random_uuid(),
  work_date date not null unique,
  created_by uuid not null references public.profiles(id),
  status public.workday_status not null default 'attivo',
  created_at timestamptz not null default now()
);

create table if not exists public.room_assignments (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays(id) on delete cascade,
  room_id uuid not null references public.hotel_rooms(id),
  assigned_to_profile_id uuid references public.profiles(id),
  housekeeping_status text not null default 'da_fare',
  workflow_status public.workflow_status not null default 'da_fare',
  people_count int not null default 2 check (people_count between 1 and 4),
  extra_bed boolean not null default false,
  balcony boolean not null default false,
  urgent boolean not null default false,
  vip boolean not null default false,
  notes text,
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  unique (workday_id, room_id)
);

create table if not exists public.linen_entries (
  id uuid primary key default gen_random_uuid(),
  room_assignment_id uuid not null references public.room_assignments(id) on delete cascade,
  federe int not null default 0,
  lenzuolo int not null default 0,
  coprilenzuolo int not null default 0,
  asciugamani_viso int not null default 0,
  asciugamani_grandi int not null default 0,
  asciugamani_bidet int not null default 0,
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now()
);

create table if not exists public.minibar_entries (
  id uuid primary key default gen_random_uuid(),
  room_assignment_id uuid not null references public.room_assignments(id) on delete cascade,
  acqua_naturale int not null default 0,
  acqua_frizzante int not null default 0,
  coca_cola int not null default 0,
  estathe int not null default 0,
  fanta int not null default 0,
  succo int not null default 0,
  snack_dolce int not null default 0,
  snack_salato int not null default 0,
  prosecco int not null default 0,
  recorded_by uuid not null references public.profiles(id),
  recorded_at timestamptz not null default now()
);

create table if not exists public.facchino_tasks (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays(id) on delete cascade,
  title text not null,
  zone text not null,
  priority text not null default 'media',
  suggested_time text,
  workflow_status public.workflow_status not null default 'da_fare',
  assigned_to_profile_id uuid references public.profiles(id),
  notes text,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.issue_reports (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid not null references public.workdays(id) on delete cascade,
  related_room_assignment_id uuid references public.room_assignments(id) on delete set null,
  related_task_id uuid references public.facchino_tasks(id) on delete set null,
  category text not null,
  note text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id int primary key default 1,
  default_people_count int not null default 2,
  mandatory_linen_on_complete boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  workday_id uuid references public.workdays(id) on delete set null,
  actor_profile_id uuid not null references public.profiles(id),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_supervisor()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'supervisor' and p.is_active = true
  );
$$;

create or replace function public.is_active_workday(target_workday uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.workdays w
    where w.id = target_workday and w.status = 'attivo'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'cameriera'),
    true
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace view public.v_room_completions as
select
  ra.workday_id,
  ra.id as assignment_id,
  ra.room_id,
  w.work_date,
  l.id as linen_id,
  m.id as minibar_id,
  l.recorded_by,
  coalesce(l.recorded_at, m.recorded_at) as recorded_at,
  l.federe,
  l.lenzuolo,
  l.coprilenzuolo,
  l.asciugamani_viso,
  l.asciugamani_grandi,
  l.asciugamani_bidet,
  m.acqua_naturale,
  m.acqua_frizzante,
  m.coca_cola,
  m.estathe,
  m.fanta,
  m.succo,
  m.snack_dolce,
  m.snack_salato,
  m.prosecco
from public.room_assignments ra
join public.workdays w on w.id = ra.workday_id
join lateral (
  select * from public.linen_entries le where le.room_assignment_id = ra.id order by le.recorded_at desc limit 1
) l on true
join lateral (
  select * from public.minibar_entries me where me.room_assignment_id = ra.id order by me.recorded_at desc limit 1
) m on true;

alter table public.profiles enable row level security;
alter table public.hotel_rooms enable row level security;
alter table public.workdays enable row level security;
alter table public.room_assignments enable row level security;
alter table public.linen_entries enable row level security;
alter table public.minibar_entries enable row level security;
alter table public.facchino_tasks enable row level security;
alter table public.issue_reports enable row level security;
alter table public.app_settings enable row level security;
alter table public.activity_log enable row level security;

create policy profiles_select on public.profiles
for select using (id = auth.uid() or public.is_supervisor());

create policy profiles_update_self on public.profiles
for update using (id = auth.uid() or public.is_supervisor()) with check (id = auth.uid() or public.is_supervisor());

create policy hotel_rooms_read on public.hotel_rooms
for select using (auth.uid() is not null);

create policy workdays_read on public.workdays
for select using (auth.uid() is not null);

create policy workdays_supervisor_write on public.workdays
for all using (public.is_supervisor()) with check (public.is_supervisor());

create policy room_assignments_select on public.room_assignments
for select using (
  public.is_supervisor()
  or (
    assigned_to_profile_id = auth.uid()
    and public.is_active_workday(workday_id)
  )
);

create policy room_assignments_update_supervisor on public.room_assignments
for update using (public.is_supervisor()) with check (public.is_supervisor());

create policy room_assignments_update_worker on public.room_assignments
for update using (
  assigned_to_profile_id = auth.uid()
  and public.is_active_workday(workday_id)
) with check (
  assigned_to_profile_id = auth.uid()
  and public.is_active_workday(workday_id)
);

create policy room_assignments_insert_supervisor on public.room_assignments
for insert with check (public.is_supervisor());

create policy linen_entries_select on public.linen_entries
for select using (
  public.is_supervisor()
  or exists (
    select 1 from public.room_assignments ra
    where ra.id = room_assignment_id
      and ra.assigned_to_profile_id = auth.uid()
      and public.is_active_workday(ra.workday_id)
  )
);

create policy linen_entries_write on public.linen_entries
for insert with check (
  public.is_supervisor()
  or exists (
    select 1 from public.room_assignments ra
    where ra.id = room_assignment_id
      and ra.assigned_to_profile_id = auth.uid()
      and public.is_active_workday(ra.workday_id)
  )
);

create policy minibar_entries_select on public.minibar_entries
for select using (
  public.is_supervisor()
  or exists (
    select 1 from public.room_assignments ra
    where ra.id = room_assignment_id
      and ra.assigned_to_profile_id = auth.uid()
      and public.is_active_workday(ra.workday_id)
  )
);

create policy minibar_entries_write on public.minibar_entries
for insert with check (
  public.is_supervisor()
  or exists (
    select 1 from public.room_assignments ra
    where ra.id = room_assignment_id
      and ra.assigned_to_profile_id = auth.uid()
      and public.is_active_workday(ra.workday_id)
  )
);

create policy facchino_tasks_select on public.facchino_tasks
for select using (
  public.is_supervisor()
  or (
    assigned_to_profile_id = auth.uid()
    and public.is_active_workday(workday_id)
  )
);

create policy facchino_tasks_update on public.facchino_tasks
for update using (
  public.is_supervisor()
  or (
    assigned_to_profile_id = auth.uid()
    and public.is_active_workday(workday_id)
  )
) with check (
  public.is_supervisor()
  or (
    assigned_to_profile_id = auth.uid()
    and public.is_active_workday(workday_id)
  )
);

create policy facchino_tasks_insert on public.facchino_tasks
for insert with check (public.is_supervisor());

create policy issue_reports_select on public.issue_reports
for select using (public.is_supervisor() or created_by = auth.uid());

create policy issue_reports_insert on public.issue_reports
for insert with check (
  created_by = auth.uid()
  and (
    public.is_supervisor()
    or exists (
      select 1 from public.room_assignments ra
      where ra.id = related_room_assignment_id and ra.assigned_to_profile_id = auth.uid()
    )
    or exists (
      select 1 from public.facchino_tasks ft
      where ft.id = related_task_id and ft.assigned_to_profile_id = auth.uid()
    )
  )
);

create policy app_settings_read on public.app_settings for select using (auth.uid() is not null);
create policy app_settings_supervisor_write on public.app_settings for all using (public.is_supervisor()) with check (public.is_supervisor());

create policy activity_log_select on public.activity_log
for select using (public.is_supervisor() or actor_profile_id = auth.uid());

create policy activity_log_insert on public.activity_log
for insert with check (actor_profile_id = auth.uid() or public.is_supervisor());

alter publication supabase_realtime add table public.workdays;
alter publication supabase_realtime add table public.room_assignments;
alter publication supabase_realtime add table public.facchino_tasks;
alter publication supabase_realtime add table public.linen_entries;
alter publication supabase_realtime add table public.minibar_entries;
