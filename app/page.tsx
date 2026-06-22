import "./page.css";
import Link from "next/link";
import ButtonIcon from "@/components/ButtonIcon/ButtonIcon";
import DepthTiles from "@/components/DepthTiles/DepthTiles";
import HomeFeed from "@/components/HomeFeed/HomeFeed";
import { getSessionUser } from "@/lib/auth";
import { getUserPlaythroughs, playthroughToCard } from "@/lib/playthroughs";
import { getProfileStats } from "@/lib/profiles";
import { getHomeActivity } from "@/lib/activity";
import { getRecentReviews } from "@/lib/reviews-db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSessionUser();

  // Ingelogd → persoonlijke app-feed op echte data.
  if (session) {
    const [playthroughs, stats, activity, recentReviews] = await Promise.all([
      getUserPlaythroughs(),
      getProfileStats(session.id),
      getHomeActivity(),
      getRecentReviews(3),
    ]);

    const cards = playthroughs.map(playthroughToCard);
    const activeGames = cards.filter((c) => c.status === "playing");
    const suggestedGames = cards.filter((c) => c.status === "want").slice(0, 4);
    const minutesLogged = playthroughs.reduce(
      (sum, p) => sum + (p.playedMinutes ?? 0),
      0
    );

    return (
      <HomeFeed
        displayName={session.username}
        stats={{
          activePlaythroughs: activeGames.length,
          hoursLogged: Math.floor(minutesLogged / 60),
          completed: stats.completed,
          reviews: stats.reviews,
        }}
        activeGames={activeGames}
        suggestedGames={suggestedGames}
        activity={activity.items}
        activityScope={activity.scope}
        reviews={recentReviews}
      />
    );
  }

  // Niet ingelogd → marketinghome met echte community-reviews.
  const reviews = await getRecentReviews(3);

  return (
    <div className="home home--logged-out">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-eyebrow">
          <span aria-hidden="true">▶</span> Nintendo 3DS Tracker
        </div>
        <h1 className="home-hero-title">
          Track your <span className="gradient-text">3DS playthroughs</span>
          <br />
          fast and easy.
        </h1>
        <p className="home-hero-sub">
          Log your games, track playtime, see estimated progress and share your
          journey — all in one smooth place.
        </p>
        <div className="home-hero-actions">
          <ButtonIcon href="/register" label="Get Started" variant="primary" />
          <ButtonIcon href="/games" label="Browse Games" variant="secondary" />
        </div>
        <p className="home-hero-login">
          Already have an account?{" "}
          <Link href="/login" className="home-hero-login__link">
            Log in
          </Link>
        </p>
      </section>

      {/* Feature pills */}
      <div className="home-feature-pills" role="list">
        {["▶ Playtime tracking", "📊 Progress stats", "⭐ Write reviews", "🎮 Full 3DS library"].map(
          (pill) => (
            <span key={pill} className="home-feature-pill" role="listitem">
              {pill}
            </span>
          )
        )}
      </div>

      {/* Featured games carousel */}
      <section className="home-featured">
        <div className="home-section-header">
          <h2 className="home-section-title">Featured Picks</h2>
          <span className="home-section-sub">Top 3DS games</span>
        </div>
        <DepthTiles />
      </section>

      {/* Public review snippets */}
      {reviews.length > 0 && (
        <div className="home-review-snippets">
          <div className="home-snippets-head">
            <h3 className="home-snippets-title">Community Reviews</h3>
            <Link href="/reviews" className="home-snippets-link">
              View all →
            </Link>
          </div>
          {reviews.map((r) => (
            <Link
              key={r.id}
              href={`/reviews/${r.id}`}
              className="home-review-snippet"
            >
              <div className={`home-review-snippet__dot ${r.gradientClass}`} />
              <div className="home-review-snippet__body">
                <div className="home-review-snippet__meta">
                  <span className="home-review-snippet__game">{r.gameTitle}</span>
                  <span className="home-review-snippet__rating">{r.rating}/10</span>
                </div>
                <p className="home-review-snippet__text">&ldquo;{r.body}&rdquo;</p>
                <span className="home-review-snippet__author">
                  by {r.author} · {r.relativeTime}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
