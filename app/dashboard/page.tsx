import type { Metadata } from "next";
import Link from "next/link";
import QuickUpdate from "@/components/QuickUpdate/QuickUpdate";
import DashboardLibrary from "@/components/DashboardLibrary/DashboardLibrary";
import { getSessionUser } from "@/lib/auth";
import { getUserPlaythroughs, playthroughToCard } from "@/lib/playthroughs";
import "./page.css";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUser();

  // Niet ingelogd → uitnodiging om in te loggen.
  if (!user) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div className="dashboard-header__text">
            <h1 className="dashboard-header__title">Dashboard</h1>
            <p className="dashboard-header__sub">
              Track and update your 3DS playthroughs.
            </p>
          </div>
        </header>
        <div className="dashboard-signedout">
          <p className="dashboard-signedout__text">
            Log in to start tracking your playthroughs.
          </p>
          <div className="dashboard-signedout__actions">
            <Link href="/login" className="dashboard-signedout__btn dashboard-signedout__btn--primary">
              Log in
            </Link>
            <Link href="/games" className="dashboard-signedout__btn">
              Browse library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const playthroughs = await getUserPlaythroughs();
  const cards = playthroughs.map(playthroughToCard);
  const activeGames = cards.filter((c) => c.status === "playing");

  const stats = {
    playing: cards.filter((c) => c.status === "playing").length,
    completed: cards.filter((c) => c.status === "completed").length,
    total: cards.length,
    want: cards.filter((c) => c.status === "want").length,
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
          <span className="pill pill-surface">{stats.total} tracked</span>
          <span className="pill pill-want">{stats.want} want to play</span>
        </div>
      </header>

      {cards.length === 0 ? (
        <div className="dashboard-empty">
          <p className="dashboard-empty__text">
            You&apos;re not tracking any games yet.
          </p>
          <Link href="/games" className="dashboard-empty__btn">
            Browse the library →
          </Link>
        </div>
      ) : (
        <>
          {/* Quick update — the core "update in under a minute" element */}
          <div className="dashboard-quick">
            <QuickUpdate games={activeGames} />
          </div>

          {/* Status groups */}
          <DashboardLibrary games={cards} />
        </>
      )}
    </div>
  );
}
