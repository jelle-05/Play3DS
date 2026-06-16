import "./page.css";
import ButtonIcon from "@/components/ButtonIcon/ButtonIcon";
import DepthTiles from "@/components/DepthTiles/DepthTiles";
import LibraryFilter from "@/components/LibraryFilter/LibraryFilter";

export default function HomePage() {
  return (
    <div className="home">
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
      </section>

      {/* Featured games — Depth Tiles carousel (Osmo Supply) */}
      <section className="home-featured">
        <div className="home-section-header">
          <h2 className="home-section-title">Featured Picks</h2>
          <span className="home-section-sub">Top 3DS games</span>
        </div>
        <DepthTiles />
      </section>

      {/* Library — filtered by status (Toggle Switch + game cards) */}
      <LibraryFilter />
    </div>
  );
}
