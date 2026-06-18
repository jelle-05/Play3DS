import { createClient } from "@/lib/supabase/server";
import { MOCK_GAMES, gradientForSlug, type Game } from "@/lib/games";

// Rij uit de games-tabel → app-Game (metadata + afgeleide gradient).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToGame(row: any): Game {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    platform: row.platform ?? "Nintendo 3DS",
    genre: row.genre ?? "—",
    releaseYear: row.release_year ?? 0,
    gradientClass: gradientForSlug(row.slug ?? row.id),
    coverUrl: row.cover_url ?? null,
    metadataStatus: row.metadata_status ?? "basic",
    developer: row.developer ?? undefined,
    publisher: row.publisher ?? undefined,
    description: row.description ?? undefined,
  };
}

const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

// Volledige catalogus (alfabetisch). Valt terug op de mock-data wanneer
// Supabase niet geconfigureerd is (bv. lokale build zonder env-vars).
export async function getCatalogGames(): Promise<Game[]> {
  if (!isConfigured) return MOCK_GAMES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("title", { ascending: true });

  if (error || !data || data.length === 0) return MOCK_GAMES;
  return data.map(rowToGame);
}

// Zoek games op titel of alias (accent-ongevoelig, dedupe + relevantie).
// Gebruikt de Postgres-functie search_games (migratie 0003). Lege query →
// lege lijst. Valt terug op een eenvoudige titel-filter over de mock-data
// wanneer Supabase niet geconfigureerd is.
export async function searchCatalogGames(query: string): Promise<Game[]> {
  const q = query.trim();
  if (!q) return [];

  if (!isConfigured) {
    const needle = q.toLowerCase();
    return MOCK_GAMES.filter((g) => g.title.toLowerCase().includes(needle));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_games", {
    search_query: q,
  });

  if (error || !data) return [];
  return (data as unknown[]).map(rowToGame);
}

// Eén game op slug. null als niet gevonden.
export async function getCatalogGameBySlug(slug: string): Promise<Game | null> {
  if (!isConfigured) {
    return MOCK_GAMES.find((g) => (g.slug ?? g.id) === slug) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return rowToGame(data);
}
