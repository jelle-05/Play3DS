import { createClient } from "@/lib/supabase/server";
import { gradientForSlug } from "@/lib/games";
import {
  type Playthrough,
  playthroughToCard,
} from "@/lib/playthrough-types";

const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export interface PublicProfile {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  country: string | null;
  favoriteGameId: string | null;
  visibility: "public" | "private";
  role: "user" | "admin";
  isBanned: boolean;
  createdAt: string;
  // Afgeleid: bekijkt de huidige bezoeker zijn eigen profiel?
  isOwner: boolean;
  // Avatar-initialen + deterministische gradient voor de fallback-avatar.
  initials: string;
  gradientClass: string;
}

export interface ProfileStats {
  playthroughs: number;
  completed: number;
  reviews: number;
  followers: number;
  following: number;
}

// Avatar-initialen uit een username (zelfde logica als elders in de app).
function initialsFrom(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "P3";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProfile(row: any, currentUserId?: string): PublicProfile {
  const username: string = row.username ?? "Player";
  return {
    id: row.id,
    userId: row.user_id,
    username,
    avatarUrl: row.avatar_url ?? null,
    bio: row.bio ?? null,
    country: row.country ?? null,
    favoriteGameId: row.favorite_game_id ?? null,
    visibility: (row.visibility as "public" | "private") ?? "public",
    role: (row.role as "user" | "admin") ?? "user",
    isBanned: row.is_banned ?? false,
    createdAt: row.created_at,
    isOwner: !!currentUserId && row.user_id === currentUserId,
    initials: initialsFrom(username),
    gradientClass: gradientForSlug(username),
  };
}

const PROFILE_SELECT =
  "id, user_id, username, avatar_url, bio, country, favorite_game_id, visibility, role, is_banned, created_at";

// Profiel op username. RLS (profiles_select) geeft alleen publieke profielen,
// het eigen profiel of (voor admins) alles terug — een privéprofiel van iemand
// anders levert dus niets op en wordt als "niet gevonden" behandeld. null als
// niet gevonden / niet zichtbaar / Supabase niet geconfigureerd.
export async function getProfileByUsername(
  username: string
): Promise<PublicProfile | null> {
  if (!isConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return null;
  return rowToProfile(data, user?.id);
}

// De username van de huidige gebruiker (voor de /profile-redirect). null als
// niet ingelogd.
export async function getOwnUsername(): Promise<string | null> {
  if (!isConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.username ?? null;
}

// Het bewerkbare profiel van de huidige gebruiker (voor /settings). null als
// niet ingelogd / niet geconfigureerd.
export interface EditableProfile {
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  country: string | null;
  favoriteGameId: string | null;
  visibility: "public" | "private";
}

export async function getOwnProfile(): Promise<EditableProfile | null> {
  if (!isConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("username, avatar_url, bio, country, favorite_game_id, visibility")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  return {
    username: data.username ?? "",
    avatarUrl: data.avatar_url ?? null,
    bio: data.bio ?? null,
    country: data.country ?? null,
    favoriteGameId: data.favorite_game_id ?? null,
    visibility: (data.visibility as "public" | "private") ?? "public",
  };
}

// De games die de huidige gebruiker tracket (uniek), voor de favorite-game
// keuze in de profielinstellingen. Alfabetisch.
export interface TrackedGameOption {
  id: string;
  title: string;
}

export async function getOwnTrackedGames(): Promise<TrackedGameOption[]> {
  if (!isConfigured) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("playthroughs")
    .select("game_id, games ( id, title )")
    .eq("user_id", user.id);

  if (error || !data) return [];
  const seen = new Map<string, string>();
  for (const row of data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (row as any).games;
    if (g?.id && !seen.has(g.id)) seen.set(g.id, g.title ?? "Untitled");
  }
  return Array.from(seen, ([id, title]) => ({ id, title })).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

// Profiel-tellingen. RLS bepaalt wat zichtbaar is: bezoekers tellen alleen
// publieke playthroughs/reviews, de eigenaar telt al zijn eigen content.
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const empty: ProfileStats = {
    playthroughs: 0,
    completed: 0,
    reviews: 0,
    followers: 0,
    following: 0,
  };
  if (!isConfigured) return empty;

  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };

  const [playthroughs, completed, reviews, followers, following] =
    await Promise.all([
      supabase.from("playthroughs").select("id", head).eq("user_id", userId),
      supabase
        .from("playthroughs")
        .select("id", head)
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabase.from("reviews").select("id", head).eq("user_id", userId),
      supabase.from("follows").select("id", head).eq("following_id", userId),
      supabase.from("follows").select("id", head).eq("follower_id", userId),
    ]);

  return {
    playthroughs: playthroughs.count ?? 0,
    completed: completed.count ?? 0,
    reviews: reviews.count ?? 0,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPlaythrough(row: any): Playthrough {
  const g = row.games;
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    gameId: row.game_id,
    runName: row.run_name ?? null,
    status: row.status,
    goalType: row.goal_type ?? null,
    playedMinutes: row.played_minutes ?? 0,
    estimatedProgressPercent: row.estimated_progress_percent ?? null,
    manualProgressPercent: row.manual_progress_percent ?? null,
    progressSource: row.progress_source ?? null,
    progressNote: row.progress_note ?? null,
    startedAt: row.started_at ?? null,
    completedAt: row.completed_at ?? null,
    game: g
      ? {
          id: g.id,
          title: g.title,
          slug: g.slug,
          platform: g.platform ?? "Nintendo 3DS",
          genre: g.genre ?? null,
          releaseYear: g.release_year ?? null,
          coverUrl: g.cover_url ?? null,
          gradientClass: gradientForSlug(g.slug ?? g.id),
        }
      : undefined,
  };
}

const PLAYTHROUGH_SELECT =
  "id, user_id, game_id, run_name, status, goal_type, played_minutes, estimated_progress_percent, manual_progress_percent, progress_source, progress_note, started_at, completed_at, games ( id, title, slug, platform, genre, release_year, cover_url )";

// Playthroughs van een gebruiker (op user_id) als kaarten. RLS toont publieke
// runs voor bezoekers en alle eigen runs voor de eigenaar. Recentst eerst.
export async function getProfilePlaythroughCards(userId: string) {
  if (!isConfigured) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playthroughs")
    .select(PLAYTHROUGH_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToPlaythrough).map(playthroughToCard);
}
