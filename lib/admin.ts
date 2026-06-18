import { createClient } from "@/lib/supabase/server";

// Admin-queries — rauwe rijen uit de games-/alias-tabellen (id-gebaseerd,
// i.t.t. lib/catalog.ts dat op de publieke app-Game mapt). RLS staat schrijven
// alleen toe voor admins (games_admin_write / aliases_admin_write).

export interface AdminGameRow {
  id: string;
  title: string;
  slug: string;
  platform: string | null;
  release_year: number | null;
  genre: string | null;
  developer: string | null;
  publisher: string | null;
  cover_url: string | null;
  description: string | null;
  metadata_status: "basic" | "enriched" | "verified";
}

export interface AliasRow {
  id: string;
  alias: string;
  region: string | null;
}

const GAME_COLUMNS =
  "id, title, slug, platform, release_year, genre, developer, publisher, cover_url, description, metadata_status";

export async function getAdminGames(): Promise<AdminGameRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS)
    .order("title", { ascending: true });
  if (error || !data) return [];
  return data as AdminGameRow[];
}

export async function getAdminGameById(id: string): Promise<AdminGameRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as AdminGameRow;
}

export async function getAliasesForGame(gameId: string): Promise<AliasRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_aliases")
    .select("id, alias, region")
    .eq("game_id", gameId)
    .order("alias", { ascending: true });
  if (error || !data) return [];
  return data as AliasRow[];
}
