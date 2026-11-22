-- =========================================================================
-- MATHS MASTER STUDIO — LIFETIME STUDENT DATABASE MIGRATION
-- Tables: test_attempts, user_learning_progress
-- Security: Row Level Security (RLS) enabled on all tables
-- =========================================================================

-- Enable pgcrypto for UUID generation if not already enabled
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- TABLE 1: test_attempts
-- Stores every completed Practice, CBT, and 50M Simulator test for lifetime
-- -------------------------------------------------------------------------
create table if not exists public.test_attempts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    test_mode text not null check (test_mode in ('practice', 'test', 'endsem')),
    test_title text not null,
    score numeric not null default 0,
    max_marks numeric not null default 50,
    accuracy_pct numeric not null default 0,
    total_time_sec integer not null default 0,
    co_breakdown_json jsonb not null default '{}'::jsonb,
    responses_json jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

-- Performance Indexes
create index if not exists idx_test_attempts_user_id on public.test_attempts(user_id);
create index if not exists idx_test_attempts_user_created on public.test_attempts(user_id, created_at desc);

-- Row Level Security (RLS) for test_attempts
alter table public.test_attempts enable row level security;

drop policy if exists "Users can select own test attempts" on public.test_attempts;
create policy "Users can select own test attempts"
    on public.test_attempts
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own test attempts" on public.test_attempts;
create policy "Users can insert own test attempts"
    on public.test_attempts
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own test attempts" on public.test_attempts;
create policy "Users can update own test attempts"
    on public.test_attempts
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own test attempts" on public.test_attempts;
create policy "Users can delete own test attempts"
    on public.test_attempts
    for delete
    to authenticated
    using ((select auth.uid()) = user_id);

-- Explicitly grant permissions to authenticated role for PostgREST Data API
grant all on table public.test_attempts to authenticated;

-- -------------------------------------------------------------------------
-- TABLE 2: user_learning_progress
-- Stores every student's lifetime learning state across devices
-- -------------------------------------------------------------------------
create table if not exists public.user_learning_progress (
    user_id uuid primary key references auth.users(id) on delete cascade,
    mastered_formulas_json jsonb not null default '{}'::jsonb,
    bookmarked_formulas_json jsonb not null default '{}'::jsonb,
    flashcards_mastered_json jsonb not null default '{}'::jsonb,
    labs_explored_json jsonb not null default '{}'::jsonb,
    study_streak_days integer not null default 0,
    last_active_date text,
    updated_at timestamptz not null default now()
);

-- Row Level Security (RLS) for user_learning_progress
alter table public.user_learning_progress enable row level security;

drop policy if exists "Users can select own learning progress" on public.user_learning_progress;
create policy "Users can select own learning progress"
    on public.user_learning_progress
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own learning progress" on public.user_learning_progress;
create policy "Users can insert own learning progress"
    on public.user_learning_progress
    for insert
    to authenticated
    with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own learning progress" on public.user_learning_progress;
create policy "Users can update own learning progress"
    on public.user_learning_progress
    for update
    to authenticated
    using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);

-- Explicitly grant permissions to authenticated role for PostgREST Data API
grant all on table public.user_learning_progress to authenticated;
