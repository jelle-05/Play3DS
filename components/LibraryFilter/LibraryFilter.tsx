"use client";

import { useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import "./LibraryFilter.css";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "playing", label: "Playing" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

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

export default function LibraryFilter() {
  const [activeStatus, setActiveStatus] = useState("all");

  const filtered =
    activeStatus === "all"
      ? SAMPLE_GAMES
      : SAMPLE_GAMES.filter((g) => g.status === activeStatus);

  return (
    <section className="library-filter">
      <div className="home-section-header">
        <h2 className="home-section-title">Your Library</h2>
        <span className="home-section-sub">{filtered.length} game{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="library-filter__controls">
        <ToggleSwitch
          options={STATUS_OPTIONS}
          value={activeStatus}
          onChange={setActiveStatus}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="library-filter__empty">No games with this status yet.</p>
      ) : (
        <div className="game-grid">
          {filtered.map((game) => (
            <article key={game.title} className="game-card">
              <div className={`game-card-cover ${game.gradient}`}>
                <span className="game-card-cover-label">{game.title}</span>
              </div>
              <div className="game-card-info">
                <p className="game-card-title">{game.title}</p>
                <p className="game-card-platform">Nintendo 3DS</p>
                <div className="game-card-pills">
                  <span className={`pill pill-${game.status}`}>{game.statusLabel}</span>
                  {game.playtime && (
                    <span className="pill pill-surface">{game.playtime}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
