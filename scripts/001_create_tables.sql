-- ============================================================
-- Project Prometheus: Database Migration
-- Step 1: Create all tables first
-- ============================================================

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- 2. PARTNERSHIPS
create table if not exists public.partnerships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active')),
  created_at timestamptz default now()
);

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

-- 4. COMMENTS
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- 5. ENTRY PHOTOS
create table if not exists public.entry_photos (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  caption text default '',
  created_at timestamptz default now()
);

-- 6. INDEXES
create index if not exists idx_journal_entries_user_date on public.journal_entries (user_id, entry_date);
create index if not exists idx_comments_entry_id on public.comments (entry_id);
create index if not exists idx_partnerships_users on public.partnerships (user_a, user_b);
create index if not exists idx_entry_photos_entry_id on public.entry_photos (entry_id);
create index if not exists idx_entry_photos_user_id on public.entry_photos (user_id);
