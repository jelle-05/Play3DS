"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import GameCard from "@/components/GameCard/GameCard";
import ToggleSwitch from "@/components/ToggleSwitch/ToggleSwitch";
import {
  STATUS_GROUPS,
  groupGamesByStatus,
  type Game,
  type GameStatus,
} from "@/lib/games";
import "./DashboardLibrary.css";

gsap.registerPlugin(Flip);

// useLayoutEffect on the client, useEffect on the server (avoids SSR warning).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface DashboardLibraryProps {
  games: Game[];
}

export default function DashboardLibrary({ games }: DashboardLibraryProps) {
  const [filter, setFilter] = useState("all");
  const rootRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const firstRender = useRef(true);

  const grouped = groupGamesByStatus(games);
  const isActive = (status: GameStatus) =>
    filter === "all" || filter === status;

  // Capture the current layout of all tracked elements *before* React re-renders,
  // so Flip can animate them from their old positions on the next paint.
  function handleFilterChange(next: string) {
    if (next === filter) return;
    const root = rootRef.current;
    if (root && !prefersReducedMotion()) {
      flipState.current = Flip.getState(root.querySelectorAll("[data-flip-id]"));
    }
    setFilter(next);
  }

  useIsoLayoutEffect(() => {
    const root = rootRef.current;

    // First paint: gentle staggered entrance, no Flip yet.
    if (firstRender.current) {
      firstRender.current = false;
      if (root && !prefersReducedMotion()) {
        gsap.from(root.querySelectorAll(".dashboard-card:not(.is-filtered-out)"), {
          opacity: 0,
          y: 16,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.03,
        });
      }
      return;
    }

    // Filter changed: animate the layout switch like the library grid.
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;

    Flip.from(state, {
      duration: 0.55,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      // Cards/headers that appear: fade + scale up.
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }
        ),
      // Cards/headers that disappear: fade + scale down.
      onLeave: (els) =>
        gsap.to(els, {
          opacity: 0,
          scale: 0.6,
          duration: 0.35,
          ease: "power2.in",
        }),
    });
  }, [filter]);

  return (
    <section className="dashboard-library">
      <div className="dashboard-library__controls">
        <ToggleSwitch
          options={FILTER_OPTIONS}
          value={filter}
          onChange={handleFilterChange}
        />
      </div>

      {/* All groups stay mounted; filtering toggles visibility so Flip can
          animate cards in and out instead of them popping. */}
      <div className="dashboard-groups" ref={rootRef}>
        {STATUS_GROUPS.map((group) => {
          const groupGames = grouped[group.status];
          const hidden = isActive(group.status) ? "" : " is-filtered-out";

          return (
            <section key={group.status} className="dashboard-group">
              <div
                className={`dashboard-group__header${hidden}`}
                data-flip-id={`header-${group.status}`}
              >
                <h2 className="feed-section-title">
                  {group.label}
                  <span className="dashboard-group__count">
                    {groupGames.length}
                  </span>
                </h2>
              </div>

              {groupGames.length === 0 ? (
                <p
                  className={`dashboard-group__empty${hidden}`}
                  data-flip-id={`empty-${group.status}`}
                >
                  {EMPTY_COPY[group.status]}
                </p>
              ) : (
                <div className="dashboard-group__grid">
                  {groupGames.map((game) => (
                    <div
                      key={game.id}
                      className={`dashboard-card${hidden}`}
                      data-flip-id={game.id}
                    >
                      <GameCard game={game} href={`/games/${game.slug ?? game.id}`} />
                    </div>
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
