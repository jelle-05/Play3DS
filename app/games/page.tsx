import type { Metadata } from "next";
import GameSlider from "@/components/GameSlider/GameSlider";
import GameGrid from "@/components/GameGrid/GameGrid";
import { getCatalogGames } from "@/lib/catalog";
import "./page.css";

export const metadata: Metadata = {
  title: "Game Library",
};

export default async function GamesPage() {
  const games = await getCatalogGames();
  const featured = games.slice(0, 8);

  return (
    <div className="games-page">
      {/* Page header */}
      <header className="games-header">
        <div className="games-header-text">
          <h1 className="games-header-title">Game Library</h1>
          <p className="games-header-sub">The Nintendo 3DS catalog</p>
        </div>
        <div className="games-stats">
          <span className="pill pill-surface">{games.length} games</span>
        </div>
      </header>

      {/* Featured slider */}
      {featured.length > 0 && (
        <section className="games-section">
          <GameSlider games={featured} title="Featured" />
        </section>
      )}

      {/* Full library with grid toggle */}
      <section className="games-section">
        <GameGrid games={games} title="All Games" />
      </section>
    </div>
  );
}
