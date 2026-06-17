"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Game } from "@/lib/games";
import "./QuickUpdate.css";

const TIME_OPTIONS = [
  { label: "+30 min", minutes: 30 },
  { label: "+1h", minutes: 60 },
  { label: "+2h", minutes: 120 },
];

interface QuickUpdateProps {
  games: Game[];
}

export default function QuickUpdate({ games }: QuickUpdateProps) {
  const [selectedId, setSelectedId] = useState(games[0]?.id ?? "");
  const [addedMinutes, setAddedMinutes] = useState(0);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const selectedGame = games.find((g) => g.id === selectedId);

  function handleAddTime(minutes: number) {
    setAddedMinutes((prev) => prev + minutes);
  }

  function handleSave() {
    setSaved(true);
    setAddedMinutes(0);
    timerRef.current = setTimeout(() => setSaved(false), 2000);
  }

  if (games.length === 0) {
    return (
      <section className="quick-update feed-section">
        <div className="feed-section-header">
          <h2 className="feed-section-title">Quick Update</h2>
        </div>
        <p className="quick-update__empty">
          No active playthroughs.{" "}
          <Link href="/games" className="quick-update__link">
            Start one →
          </Link>
        </p>
      </section>
    );
  }

  const addedDisplay =
    addedMinutes === 0
      ? null
      : addedMinutes < 60
      ? `+${addedMinutes}m`
      : `+${Math.floor(addedMinutes / 60)}h${addedMinutes % 60 > 0 ? ` ${addedMinutes % 60}m` : ""}`;

  return (
    <section className="quick-update feed-section">
      <div className="feed-section-header">
        <h2 className="feed-section-title">Quick Update</h2>
        {/* Prototype notice — real save flow comes in Phase 1.4 */}
        <span className="quick-update__badge">Demo</span>
      </div>

      <div className="quick-update__panel">
        {/* Game selector */}
        <div className="quick-update__game-picker" role="group" aria-label="Select game">
          {games.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`quick-update__game-pill${g.id === selectedId ? " quick-update__game-pill--active" : ""}`}
              onClick={() => {
                setSelectedId(g.id);
                setAddedMinutes(0);
                setSaved(false);
              }}
            >
              <span className={`quick-update__game-dot ${g.gradientClass}`} />
              {g.title}
            </button>
          ))}
        </div>

        {/* Playtime row */}
        <div className="quick-update__time-row">
          <div className="quick-update__current-time">
            <span className="quick-update__time-label">Current</span>
            <span className="quick-update__time-value">
              {selectedGame?.playtime ?? "—"}
              {addedDisplay && (
                <span className="quick-update__time-added">{addedDisplay}</span>
              )}
            </span>
          </div>
          <div className="quick-update__time-btns" role="group" aria-label="Add playtime">
            {TIME_OPTIONS.map(({ label, minutes }) => (
              <button
                key={label}
                type="button"
                className="quick-update__time-btn"
                onClick={() => handleAddTime(minutes)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          className={`quick-update__save${saved ? " quick-update__save--saved" : ""}`}
          onClick={handleSave}
          disabled={addedMinutes === 0 && !saved}
        >
          {saved ? "Saved!" : "Save update"}
        </button>
      </div>
    </section>
  );
}
