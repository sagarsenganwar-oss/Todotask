-- =====================================================================
-- Todotask: initial database schema
-- Run this once in the Supabase SQL Editor.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

-- A project groups tasks. Every user has exactly one "Inbox" project.
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid()
              references auth.users (id) on delete cascade,
  name        text not null
              check (char_length(btrim(name)) between 1 and 100),
  is_inbox    boolean not null default false,
  created_at  timestamptz not null default now(),
  -- Lets tasks reference (project id + owner) together, see tasks below.
  unique (id, user_id)
);

-- At most one Inbox per user.
create unique index projects_one_inbox_per_user
  on public.projects (user_id) where is_inbox;

-- A task always belongs to one project of the SAME user.
create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid()
                references auth.users (id) on delete cascade,
  project_id    uuid not null,
  title         text not null
                check (char_length(btrim(title)) between 1 and 500),
  description   text check (char_length(description) <= 5000),
  due_date      date,
  priority      smallint not null default 4 check (priority between 1 and 4),
  completed_at  timestamptz,               -- null = not completed
  created_at    timestamptz not null default now(),
  -- The pair (project_id, user_id) must exist in projects, so a task can
  -- never point at another user's project. Deleting a project deletes
  -- its tasks.
  foreign key (project_id, user_id)
    references public.projects (id, user_id) on delete cascade
);

create index tasks_user_due_idx     on public.tasks (user_id, due_date);
create index tasks_project_idx      on public.tasks (project_id);
create index tasks_user_completed_idx on public.tasks (user_id, completed_at);

-- ---------------------------------------------------------------------
-- 2. Access: only logged-in users, never anonymous visitors
-- ---------------------------------------------------------------------
revoke all on public.projects, public.tasks from anon;
grant select, insert, update, delete on public.projects, public.tasks to authenticated;

-- ---------------------------------------------------------------------
-- 3. Row Level Security: each user sees and changes only their own rows
-- ---------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.tasks    enable row level security;

-- projects
create policy "projects: read own"
  on public.projects for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "projects: create own (not an inbox)"
  on public.projects for insert to authenticated
  with check ((select auth.uid()) = user_id and is_inbox = false);

create policy "projects: update own"
  on public.projects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "projects: delete own, never the inbox"
  on public.projects for delete to authenticated
  using ((select auth.uid()) = user_id and is_inbox = false);

-- tasks
create policy "tasks: read own"
  on public.tasks for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "tasks: create own"
  on public.tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "tasks: update own"
  on public.tasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "tasks: delete own"
  on public.tasks for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- 4. Protect the Inbox: it cannot be renamed or turned into a normal
--    project, and a normal project cannot become an Inbox.
-- ---------------------------------------------------------------------
create function public.protect_inbox()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_inbox is distinct from old.is_inbox then
    raise exception 'The Inbox flag cannot be changed.';
  end if;
  if old.is_inbox and new.name is distinct from old.name then
    raise exception 'The Inbox cannot be renamed.';
  end if;
  return new;
end;
$$;

create trigger projects_protect_inbox
  before update on public.projects
  for each row execute function public.protect_inbox();

-- ---------------------------------------------------------------------
-- 5. Every new user automatically gets an "Inbox" project.
--    "security definer" lets this function write to public.projects
--    while the sign-up itself runs inside Supabase Auth.
-- ---------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.projects (user_id, name, is_inbox)
  values (new.id, 'Inbox', true);
  return new;
end;
$$;

-- Nobody may call these functions directly through the API;
-- they only run as triggers.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_inbox()   from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
