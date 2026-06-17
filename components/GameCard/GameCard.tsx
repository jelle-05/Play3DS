import Link from "next/link";
import type { Game } from "@/lib/games";
import "./GameCard.css";

interface GameCardProps {
  game: Game;
  href?: string;
  variant?: "default" | "compact";
}

export default function GameCard({ game, href, variant = "default" }: GameCardProps) {
  const progress = game.progressPercent ?? 0;
  const hasPills = Boolean(game.status && game.statusLabel) || Boolean(game.playtime);

  const inner = (
    <>
      <div className={`game-card-cover ${game.gradientClass}`}>
        {game.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="game-card-cover-img" src={game.coverUrl} alt={game.title} loading="lazy" />
        ) : (
          <span className="game-card-cover-label">{game.title}</span>
        )}
      </div>
      <div className="game-card-info">
        <p className="game-card-title">{game.title}</p>
        <p className="game-card-meta">
          {game.genre}
          {game.releaseYear > 0 && <> · {game.releaseYear}</>}
        </p>
        {hasPills && (
          <div className="game-card-pills">
            {game.status && game.statusLabel && (
              <span className={`pill pill-${game.status}`}>{game.statusLabel}</span>
            )}
            {game.playtime && (
              <span className="pill pill-surface">{game.playtime}</span>
            )}
          </div>
        )}
        {progress > 0 && game.status && game.status !== "want" && (
          <div className="game-card-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="game-card-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <article className={`game-card game-card--${variant}`}>
        <Link href={href} className="game-card-link">
          {inner}
        </Link>
      </article>
    );
  }

  return (
    <article className={`game-card game-card--${variant}`}>
      {inner}
    </article>
  );
}
