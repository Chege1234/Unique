-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Departments Table
create table public.departments (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  is_active boolean default true,
  description text,
  average_service_time integer default 15,
  color text default 'blue',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: Insert default departments
insert into public.departments (name, description, color, average_service_time) values
('Admissions', 'Undergraduate admissions', 'blue', 15),
('Financial Aid', 'Scholarships and grants', 'green', 20),
('Registrar', 'Transcripts and records', 'purple', 10),
('Student Life', 'Housing and activities', 'orange', 15);

-- 2. Users Table
-- Supabase handles Auth users, but we store extra profile data here.
create table public.users (
  id uuid references auth.users(id) primary key,
  email text unique not null,
  full_name text not null,
  role text default 'student' check (role in ('student', 'staff', 'admin')),
  department_id uuid references public.departments(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS logic for users (optional but good practice)
-- alter table public.users enable row level security;

-- 3. Queue Tickets Table
create table public.queue_tickets (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid, -- could references public.users(id) if needed
  student_email text not null,
  student_name text not null,
  department_id uuid references public.departments(id) not null,
  department_name text not null,
  ticket_number text not null,
  status text default 'waiting' check (status in ('waiting', 'in_progress', 'completed', 'cancelled')),
  queue_position integer,
  estimated_wait_time integer,
  served_by uuid references public.users(id),
  served_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Staff Requests Table
create table public.staff_requests (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text not null,
  phone text,
  department text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_date timestamp with time zone default timezone('utc'::text, now()) not null
);
