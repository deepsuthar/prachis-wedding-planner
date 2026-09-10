-- Supabase SQL Schema for Prachi's Wedding Planner

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Enums safely checking if they already exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'family', 'volunteer');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type task_priority as enum ('critical', 'high', 'medium', 'low');
  end if;
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type task_status as enum ('not_started', 'in_progress', 'waiting', 'blocked', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('not_booked', 'enquired', 'negotiating', 'booked', 'confirmed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'rsvp_status') then
    create type rsvp_status as enum ('attending', 'declined', 'pending');
  end if;
end$$;

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role user_role not null default 'volunteer',
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- 2. Events Table (Dynamic Workspaces)
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  date timestamp with time zone,
  color_gradient text not null, -- CSS classes representing the festive gradient
  completion_percentage numeric(5,2) not null default 0.00,
  is_archived boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Events
alter table public.events enable row level security;

-- 3. Tasks Table
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  description text,
  category text not null,
  priority task_priority not null default 'medium',
  due_date timestamp with time zone,
  status task_status not null default 'not_started',
  checklist jsonb not null default '[]'::jsonb, -- e.g. [{"id": "1", "text": "Book photographer", "completed": false}]
  comments jsonb not null default '[]'::jsonb, -- e.g. [{"id": "1", "author": "Prachi", "text": "Called him", "timestamp": "2026..."}]
  completion_percentage numeric(5,2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Task Assignments Join Table (Many-to-Many profiles <-> tasks)
create table if not exists public.task_assignments (
  task_id uuid references public.tasks(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  primary key (task_id, profile_id)
);

-- Enable RLS for Tasks and Assignments
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;

-- 4. Shopping Items Table
create table if not exists public.shopping (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  name text not null,
  category text not null,
  quantity integer not null default 1,
  budget numeric(12,2) not null default 0.00,
  actual_price numeric(12,2) not null default 0.00,
  store text,
  status text not null default 'pending', -- 'pending' or 'purchased'
  assigned_to uuid references public.profiles(id) on delete set null,
  receipt_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Shopping
alter table public.shopping enable row level security;

-- 5. Budget Items Table
create table if not exists public.budget (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  category text not null,
  allocated numeric(12,2) not null default 0.00,
  actual numeric(12,2) not null default 0.00,
  paid numeric(12,2) not null default 0.00,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Budget
alter table public.budget enable row level security;

-- 6. Guests Table
create table if not exists public.guests (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null, -- 'family', 'friend', 'vip'
  side text not null, -- 'bride' or 'groom'
  rsvp_status rsvp_status not null default 'pending',
  invitation_sent boolean not null default false,
  food_preference text not null default 'veg', -- 'veg', 'non-veg', 'vegan'
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Guests
alter table public.guests enable row level security;

-- 7. Vendor Bookings (Critical Booking Tracker)
create table if not exists public.vendor_bookings (
  id uuid default gen_random_uuid() primary key,
  vendor_name text,
  category text not null, -- Makeup, Dress, Food Catering, Photographer, etc.
  event_id uuid references public.events(id) on delete set null,
  booking_status booking_status not null default 'not_booked',
  booking_date timestamp with time zone,
  contract_signed boolean not null default false,
  advance_paid numeric(12,2) not null default 0.00,
  balance_due numeric(12,2) not null default 0.00,
  payment_due_date timestamp with time zone,
  contact_person text,
  contact_phone text,
  trial_date timestamp with time zone,
  fitting_date timestamp with time zone,
  notes text,
  contract_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Vendor Bookings
alter table public.vendor_bookings enable row level security;


-----------------------
-- SECURITY POLICIES --
-----------------------

-- Drop existing policies if they exist
drop policy if exists "Public profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can update their own profiles" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;
drop policy if exists "Authenticated users can read events" on public.events;
drop policy if exists "Authenticated users can read tasks" on public.tasks;
drop policy if exists "Authenticated users can read task assignments" on public.task_assignments;
drop policy if exists "Authenticated users can read shopping items" on public.shopping;
drop policy if exists "Authenticated users can read budget entries" on public.budget;
drop policy if exists "Authenticated users can read guests" on public.guests;
drop policy if exists "Authenticated users can read vendor bookings" on public.vendor_bookings;
drop policy if exists "Admins can modify events" on public.events;
drop policy if exists "Admins can modify tasks" on public.tasks;
drop policy if exists "Admins can modify assignments" on public.task_assignments;
drop policy if exists "Admins can modify shopping" on public.shopping;
drop policy if exists "Admins can modify budget" on public.budget;
drop policy if exists "Admins can modify guests" on public.guests;
drop policy if exists "Admins can modify vendor bookings" on public.vendor_bookings;
drop policy if exists "Assigned users can update tasks" on public.tasks;
drop policy if exists "Assigned users can update shopping" on public.shopping;

-- Profiles Policies
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select using (auth.role() = 'authenticated');

create policy "Users can update their own profiles"
  on public.profiles for update using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Helper policy function to check role
create or replace function public.check_user_role(required_role user_role)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = required_role
  );
$$ language sql security definer;

-- Admins policy function
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Unified read policies for all core tables (authenticated users can read)
create policy "Authenticated users can read events" on public.events for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read tasks" on public.tasks for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read task assignments" on public.task_assignments for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read shopping items" on public.shopping for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read budget entries" on public.budget for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read guests" on public.guests for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read vendor bookings" on public.vendor_bookings for select using (auth.role() = 'authenticated');

-- Admin write access to everything
create policy "Admins can modify events" on public.events for all using (is_admin());
create policy "Admins can modify tasks" on public.tasks for all using (is_admin());
create policy "Admins can modify assignments" on public.task_assignments for all using (is_admin());
create policy "Admins can modify shopping" on public.shopping for all using (is_admin());
create policy "Admins can modify budget" on public.budget for all using (is_admin());
create policy "Admins can modify guests" on public.guests for all using (is_admin());
create policy "Admins can modify vendor bookings" on public.vendor_bookings for all using (is_admin());

-- Assigned user update policies (Family/Volunteers can edit tasks assigned to them)
create policy "Assigned users can update tasks"
  on public.tasks for update using (
    is_admin() or
    exists (
      select 1 from public.task_assignments
      where task_id = id and profile_id = auth.uid()
    )
  );

create policy "Assigned users can update shopping"
  on public.shopping for update using (
    is_admin() or
    assigned_to = auth.uid()
  );
