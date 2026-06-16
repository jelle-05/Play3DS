import "./page.css";

const SAMPLE_GAMES = [
  {
    title: "Zelda: Ocarina of Time 3D",
    gradient: "game-card-cover--purple",
    status: "playing",
    statusLabel: "Playing",
    playtime: "24h 30m",
  },
  {
    title: "Pokémon X",
    gradient: "game-card-cover--mint",
    status: "completed",
    statusLabel: "Completed",
    playtime: "65h 12m",
  },
  {
    title: "Fire Emblem Awakening",
    gradient: "game-card-cover--warm",
    status: "paused",
    statusLabel: "Paused",
    playtime: "18h 45m",
  },
  {
    title: "Animal Crossing: New Leaf",
    gradient: "game-card-cover--pink",
    status: "want",
    statusLabel: "Want to Play",
    playtime: null,
  },
];

export default function HomePage() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-eyebrow">
          <span>▶</span> Nintendo 3DS Tracker
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
          <button className="home-hero-cta home-hero-cta--primary">
            Get Started
          </button>
          <button className="home-hero-cta home-hero-cta--secondary">
            Browse Games
          </button>
        </div>
      </section>

      {/* Sample game cards */}
      <section className="home-cards">
        <div className="home-section-header">
          <h2 className="home-section-title">Your Library</h2>
          <span className="home-section-sub">4 games tracked</span>
        </div>
        <div className="home-cards-grid">
          {SAMPLE_GAMES.map((game) => (
            <article key={game.title} className="game-card">
              <div className={`game-card-cover ${game.gradient}`}>
                <span className="game-card-cover-label">{game.title}</span>
              </div>
              <div className="game-card-info">
                <p className="game-card-title">{game.title}</p>
                <p className="game-card-platform">Nintendo 3DS</p>
                <div className="game-card-pills">
                  <span className={`pill pill-${game.status}`}>
                    {game.statusLabel}
                  </span>
                  {game.playtime && (
                    <span className="pill pill-surface">{game.playtime}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Design token preview */}
      <section className="home-tokens">
        <div className="home-section-header">
          <h2 className="home-section-title">Design Tokens</h2>
          <span className="home-section-sub">Phase 1.1 foundation</span>
        </div>
        <div className="token-strip">
          <div className="token-swatch token-swatch--primary" title="--gradient-primary" />
          <div className="token-swatch token-swatch--mint"    title="--gradient-mint" />
          <div className="token-swatch token-swatch--warm"    title="--gradient-warm" />
          <div className="token-swatch token-swatch--pink"    title="--gradient-pink" />
          <div className="token-swatch token-swatch--surface" title="--color-surface" />
        </div>
      </section>
    </div>
  );
}
