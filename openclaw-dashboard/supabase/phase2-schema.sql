-- OpenClaw Dashboard Phase 2 schema
-- Apply in Supabase SQL editor or migration flow.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'viewer' check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agents (
  id text primary key,
  name text not null,
  emoji text,
  workspace text,
  role_summary text,
  focus text,
  trigger_type text,
  status text,
  last_run_at timestamptz,
  last_output_at timestamptz,
  latest_output_file text,
  is_expected boolean not null default false,
  is_registered boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  title text,
  description text,
  owner_agent_id text,
  status text,
  priority text,
  source text,
  context jsonb,
  notes jsonb,
  needs_approval_reason text,
  failure_reason text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_events (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references public.tasks(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  note text,
  actor_user_id uuid references auth.users(id),
  actor_role text check (actor_role in ('owner', 'admin', 'viewer')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  pipeline_name text not null,
  source_task_id text,
  current_stage text,
  stage_status text,
  final_status text,
  linked_task_ids jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  severity text not null,
  description text not null,
  href text,
  status text not null default 'open',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cli_audit_logs (
  id uuid primary key default gen_random_uuid(),
  command_id text not null,
  label text not null,
  status text not null check (status in ('started', 'success', 'error', 'denied')),
  requested_by uuid references auth.users(id),
  requested_role text check (requested_role in ('owner', 'admin', 'viewer')),
  input jsonb,
  sanitized_args jsonb,
  stdout text,
  stderr text,
  note text,
  duration_ms integer,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.agents enable row level security;
alter table public.tasks enable row level security;
alter table public.task_events enable row level security;
alter table public.pipeline_runs enable row level security;
alter table public.alerts enable row level security;
alter table public.cli_audit_logs enable row level security;

create or replace function public.get_my_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy if not exists "profiles_select_own" on public.profiles
for select using (id = auth.uid());

create policy if not exists "profiles_update_own_basic" on public.profiles
for update using (id = auth.uid())
with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy if not exists "dashboard_read_agents" on public.agents
for select to authenticated using (true);
create policy if not exists "dashboard_read_tasks" on public.tasks
for select to authenticated using (true);
create policy if not exists "dashboard_read_task_events" on public.task_events
for select to authenticated using (true);
create policy if not exists "dashboard_read_pipeline_runs" on public.pipeline_runs
for select to authenticated using (true);
create policy if not exists "dashboard_read_alerts" on public.alerts
for select to authenticated using (true);

create policy if not exists "dashboard_write_agents_admin" on public.agents
for all to authenticated using (public.get_my_role() in ('owner', 'admin'))
with check (public.get_my_role() in ('owner', 'admin'));
create policy if not exists "dashboard_write_tasks_admin" on public.tasks
for all to authenticated using (public.get_my_role() in ('owner', 'admin'))
with check (public.get_my_role() in ('owner', 'admin'));
create policy if not exists "dashboard_write_task_events_admin" on public.task_events
for all to authenticated using (public.get_my_role() in ('owner', 'admin'))
with check (public.get_my_role() in ('owner', 'admin'));
create policy if not exists "dashboard_write_pipeline_runs_admin" on public.pipeline_runs
for all to authenticated using (public.get_my_role() in ('owner', 'admin'))
with check (public.get_my_role() in ('owner', 'admin'));
create policy if not exists "dashboard_write_alerts_admin" on public.alerts
for all to authenticated using (public.get_my_role() in ('owner', 'admin'))
with check (public.get_my_role() in ('owner', 'admin'));

create policy if not exists "cli_audit_logs_admin_read" on public.cli_audit_logs
for select to authenticated using (public.get_my_role() in ('owner', 'admin'));
create policy if not exists "cli_audit_logs_admin_write" on public.cli_audit_logs
for insert to authenticated with check (public.get_my_role() in ('owner', 'admin'));
