"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import {
  isIgdbConfigured,
  fetchIgdb3dsGamesPage,
  fetchIgdbTimeToBeats,
  IGDB_PAGE_SIZE,
} from "@/lib/igdb";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
}

export interface SyncPageResult {
  ok: boolean;
  done: boolean;
  processed: number;
  created: number;
  updated: number;
  withTime: number;
  nextOffset: number;
  error?: string;
}

function confidenceFor(sampleCount: number | null): string {
  if (sampleCount === null) return "low";
  if (sampleCount >= 50) return "high";
  if (sampleCount >= 10) return "medium";
  return "low";
}

// Synchroniseert één pagina (max 500) IGDB-3DS-games naar de DB.
// De client roept dit herhaald aan met nextOffset tot done=true, zodat geen
// enkele request de Vercel-timeout raakt.
export async function syncIgdbPage(offset: number): Promise<SyncPageResult> {
  await requireAdmin();

  const base: SyncPageResult = {
    ok: false,
    done: true,
    processed: 0,
    created: 0,
    updated: 0,
    withTime: 0,
    nextOffset: offset,
  };

  if (!isIgdbConfigured) {
    return { ...base, error: "IGDB is not configured (missing env vars)." };
  }

  let games;
  try {
    games = await fetchIgdb3dsGamesPage(offset);
  } catch (e) {
    return { ...base, error: e instanceof Error ? e.message : "IGDB fetch failed." };
  }

  if (games.length === 0) {
    return { ...base, ok: true, done: true, nextOffset: offset };
  }

  // Dedupe op slug binnen de pagina (IGDB-slugs zijn uniek, dit is een vangnet).
  const seen = new Set<string>();
  const unique = games.filter((g) => {
    if (!g.slug || seen.has(g.slug)) return false;
    seen.add(g.slug);
    return true;
  });
  const slugs = unique.map((g) => g.slug);

  const supabase = await createClient();

  // Bestaande games in deze pagina (voor created/updated-telling).
  const { data: existingRows } = await supabase
    .from("games")
    .select("slug")
    .in("slug", slugs);
  const existing = new Set((existingRows ?? []).map((r) => r.slug as string));

  // Bulk-upsert op slug.
  const payload = unique.map((g) => ({
    title: g.title,
    slug: g.slug,
    platform: "Nintendo 3DS",
    release_year: g.releaseYear,
    cover_url: g.coverUrl,
    genre: g.genre,
    developer: g.developer,
    publisher: g.publisher,
    description: g.description,
    metadata_status: g.coverUrl ? "enriched" : "basic",
    igdb_id: g.igdbId,
  }));

  const { data: upserted, error: upsertError } = await supabase
    .from("games")
    .upsert(payload, { onConflict: "slug" })
    .select("id, slug, igdb_id");

  if (upsertError || !upserted) {
    return {
      ...base,
      error: upsertError?.message ?? "Upsert failed.",
      nextOffset: offset,
    };
  }

  // Map IGDB-id → DB-game-id voor de time-estimates.
  const idByIgdb = new Map<string, string>();
  for (const row of upserted) {
    if (row.igdb_id) idByIgdb.set(String(row.igdb_id), row.id as string);
  }

  // Time-to-beat ophalen + wegschrijven (source='igdb' wordt vervangen).
  let withTime = 0;
  try {
    const ttbs = await fetchIgdbTimeToBeats(unique.map((g) => g.igdbId));
    const estimates = ttbs
      .map((t) => {
        const gameId = idByIgdb.get(String(t.igdbGameId));
        if (!gameId) return null;
        if (t.mainMinutes === null && t.completionistMinutes === null) return null;
        return {
          game_id: gameId,
          source: "igdb",
          main_minutes: t.mainMinutes,
          main_extra_minutes: null,
          completionist_minutes: t.completionistMinutes,
          confidence: confidenceFor(t.sampleCount),
          sample_count: t.sampleCount,
        };
      })
      .filter(Boolean) as Record<string, unknown>[];

    if (estimates.length > 0) {
      const gameIds = estimates.map((e) => e.game_id as string);
      await supabase
        .from("game_time_estimates")
        .delete()
        .eq("source", "igdb")
        .in("game_id", gameIds);
      await supabase.from("game_time_estimates").insert(estimates);
      withTime = estimates.length;
    }
  } catch {
    // Time-to-beat is optioneel — een fout hier mag de game-sync niet blokkeren.
  }

  let created = 0;
  let updated = 0;
  for (const g of unique) {
    if (existing.has(g.slug)) updated++;
    else created++;
  }

  revalidatePath("/admin/games");
  revalidatePath("/games");

  return {
    ok: true,
    done: games.length < IGDB_PAGE_SIZE,
    processed: games.length,
    created,
    updated,
    withTime,
    nextOffset: offset + games.length,
  };
}
