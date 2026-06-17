-- ============================================================================
-- Play3DS — initial database schema (Fase 2)
-- Draai dit in de Supabase SQL Editor (of via de Supabase CLI).
-- Gebaseerd op fases.md §15. RLS staat aan op alle tabellen.
-- ============================================================================

-- Supabase heeft pgcrypto al; gen_random_uuid() is beschikbaar.

-- ── Helpers ────────────────────────────────────────────────────────────────

-- Houdt updated_at automatisch bij.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Is de huidige gebruiker een admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  bio text,
  country text,
  favorite_game_id uuid,
  visibility text not null default 'public' check (visibility in ('public','private')),
  role text not null default 'user' check (role in ('user','admin')),
  is_banned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── games ─────────────────────────────────────────────────────────────────
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  platform text not null default 'Nintendo 3DS',
  release_year int,
  cover_url text,
  genre text,
  developer text,
  publisher text,
  description text,
  metadata_status text not null default 'basic'
    check (metadata_status in ('basic','enriched','verified')),
  igdb_id text,
  rawg_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_aliases (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  alias text not null,
  region text,
  created_at timestamptz not null default now()
);

create table if not exists public.game_time_estimates (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  source text,
  main_minutes int,
  main_extra_minutes int,
  completionist_minutes int,
  confidence text,
  sample_count int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── playthroughs ────────────────────────────────────────────────────────────
create table if not exists public.playthroughs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  run_name text,
  status text not null default 'want_to_play'
    check (status in ('want_to_play','playing','paused','completed','dropped')),
  goal_type text check (goal_type in ('main_story','main_extras','completionist','just_tracking')),
  played_minutes int not null default 0,
  estimated_progress_percent int,
  manual_progress_percent int,
  progress_source text
    check (progress_source in ('external_average','manual','not_available','custom_target_later')),
  progress_note text,
  started_at timestamptz,
  completed_at timestamptz,
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.playthrough_updates (
  id uuid primary key default gen_random_uuid(),
  playthrough_id uuid not null references public.playthroughs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  previous_status text,
  new_status text,
  played_minutes int,
  minutes_added int,
  estimated_progress_percent int,
  manual_progress_percent int,
  progress_note text,
  created_at timestamptz not null default now()
);

-- ── reviews ───────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  playthrough_id uuid references public.playthroughs(id) on delete set null,
  rating int check (rating between 1 and 10),
  label text,
  status_at_review text,
  title text,
  body text,
  has_spoilers boolean not null default false,
  likes_count int not null default 0,
  comments_count int not null default 0,
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.review_likes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);

create table if not exists public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── social ────────────────────────────────────────────────────────────────
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_playthroughs_user on public.playthroughs(user_id);
create index if not exists idx_playthroughs_game on public.playthroughs(game_id);
create index if not exists idx_reviews_game on public.reviews(game_id);
create index if not exists idx_reviews_user on public.reviews(user_id);
create index if not exists idx_activity_user on public.activity_events(user_id);
create index if not exists idx_follows_following on public.follows(following_id);

-- ── updated_at triggers ─────────────────────────────────────────────────────
create trigger trg_profiles_updated   before update on public.profiles            for each row execute function public.set_updated_at();
create trigger trg_games_updated       before update on public.games               for each row execute function public.set_updated_at();
create trigger trg_estimates_updated   before update on public.game_time_estimates for each row execute function public.set_updated_at();
create trigger trg_playthroughs_updated before update on public.playthroughs       for each row execute function public.set_updated_at();
create trigger trg_reviews_updated     before update on public.reviews             for each row execute function public.set_updated_at();
create trigger trg_comments_updated    before update on public.review_comments     for each row execute function public.set_updated_at();

-- ── Profiel automatisch aanmaken bij signup ─────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    split_part(new.email, '@', 1)
  );
  final_username := base_username;
  -- Zorg voor een unieke username.
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (user_id, username)
  values (new.id, final_username);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles             enable row level security;
alter table public.games                enable row level security;
alter table public.game_aliases         enable row level security;
alter table public.game_time_estimates  enable row level security;
alter table public.playthroughs         enable row level security;
alter table public.playthrough_updates  enable row level security;
alter table public.reviews              enable row level security;
alter table public.review_likes         enable row level security;
alter table public.review_comments      enable row level security;
alter table public.follows              enable row level security;
alter table public.activity_events      enable row level security;

-- profiles: publieke profielen of eigen profiel zichtbaar; eigen profiel bewerkbaar.
create policy "profiles_select" on public.profiles for select
  using (visibility = 'public' or user_id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profiles_admin_all" on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- games + metadata: iedereen leest; alleen admin schrijft.
create policy "games_select_all" on public.games for select using (true);
create policy "games_admin_write" on public.games for all
  using (public.is_admin()) with check (public.is_admin());

create policy "aliases_select_all" on public.game_aliases for select using (true);
create policy "aliases_admin_write" on public.game_aliases for all
  using (public.is_admin()) with check (public.is_admin());

create policy "estimates_select_all" on public.game_time_estimates for select using (true);
create policy "estimates_admin_write" on public.game_time_estimates for all
  using (public.is_admin()) with check (public.is_admin());

-- playthroughs: publiek of eigen zichtbaar; eigen volledig beheerbaar.
create policy "playthroughs_select" on public.playthroughs for select
  using (visibility = 'public' or user_id = auth.uid() or public.is_admin());
create policy "playthroughs_modify_own" on public.playthroughs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- playthrough_updates: zichtbaar als de playthrough zichtbaar is; eigen toevoegen.
create policy "pt_updates_select" on public.playthrough_updates for select
  using (
    exists (
      select 1 from public.playthroughs p
      where p.id = playthrough_id
        and (p.visibility = 'public' or p.user_id = auth.uid())
    ) or public.is_admin()
  );
create policy "pt_updates_insert_own" on public.playthrough_updates for insert
  with check (user_id = auth.uid());

-- reviews: publiek of eigen zichtbaar; eigen beheerbaar; admin alles.
create policy "reviews_select" on public.reviews for select
  using (visibility = 'public' or user_id = auth.uid() or public.is_admin());
create policy "reviews_modify_own" on public.reviews for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reviews_admin_delete" on public.reviews for delete using (public.is_admin());

-- review_likes: iedereen leest; eigen like toevoegen/verwijderen.
create policy "likes_select_all" on public.review_likes for select using (true);
create policy "likes_insert_own" on public.review_likes for insert with check (user_id = auth.uid());
create policy "likes_delete_own" on public.review_likes for delete using (user_id = auth.uid());

-- review_comments: niet-verwijderde zichtbaar; eigen beheren; admin alles.
create policy "comments_select" on public.review_comments for select
  using (is_deleted = false or user_id = auth.uid() or public.is_admin());
create policy "comments_insert_own" on public.review_comments for insert with check (user_id = auth.uid());
create policy "comments_modify_own" on public.review_comments for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "comments_admin_delete" on public.review_comments for delete using (public.is_admin());

-- follows: iedereen leest; eigen follows beheren.
create policy "follows_select_all" on public.follows for select using (true);
create policy "follows_insert_own" on public.follows for insert with check (follower_id = auth.uid());
create policy "follows_delete_own" on public.follows for delete using (follower_id = auth.uid());

-- activity_events: publiek of eigen zichtbaar; eigen toevoegen.
create policy "activity_select" on public.activity_events for select
  using (visibility = 'public' or user_id = auth.uid() or public.is_admin());
create policy "activity_insert_own" on public.activity_events for insert with check (user_id = auth.uid());
