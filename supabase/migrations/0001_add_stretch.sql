-- Adds the "stretch" flag used by the Stretch screen.
-- Run this in the Supabase SQL editor against an existing database.

alter table tasks
  add column if not exists stretch boolean not null default false;

create index if not exists tasks_stretch_idx on tasks (stretch);
