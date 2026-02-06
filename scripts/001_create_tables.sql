-- ============================================================
-- Project Prometheus: Full Database Migration
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_partner"
  on public.profiles for select
  using (
    exists (
      select 1 from public.partnerships
      where status = 'active'
        and (
          (user_a = auth.uid() and user_b = profiles.id)
          or (user_b = auth.uid() and user_a = profiles.id)
        )
    )
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);


-- 2. PARTNERSHIPS
create table if not exists public.partnerships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz default now()
);

alter table public.partnerships enable row level security;

create policy "partnerships_select_own"
  on public.partnerships for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "partnerships_insert"
  on public.partnerships for insert
  with check (auth.uid() = user_a);

create policy "partnerships_update_own"
  on public.partnerships for update
  using (auth.uid() = user_a or auth.uid() = user_b);


-- 3. JOURNAL ENTRIES
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  priorities text[] default '{}',
  wins text default '',
  blockers text default '',
  minutes_deep_work int default 0,
  mood int default 0 check (mood >= 0 and mood <= 5),
  tomorrow_plan text default '',
  freeform_notes text default '',
  is_submitted boolean default false,
  submitted_at timestamptz,
  daily_score int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, entry_date)
);

alter table public.journal_entries enable row level security;

create policy "entries_select_own"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "entries_select_partner"
  on public.journal_entries for select
  using (
    exists (
      select 1 from public.partnerships
      where status = 'active'
        and (
          (user_a = auth.uid() and user_b = journal_entries.user_id)
          or (user_b = auth.uid() and user_a = journal_entries.user_id)
        )
    )
  );

create policy "entries_insert_own"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "entries_update_own"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "entries_delete_own"
  on public.journal_entries for delete
  using (auth.uid() = user_id);


-- 4. COMMENTS
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "comments_select_own"
  on public.comments for select
  using (auth.uid() = author_id);

create policy "comments_select_on_own_entries"
  on public.comments for select
  using (
    exists (
      select 1 from public.journal_entries
      where journal_entries.id = comments.entry_id
        and journal_entries.user_id = auth.uid()
    )
  );

create policy "comments_insert_partner"
  on public.comments for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.journal_entries je
      join public.partnerships p
        on (p.status = 'active'
            and (
              (p.user_a = auth.uid() and p.user_b = je.user_id)
              or (p.user_b = auth.uid() and p.user_a = je.user_id)
            ))
      where je.id = comments.entry_id
    )
  );

create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = author_id);


-- 5. ENTRY PHOTOS
create table if not exists public.entry_photos (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  caption text default '',
  created_at timestamptz default now()
);

alter table public.entry_photos enable row level security;

create policy "photos_select_own"
  on public.entry_photos for select
  using (auth.uid() = user_id);

create policy "photos_select_partner"
  on public.entry_photos for select
  using (
    exists (
      select 1 from public.partnerships
      where status = 'active'
        and (
          (user_a = auth.uid() and user_b = entry_photos.user_id)
          or (user_b = auth.uid() and user_a = entry_photos.user_id)
        )
    )
  );

create policy "photos_insert_own"
  on public.entry_photos for insert
  with check (auth.uid() = user_id);

create policy "photos_update_own"
  on public.entry_photos for update
  using (auth.uid() = user_id);

create policy "photos_delete_own"
  on public.entry_photos for delete
  using (auth.uid() = user_id);


-- 6. INDEXES
create index if not exists idx_journal_entries_user_date
  on public.journal_entries (user_id, entry_date);

create index if not exists idx_comments_entry_id
  on public.comments (entry_id);

create index if not exists idx_partnerships_users
  on public.partnerships (user_a, user_b);

create index if not exists idx_entry_photos_entry_id
  on public.entry_photos (entry_id);

create index if not exists idx_entry_photos_user_id
  on public.entry_photos (user_id);


-- 7. AUTO-CREATE PROFILE ON SIGNUP (trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- 8. AUTO-UPDATE updated_at ON JOURNAL ENTRIES
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journal_entries_updated_at on public.journal_entries;

create trigger journal_entries_updated_at
  before update on public.journal_entries
  for each row
  execute function public.set_updated_at();
