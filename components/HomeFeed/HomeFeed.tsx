"use client";

import { useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import GameCard from "@/components/GameCard/GameCard";
import ActivityFeed from "@/components/ActivityFeed/ActivityFeed";
import QuickUpdate from "@/components/QuickUpdate/QuickUpdate";
import type { Game } from "@/lib/games";
import type { ActivityItem } from "@/lib/activity-types";
import type { Review } from "@/lib/reviews";
import "./HomeFeed.css";

export interface HomeFeedStats {
  activePlaythroughs: number;
  hoursLogged: number;
  completed: number;
  reviews: number;
}

interface HomeFeedProps {
  displayName: string;
  stats: HomeFeedStats;
  activeGames: Game[];
  suggestedGames: Game[];
  activity: ActivityItem[];
  activityScope: "following" | "you" | "empty";
  reviews: Review[];
}

export default function HomeFeed({
  displayName,
  stats,
  activeGames,
  suggestedGames,
  activity,
  activityScope,
  reviews,
}: HomeFeedProps) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".feed-welcome", {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: "power2.out",
      });
      gsap.from(".feed-section", {
        opacity: 0,
        y: 20,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.08,
        delay: 0.15,
      });
    });
    return () => ctx.revert();
  }, []);

  const activityEmpty =
    activityScope === "you"
      ? "Follow other players to see their activity here. For now, this is your recent activity."
      : "No activity yet. Start tracking a game or follow other players.";

  return (
    <div className="home-feed">
      {/* Welcome header */}
      <header className="feed-welcome">
        <div className="feed-welcome__text">
          <h1 className="feed-welcome__title">
            Welcome back, <span className="gradient-text">{displayName}</span>
          </h1>
          <p className="feed-welcome__sub">Here&apos;s what&apos;s been happening</p>
        </div>
        <div className="feed-stats">
          <div className="feed-stat">
            <span className="feed-stat__value">{stats.activePlaythroughs}</span>
            <span className="feed-stat__label">Playing</span>
          </div>
          <div className="feed-stat">
            <span className="feed-stat__value">{stats.hoursLogged}h</span>
            <span className="feed-stat__label">Logged</span>
          </div>
          <div className="feed-stat">
            <span className="feed-stat__value">{stats.completed}</span>
            <span className="feed-stat__label">Completed</span>
          </div>
          <div className="feed-stat">
            <span className="feed-stat__value">{stats.reviews}</span>
            <span className="feed-stat__label">Reviews</span>
          </div>
        </div>
      </header>

      {/* Two-column body */}
      <div className="feed-body">
        {/* Primary column */}
        <div className="feed-primary">
          {/* Active playthroughs */}
          <section className="feed-section">
            <div className="feed-section-header">
              <h2 className="feed-section-title">Active Playthroughs</h2>
              <Link href="/dashboard" className="feed-section-link">
                See all →
              </Link>
            </div>
            {activeGames.length === 0 ? (
              <p className="feed-empty">
                You&apos;re not playing anything right now.{" "}
                <Link href="/games" className="feed-section-link">
                  Browse the library →
                </Link>
              </p>
            ) : (
              <div className="feed-active-grid">
                {activeGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    variant="default"
                    href={`/games/${game.slug ?? game.id}`}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Quick update */}
          {activeGames.length > 0 && <QuickUpdate games={activeGames} />}

          {/* Suggested games (your "want to play") */}
          {suggestedGames.length > 0 && (
            <section className="feed-section">
              <div className="feed-section-header">
                <h2 className="feed-section-title">Up Next</h2>
                <Link href="/games" className="feed-section-link">
                  Browse →
                </Link>
              </div>
              <div className="feed-compact-grid">
                {suggestedGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    variant="compact"
                    href={`/games/${game.slug ?? game.id}`}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Secondary column */}
        <div className="feed-secondary">
          <ActivityFeed items={activity} emptyText={activityEmpty} />

          {/* Recent community reviews */}
          {reviews.length > 0 && (
            <section className="feed-section">
              <div className="feed-section-header">
                <h2 className="feed-section-title">Recent Reviews</h2>
                <Link href="/reviews" className="feed-section-link">
                  See all →
                </Link>
              </div>
              <div className="feed-reviews">
                {reviews.map((r) => (
                  <Link
                    key={r.id}
                    href={`/reviews/${r.id}`}
                    className="review-preview-card"
                  >
                    <div className="review-preview-card__header">
                      <div className={`review-preview-card__dot ${r.gradientClass}`} />
                      <span className="review-preview-card__game">{r.gameTitle}</span>
                      <span className="review-preview-card__rating">{r.rating}/10</span>
                    </div>
                    <p className="review-preview-card__excerpt">
                      &ldquo;{r.body}&rdquo;
                    </p>
                    <span className="review-preview-card__time">
                      by {r.author} · {r.relativeTime}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
