import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlaythroughManager from "@/components/PlaythroughManager/PlaythroughManager";
import { getSessionUser } from "@/lib/auth";
import {
  getPlaythroughById,
  getPlaythroughUpdates,
  effectiveProgress,
  formatMinutes,
  GOAL_LABELS,
  STATUS_LABELS,
  DB_TO_UI_STATUS,
  type PlaythroughUpdate,
} from "@/lib/playthroughs";
import "./page.css";

export const metadata: Metadata = {
  title: "Playthrough",
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

// Bouwt de korte beschrijving van één timeline-event.
function eventLine(u: PlaythroughUpdate): string {
  const parts: string[] = [];
  if (u.minutesAdded && u.minutesAdded > 0) {
    parts.push(`+${formatMinutes(u.minutesAdded)}`);
  }
  if (u.playedMinutes !== null) {
    parts.push(`now ${formatMinutes(u.playedMinutes)}`);
  }
  if (u.newStatus && u.newStatus !== u.previousStatus) {
    parts.push(`→ ${STATUS_LABELS[u.newStatus]}`);
  }
  const pct =
    u.manualProgressPercent ?? u.estimatedProgressPercent ?? null;
  if (pct !== null) parts.push(`±${pct}%`);
  return parts.join(" · ");
}

export default async function PlaythroughPage({ params }: PageProps) {
  const { id } = await params;

  const [session, playthrough] = await Promise.all([
    getSessionUser(),
    getPlaythroughById(id),
  ]);
  if (!playthrough) notFound();

  const updates = await getPlaythroughUpdates(id);
  const isOwner = !!session && session.id === playthrough.userId;
  const progress = effectiveProgress(playthrough);
  const game = playthrough.game;

  return (
    <div className="pt-page">
      <Link href={isOwner ? "/dashboard" : "/games"} className="pt-page__back">
        ← Back
      </Link>

      {/* Header */}
      <header className="pt-page__header">
        <div className={`pt-page__cover ${game?.gradientClass ?? ""}`}>
          {game?.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={game.coverUrl} alt={game.title} className="pt-page__cover-img" />
          ) : (
            <span className="pt-page__cover-label">{game?.title}</span>
          )}
        </div>

        <div className="pt-page__info">
          <div className="pt-page__eyebrow">
            <span className={`pill pill-${DB_TO_UI_STATUS[playthrough.status]}`}>
              {STATUS_LABELS[playthrough.status]}
            </span>
            {playthrough.goalType && (
              <span className="pill pill-surface">{GOAL_LABELS[playthrough.goalType]}</span>
            )}
          </div>

          {game ? (
            <Link href={`/games/${game.slug}`} className="pt-page__title-link">
              <h1 className="pt-page__title">{game.title}</h1>
            </Link>
          ) : (
            <h1 className="pt-page__title">Unknown game</h1>
          )}

          {playthrough.runName && (
            <p className="pt-page__run">{playthrough.runName}</p>
          )}

          <div className="pt-page__pills">
            <span className="pill pill-surface">▶ {formatMinutes(playthrough.playedMinutes)}</span>
            {progress !== null && (
              <span className="pill pill-surface">
                {playthrough.status === "completed" ? "100% complete" : `~${progress}%`}
              </span>
            )}
          </div>

          {progress !== null && (
            <div className="pt-page__bar">
              <div className="pt-page__bar-fill" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      </header>

      <div className="pt-page__body">
        {/* Manage (owner only) */}
        {isOwner && (
          <section className="pt-page__section">
            <h2 className="feed-section-title">Manage</h2>
            <PlaythroughManager
              id={playthrough.id}
              status={playthrough.status}
              manualProgress={playthrough.manualProgressPercent}
            />
          </section>
        )}

        {/* Timeline */}
        <section className="pt-page__section">
          <h2 className="feed-section-title">Timeline</h2>
          {updates.length === 0 ? (
            <p className="pt-page__empty">No updates yet.</p>
          ) : (
            <ul className="pt-timeline">
              {updates.map((u) => (
                <li key={u.id} className="pt-timeline__item">
                  <span className="pt-timeline__date">{formatDate(u.createdAt)}</span>
                  <div className="pt-timeline__content">
                    {eventLine(u) && (
                      <span className="pt-timeline__line">{eventLine(u)}</span>
                    )}
                    {u.progressNote && (
                      <span className="pt-timeline__note">{u.progressNote}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
