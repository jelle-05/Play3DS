import Link from "next/link";
import type { Game } from "@/lib/games";
import "./GameCard.css";

interface GameCardProps {
  game: Game;
  href?: string;
  variant?: "default" | "compact";
}

export default function GameCard({ game, href, variant = "default" }: GameCardProps) {
  const inner = (
    <>
      <div className={`game-card-cover ${game.gradientClass}`}>
        <span className="game-card-cover-label">{game.title}</span>
      </div>
      <div className="game-card-info">
        <p className="game-card-title">{game.title}</p>
        <p className="game-card-meta">
          {game.genre} · {game.releaseYear}
        </p>
        <div className="game-card-pills">
          <span className={`pill pill-${game.status}`}>{game.statusLabel}</span>
          {game.playtime && (
            <span className="pill pill-surface">{game.playtime}</span>
          )}
        </div>
        {game.progressPercent > 0 && game.status !== "want" && (
          <div className="game-card-progress" role="progressbar" aria-valuenow={game.progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="game-card-progress-bar"
              style={{ width: `${game.progressPercent}%` }}
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
