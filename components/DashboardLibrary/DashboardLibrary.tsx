"use client";

import { useState, useEffect } from "react";
import gsap from "gsap";
import GameCard from "@/components/GameCard/GameCard";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import {
  STATUS_GROUPS,
  groupGamesByStatus,
  type Game,
  type GameStatus,
} from "@/lib/games";
import "./DashboardLibrary.css";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  ...STATUS_GROUPS.map((g) => ({ value: g.status, label: g.label })),
];

// Friendly empty-state copy per status group.
const EMPTY_COPY: Record<GameStatus, string> = {
  playing: "Nothing in progress yet — start a playthrough from your library.",
  paused: "No paused games. Take a break whenever you need one.",
  want: "Your backlog is empty. Browse the library to add games you want to play.",
  completed: "No completed games yet — your first finish is on its way.",
  dropped: "No dropped games. Nice, you finish what you start!",
};

interface DashboardLibraryProps {
  games: Game[];
}

export default function DashboardLibrary({ games }: DashboardLibraryProps) {
  const [filter, setFilter] = useState("all");

  const grouped = groupGamesByStatus(games);
  const visibleGroups =
    filter === "all"
      ? STATUS_GROUPS
      : STATUS_GROUPS.filter((g) => g.status === filter);

  // Gentle entrance on mount and whenever the filter changes.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".dashboard-group", {
        opacity: 0,
        y: 18,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.06,
      });
    });
    return () => ctx.revert();
  }, [filter]);

  return (
    <section className="dashboard-library">
      <div className="dashboard-library__controls">
        <ToggleSwitch
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className="dashboard-groups">
        {visibleGroups.map((group) => {
          const groupGames = grouped[group.status];
          return (
            <section
              key={group.status}
              className="dashboard-group feed-section"
            >
              <div className="feed-section-header">
                <h2 className="feed-section-title">
                  {group.label}
                  <span className="dashboard-group__count">
                    {groupGames.length}
                  </span>
                </h2>
              </div>

              {groupGames.length === 0 ? (
                <p className="dashboard-group__empty">
                  {EMPTY_COPY[group.status]}
                </p>
              ) : (
                <div className="dashboard-group__grid">
                  {groupGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      href={`/games/${game.id}`}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
