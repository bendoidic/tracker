-- Team Tracker schema. Paste into Supabase SQL editor.

create type assignee as enum ('miki', 'ben', 'alex', 'isai');
create type task_status as enum ('todo', 'in_progress', 'done');

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  assignee     assignee not null,
  deadline     timestamptz,
  status       task_status not null default 'todo',
  created_at   timestamptz not null default now(),
  completed_at timestamptz,
  created_by   assignee not null
);

create index tasks_created_at_idx on tasks (created_at);
create index tasks_completed_at_idx on tasks (completed_at);

alter table tasks enable row level security;
create policy "anon all" on tasks for all using (true) with check (true);

-- Realtime publication so the burn-up wall can subscribe to inserts/updates.
alter publication supabase_realtime add table tasks;
