import type { Metadata } from "next";
import QuickUpdate from "@/components/QuickUpdate/QuickUpdate";
import DashboardLibrary from "@/components/DashboardLibrary/DashboardLibrary";
import { MOCK_GAMES, groupGamesByStatus } from "@/lib/games";
import "./page.css";

export const metadata: Metadata = {
  title: "Dashboard",
};

// Prototype dashboard — mock-data only. Real auth/session comes in Phase 2.
export default function DashboardPage() {
  const grouped = groupGamesByStatus(MOCK_GAMES);
  const activeGames = grouped.playing;

  const stats = {
    playing: grouped.playing.length,
    completed: grouped.completed.length,
    total: MOCK_GAMES.length,
    want: grouped.want.length,
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__text">
          <h1 className="dashboard-header__title">Dashboard</h1>
          <p className="dashboard-header__sub">
            Your central hub to track and update your 3DS playthroughs.
          </p>
        </div>
        <div className="dashboard-stats">
          <span className="pill pill-playing">{stats.playing} playing</span>
          <span className="pill pill-completed">{stats.completed} completed</span>
          <span className="pill pill-surface">{stats.total} games</span>
          <span className="pill pill-want">{stats.want} want to play</span>
        </div>
      </header>

      {/* Quick update — the core "update in under a minute" element */}
      <div className="dashboard-quick">
        <QuickUpdate games={activeGames} />
      </div>

      {/* Status groups */}
      <DashboardLibrary games={MOCK_GAMES} />
    </div>
  );
}
