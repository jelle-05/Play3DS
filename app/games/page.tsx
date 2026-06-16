import type { Metadata } from "next";
import { MOCK_GAMES } from "@/lib/games";
import GameSlider from "@/components/GameSlider/GameSlider";
import GameGrid from "@/components/GameGrid/GameGrid";
import "./page.css";

export const metadata: Metadata = {
  title: "Game Library",
};

export default function GamesPage() {
  const nowPlaying = MOCK_GAMES.filter((g) => g.status === "playing");

  const stats = {
    total: MOCK_GAMES.length,
    playing: MOCK_GAMES.filter((g) => g.status === "playing").length,
    completed: MOCK_GAMES.filter((g) => g.status === "completed").length,
    backlog: MOCK_GAMES.filter((g) => g.status === "want").length,
  };

  return (
    <div className="games-page">
      {/* Page header */}
      <header className="games-header">
        <div className="games-header-text">
          <h1 className="games-header-title">Game Library</h1>
          <p className="games-header-sub">Your Nintendo 3DS collection</p>
        </div>
        <div className="games-stats">
          <span className="pill pill-surface">{stats.total} games</span>
          <span className="pill pill-playing">{stats.playing} playing</span>
          <span className="pill pill-completed">{stats.completed} completed</span>
          <span className="pill pill-want">{stats.backlog} in backlog</span>
        </div>
      </header>

      {/* Now Playing slider */}
      {nowPlaying.length > 0 && (
        <section className="games-section">
          <GameSlider games={nowPlaying} title="Now Playing" />
        </section>
      )}

      {/* Full library with grid toggle */}
      <section className="games-section">
        <GameGrid games={MOCK_GAMES} title="All Games" />
      </section>
    </div>
  );
}
