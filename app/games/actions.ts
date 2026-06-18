"use server";

import { getCatalogPage } from "@/lib/catalog";
import type { Game } from "@/lib/games";

// Volgende pagina van de library — aangeroepen door de "Load more"-knop.
export async function fetchCatalogPage(
  limit: number,
  offset: number
): Promise<Game[]> {
  const { games } = await getCatalogPage(limit, offset);
  return games;
}
