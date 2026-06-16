import "./page.css";
import ButtonIcon from "@/components/ButtonIcon/ButtonIcon";
import DepthTiles from "@/components/DepthTiles/DepthTiles";
import HomeFeed from "@/components/HomeFeed/HomeFeed";
import HomeAuthPanel from "@/components/HomeAuthPanel/HomeAuthPanel";
import {
  MOCK_USER,
  MOCK_HOME_STATS,
  MOCK_ACTIVITY,
  MOCK_REVIEW_PREVIEWS,
} from "@/lib/homeFeed";

// Temporary demo toggle — replace with Supabase getSession() in Phase 2
const DEMO_SIGNED_IN = false;

export default function HomePage() {
  if (DEMO_SIGNED_IN) {
    return (
      <HomeFeed
        user={MOCK_USER}
        stats={MOCK_HOME_STATS}
        activity={MOCK_ACTIVITY}
        reviews={MOCK_REVIEW_PREVIEWS}
      />
    );
  }

  return (
    <div className="home home--logged-out">
      <div className="home-split">
        {/* Left column — hero + public content */}
        <div className="home-split__left">
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
              Log your games, track playtime, see estimated progress and share
              your journey — all in one smooth place.
            </p>
            <div className="home-hero-actions">
              <ButtonIcon href="/register" label="Get Started" variant="primary" />
              <ButtonIcon href="/games" label="Browse Games" variant="secondary" />
            </div>
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
          <div className="home-review-snippets">
            <h3 className="home-snippets-title">Community Reviews</h3>
            {MOCK_REVIEW_PREVIEWS.slice(0, 2).map((r) => (
              <div key={r.id} className="home-review-snippet">
                <div className={`home-review-snippet__dot ${r.gradientClass}`} />
                <div className="home-review-snippet__body">
                  <div className="home-review-snippet__meta">
                    <span className="home-review-snippet__game">{r.gameTitle}</span>
                    <span className="home-review-snippet__rating">{r.rating}/10</span>
                  </div>
                  <p className="home-review-snippet__text">&ldquo;{r.excerpt}&rdquo;</p>
                  <span className="home-review-snippet__author">
                    by {r.author} · {r.relativeTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — auth panel */}
        <div className="home-split__right">
          <HomeAuthPanel />
        </div>
      </div>
    </div>
  );
}
