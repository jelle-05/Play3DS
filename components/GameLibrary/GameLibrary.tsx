"use client";

import { useState } from "react";
import type { Game } from "@/lib/games";
import GameGrid from "@/components/GameGrid/GameGrid";
import { fetchCatalogPage } from "@/app/games/actions";
import "./GameLibrary.css";

interface GameLibraryProps {
  initialGames: Game[];
  total: number;
  pageSize: number;
}

// Library met "Load more" — laadt de catalogus in batches zodat niet alle
// duizenden kaarten in één keer renderen. De GameGrid (incl. layout-toggle)
// krijgt de groeiende lijst en pikt nieuwe kaarten vanzelf op.
export default function GameLibrary({ initialGames, total, pageSize }: GameLibraryProps) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const hasMore = games.length < total;

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const next = await fetchCatalogPage(pageSize, games.length);
      setGames((prev) => [...prev, ...next]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="game-library">
      <GameGrid games={games} title="All Games" />

      <div className="game-library__footer">
        <p className="game-library__count">
          Showing {games.length} of {total} games
        </p>
        {hasMore && (
          <button
            type="button"
            className="game-library__more"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        )}
        {error && (
          <p className="game-library__error">Could not load more — try again.</p>
        )}
      </div>
    </div>
  );
}
