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

export interface CatalogPage {
  games: Game[];
  total: number;
}

// Eén pagina van de catalogus (alfabetisch), plus het totaalaantal. De volledige
// 3DS-catalogus telt duizenden games, dus de library laadt in batches i.p.v.
// alles in één keer. Valt terug op de mock-data zonder env-vars.
export async function getCatalogPage(
  limit: number,
  offset: number
): Promise<CatalogPage> {
  if (!isConfigured) {
    return { games: MOCK_GAMES.slice(offset, offset + limit), total: MOCK_GAMES.length };
  }

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("games")
    .select("*", { count: "exact" })
    .order("title", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    // Fallback naar mock bij een fout, maar alleen op de eerste pagina.
    if (offset === 0) {
      return { games: MOCK_GAMES.slice(0, limit), total: MOCK_GAMES.length };
    }
    return { games: [], total: 0 };
  }
  return { games: data.map(rowToGame), total: count ?? data.length };
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
