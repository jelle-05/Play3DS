import type { Metadata } from "next";
import GameSlider from "@/components/GameSlider/GameSlider";
import GameLibrary from "@/components/GameLibrary/GameLibrary";
import { getCatalogPage } from "@/lib/catalog";
import "./page.css";

export const metadata: Metadata = {
  title: "Game Library",
};

const PAGE_SIZE = 48;

export default async function GamesPage() {
  const { games, total } = await getCatalogPage(PAGE_SIZE, 0);
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
          <span className="pill pill-surface">{total} games</span>
        </div>
      </header>

      {/* Featured slider */}
      {featured.length > 0 && (
        <section className="games-section">
          <GameSlider games={featured} title="Featured" />
        </section>
      )}

      {/* Full library with grid toggle + load more */}
      <section className="games-section">
        <GameLibrary initialGames={games} total={total} pageSize={PAGE_SIZE} />
      </section>
    </div>
  );
}
