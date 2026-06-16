"use client";

import { useEffect } from "react";
import gsap from "gsap";
import GameCard from "@/components/GameCard/GameCard";
import ActivityFeed from "@/components/ActivityFeed/ActivityFeed";
import QuickUpdate from "@/components/QuickUpdate/QuickUpdate";
import { MOCK_GAMES } from "@/lib/games";
import type { MockUser, HomeStats, ActivityItem, ReviewPreview } from "@/lib/homeFeed";
import "./HomeFeed.css";

interface HomeFeedProps {
  user: MockUser;
  stats: HomeStats;
  activity: ActivityItem[];
  reviews: ReviewPreview[];
}

const ACTIVE_GAMES = MOCK_GAMES.filter((g) => g.status === "playing");
const SUGGESTED_GAMES = MOCK_GAMES.filter((g) => g.status === "want").slice(0, 4);

export default function HomeFeed({ user, stats, activity, reviews }: HomeFeedProps) {
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

  return (
    <div className="home-feed">
      {/* Welcome header */}
      <header className="feed-welcome">
        <div className="feed-welcome__text">
          <h1 className="feed-welcome__title">
            Welcome back,{" "}
            <span className="gradient-text">{user.displayName}</span>
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
              <a href="/games" className="feed-section-link">
                See all →
              </a>
            </div>
            <div className="feed-active-grid">
              {ACTIVE_GAMES.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  variant="default"
                  href={`/games/${game.id}`}
                />
              ))}
            </div>
          </section>

          {/* Quick update */}
          <QuickUpdate games={ACTIVE_GAMES} />

          {/* Suggested games */}
          {SUGGESTED_GAMES.length > 0 && (
            <section className="feed-section">
              <div className="feed-section-header">
                <h2 className="feed-section-title">Suggested for You</h2>
                <a href="/games" className="feed-section-link">
                  Browse →
                </a>
              </div>
              <div className="feed-compact-grid">
                {SUGGESTED_GAMES.map((game) => (
                  <GameCard key={game.id} game={game} variant="compact" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Secondary column */}
        <div className="feed-secondary">
          <ActivityFeed items={activity} />

          {/* Review previews */}
          <section className="feed-section">
            <div className="feed-section-header">
              <h2 className="feed-section-title">Recent Reviews</h2>
            </div>
            <div className="feed-reviews">
              {reviews.map((r) => (
                <div key={r.id} className="review-preview-card">
                  <div className="review-preview-card__header">
                    <div
                      className={`review-preview-card__dot ${r.gradientClass}`}
                    />
                    <span className="review-preview-card__game">{r.gameTitle}</span>
                    <span className="review-preview-card__rating">{r.rating}/10</span>
                  </div>
                  <p className="review-preview-card__excerpt">&ldquo;{r.excerpt}&rdquo;</p>
                  <span className="review-preview-card__time">{r.relativeTime}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
