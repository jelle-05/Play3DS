"use client";

import { useState } from "react";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import GameGrid from "@/components/GameGrid/GameGrid";
import { MOCK_GAMES } from "@/lib/games";
import "./LibraryFilter.css";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "playing", label: "Playing" },
  { value: "completed", label: "Completed" },
  { value: "paused", label: "Paused" },
];

export default function LibraryFilter() {
  const [activeStatus, setActiveStatus] = useState("all");

  const filtered =
    activeStatus === "all"
      ? MOCK_GAMES
      : MOCK_GAMES.filter((g) => g.status === activeStatus);

  return (
    <section className="library-filter">
      <div className="home-section-header">
        <h2 className="home-section-title">Your Library</h2>
        <span className="home-section-sub">
          {filtered.length} game{filtered.length !== 1 ? "s" : ""}
        </span>
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
        <GameGrid games={filtered} hideTitle />
      )}
    </section>
  );
}
