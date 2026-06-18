import { createClient } from "@/lib/supabase/server";
import { gradientForSlug } from "@/lib/games";
import type { Playthrough, TimeEstimate } from "@/lib/playthrough-types";

// Server-only queries voor playthroughs. Pure helpers/constants/types staan in
// lib/playthrough-types.ts (client-safe). Re-export voor gemak op de server.
export * from "@/lib/playthrough-types";

// Beste tijdschatting voor een game (meeste samples eerst).
export async function getTimeEstimateForGame(
  gameId: string
): Promise<TimeEstimate | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_time_estimates")
    .select("main_minutes, main_extra_minutes, completionist_minutes, sample_count")
    .eq("game_id", gameId)
    .order("sample_count", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return {
    mainMinutes: data.main_minutes ?? null,
    mainExtraMinutes: data.main_extra_minutes ?? null,
    completionistMinutes: data.completionist_minutes ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPlaythrough(row: any): Playthrough {
  const g = row.games;
  return {
    id: row.id,
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
  "id, game_id, run_name, status, goal_type, played_minutes, estimated_progress_percent, manual_progress_percent, progress_source, progress_note, started_at, completed_at, games ( id, title, slug, platform, genre, release_year, cover_url )";

// Playthroughs van de huidige gebruiker voor één game (detailpagina).
export async function getPlaythroughsForGame(
  gameId: string
): Promise<Playthrough[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("playthroughs")
    .select(PLAYTHROUGH_SELECT)
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToPlaythrough);
}

// Alle playthroughs van de huidige gebruiker (dashboard). Lege lijst als niet
// ingelogd. Recentst bijgewerkt eerst.
export async function getUserPlaythroughs(): Promise<Playthrough[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("playthroughs")
    .select(PLAYTHROUGH_SELECT)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map(rowToPlaythrough);
}
