import Link from "next/link";
import StartPlaythrough from "@/components/StartPlaythrough/StartPlaythrough";
import {
  effectiveProgress,
  formatMinutes,
  GOAL_LABELS,
  STATUS_LABELS,
  DB_TO_UI_STATUS,
  type Playthrough,
  type TimeEstimate,
} from "@/lib/playthroughs";
import "./PlaythroughPanel.css";

interface PlaythroughPanelProps {
  gameId: string;
  slug: string;
  isLoggedIn: boolean;
  estimate: TimeEstimate | null;
  playthroughs: Playthrough[];
}

export default function PlaythroughPanel({
  gameId,
  slug,
  isLoggedIn,
  estimate,
  playthroughs,
}: PlaythroughPanelProps) {
  const hasEstimate = !!(
    estimate &&
    (estimate.mainMinutes || estimate.completionistMinutes || estimate.mainExtraMinutes)
  );
  const averageLabel = estimate?.mainMinutes ? formatMinutes(estimate.mainMinutes) : null;

  return (
    <section id="playthrough" className="pt-panel game-detail-section">
      <h2 className="feed-section-title">Your playthrough</h2>

      {!isLoggedIn ? (
        <p className="pt-panel__signin">
          <Link href="/login" className="pt-panel__link">
            Log in
          </Link>{" "}
          to start tracking your playthrough of this game.
        </p>
      ) : (
        <>
          {playthroughs.length > 0 && (
            <ul className="pt-panel__list">
              {playthroughs.map((p) => {
                const progress = effectiveProgress(p);
                return (
                  <li key={p.id} className="pt-card">
                    <div className="pt-card__top">
                      <span className={`pill pill-${DB_TO_UI_STATUS[p.status]}`}>
                        {STATUS_LABELS[p.status]}
                      </span>
                      {p.runName && <span className="pt-card__name">{p.runName}</span>}
                      {p.goalType && (
                        <span className="pt-card__goal">{GOAL_LABELS[p.goalType]}</span>
                      )}
                    </div>
                    <div className="pt-card__meta">
                      <span>▶ {formatMinutes(p.playedMinutes)}</span>
                      {progress !== null && (
                        <span>
                          {p.status === "completed" ? "100% complete" : `~${progress}% · estimated`}
                        </span>
                      )}
                    </div>
                    {progress !== null && (
                      <div className="pt-card__bar">
                        <div className="pt-card__bar-fill" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="pt-panel__start">
            <StartPlaythrough
              gameId={gameId}
              slug={slug}
              hasEstimate={hasEstimate}
              averageLabel={averageLabel}
            />
            {playthroughs.length > 0 && (
              <p className="pt-panel__multi-hint">
                You can keep multiple playthroughs (replay, 100%, challenge run…).
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
