import Link from "next/link";
import ButtonIcon from "@/components/ButtonIcon/ButtonIcon";
import type { Game } from "@/lib/games";
import "./GameDetailHero.css";

interface GameDetailHeroProps {
  game: Game;
}

// Progress copy — estimates are always framed as approximate (see fases.md §3).
function progressLabel(game: Game): string | null {
  if (!game.status) return null; // catalogusgame zonder playthrough
  if (game.status === "completed") return "100% complete";
  if (game.status === "want") return "Not started";
  if ((game.progressPercent ?? 0) > 0) {
    return `~${game.progressPercent}% · estimated`;
  }
  return null;
}

export default function GameDetailHero({ game }: GameDetailHeroProps) {
  const progress = progressLabel(game);
  const ctaLabel =
    game.status && game.status !== "want" && game.playtime
      ? "Continue playthrough"
      : "Start playthrough";

  return (
    <div className="game-detail">
      {/* Full-bleed blurred backdrop derived from the cover gradient */}
      <div className="game-detail__bg" aria-hidden="true">
        <div className={`game-detail__bg-fill ${game.gradientClass}`} />
      </div>

      <div className="game-detail__inner">
        <Link href="/games" className="game-detail__back">
          <span aria-hidden="true">←</span> Library
        </Link>

        <div className="game-hero">
          {/* Cover */}
          <div className="game-hero__cover-wrap">
            <div className={`game-hero__cover ${game.gradientClass}`}>
              <span className="game-hero__cover-label">{game.title}</span>
            </div>
          </div>

          {/* Info */}
          <div className="game-hero__info">
            <div className="game-hero__eyebrow">
              {game.status && game.statusLabel && (
                <span className={`pill pill-${game.status}`}>{game.statusLabel}</span>
              )}
              <span className="game-hero__platform">{game.platform}</span>
            </div>

            <h1 className="game-hero__title">{game.title}</h1>

            <p className="game-hero__meta">
              {game.genre} · {game.releaseYear}
              {game.developer && <> · {game.developer}</>}
            </p>

            {/* Stat pills */}
            <div className="game-hero__pills">
              {game.playtime && (
                <span className="pill pill-surface">▶ {game.playtime}</span>
              )}
              {progress && <span className="pill pill-surface">{progress}</span>}
              {typeof game.rating === "number" && (
                <span className="pill pill-surface">★ {game.rating}/10</span>
              )}
              {game.averagePlaytime && (
                <span className="pill pill-surface">
                  Avg {game.averagePlaytime}
                </span>
              )}
            </div>

            {/* Progress bar (only when there is meaningful progress) */}
            {(game.progressPercent ?? 0) > 0 && game.status && game.status !== "want" && (
              <div className="game-hero__progress">
                <div
                  className="game-hero__progress-track"
                  role="progressbar"
                  aria-valuenow={game.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Estimated progress"
                >
                  <div
                    className="game-hero__progress-bar"
                    style={{ width: `${game.progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* CTAs — prototype links; real start-playthrough flow comes later */}
            <div className="game-hero__actions">
              <ButtonIcon href="#playthrough" label={ctaLabel} variant="primary" />
              <ButtonIcon href="/games" label="Browse Library" variant="secondary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
