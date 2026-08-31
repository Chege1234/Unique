-- ==============================================================================
-- Supabase Automated Keep-Alive & Health Check Schema
-- Purpose: Provides an isolated table for automated heartbeats / keep-alive jobs
--          to generate legitimate database activity and prevent free plan pausing
--          with ZERO impact on production queue tickets, analytics, or real users.
-- ==============================================================================

-- 1. Create isolated keep-alive table
create table if not exists public._supabase_keepalive (
  id text primary key,
  last_ping timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'ok',
  metadata jsonb default '{}'::jsonb
);

-- 2. Enable Row Level Security (RLS)
alter table public._supabase_keepalive enable row level security;

-- 3. RLS Policies
-- Allow anyone with valid anon key or service role to perform health check operations
create policy "Allow health check read" on public._supabase_keepalive
  for select using (true);

create policy "Allow health check insert" on public._supabase_keepalive
  for insert with check (true);

create policy "Allow health check update" on public._supabase_keepalive
  for update using (true);

create policy "Allow health check delete" on public._supabase_keepalive
  for delete using (true);

-- 4. Initial heartbeat row
insert into public._supabase_keepalive (id, last_ping, status, metadata)
values ('heartbeat', timezone('utc'::text, now()), 'ok', '{"system": "smart-queue-keepalive"}'::jsonb)
on conflict (id) do update set
  last_ping = excluded.last_ping,
  status = excluded.status,
  metadata = excluded.metadata;
