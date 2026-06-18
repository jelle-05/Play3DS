"use client";

import { useState } from "react";
import { startPlaythrough } from "@/app/playthroughs/actions";
import { GOAL_LABELS, type GoalType } from "@/lib/playthrough-types";
import "./StartPlaythrough.css";

interface StartPlaythroughProps {
  gameId: string;
  slug: string;
  hasEstimate: boolean;
  // Labels voor het doel met de bijbehorende gemiddelde speeltijd, indien bekend.
  averageLabel?: string | null;
}

const GOALS: GoalType[] = ["main_story", "main_extras", "completionist", "just_tracking"];

export default function StartPlaythrough({
  gameId,
  slug,
  hasEstimate,
  averageLabel,
}: StartPlaythroughProps) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState<GoalType>(hasEstimate ? "main_story" : "just_tracking");

  if (!open) {
    return (
      <button type="button" className="start-pt__cta" onClick={() => setOpen(true)}>
        ▶ Start playthrough
      </button>
    );
  }

  return (
    <form action={startPlaythrough} className="start-pt">
      <input type="hidden" name="game_id" value={gameId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="goal_type" value={goal} />

      <div className="start-pt__field">
        <span className="start-pt__label">Goal</span>
        <div className="start-pt__goals" role="group" aria-label="Playthrough goal">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              className={`start-pt__goal${g === goal ? " start-pt__goal--active" : ""}`}
              onClick={() => setGoal(g)}
              aria-pressed={g === goal}
            >
              {GOAL_LABELS[g]}
            </button>
          ))}
        </div>
        {goal !== "just_tracking" && (
          <span className="start-pt__hint">
            {hasEstimate
              ? `Progress is estimated from the average playtime${averageLabel ? ` (${averageLabel})` : ""}. You can adjust it anytime.`
              : "No average playtime for this game — you can track time and set progress manually."}
          </span>
        )}
      </div>

      <div className="start-pt__field">
        <span className="start-pt__label">Current playtime (optional)</span>
        <div className="start-pt__time">
          <label className="start-pt__time-input">
            <input name="hours" type="number" min="0" defaultValue="0" inputMode="numeric" />
            <span>h</span>
          </label>
          <label className="start-pt__time-input">
            <input name="minutes" type="number" min="0" max="59" defaultValue="0" inputMode="numeric" />
            <span>m</span>
          </label>
        </div>
      </div>

      <label className="start-pt__field">
        <span className="start-pt__label">Run name (optional)</span>
        <input
          name="run_name"
          className="start-pt__text"
          placeholder="e.g. First playthrough, Nuzlocke…"
          maxLength={80}
        />
      </label>

      <div className="start-pt__actions">
        <button type="submit" className="start-pt__cta start-pt__cta--submit">
          Start tracking
        </button>
        <button type="button" className="start-pt__cancel" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
