"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import type { Game } from "@/lib/games";
import GameCard from "@/components/GameCard/GameCard";
import "./GameGrid.css";

interface GameGridProps {
  games: Game[];
  title?: string;
}

/* ── Osmo Supply: Layout Grid Flip ────────────────────────────────────
   Broncode uit osmo_components/layout_grid_flip.txt.
   data-attributen en animatielogica zijn ongewijzigd.
   window.ScrollTrigger en window.lenis worden niet gebruikt.            */
function initGridLayoutFlip() {
  const groups = document.querySelectorAll("[data-layout-group]");
  const ACTIVE_CLASS = "is--active";

  groups.forEach((group) => {
    let activeTween: gsap.core.Timeline | null = null;

    const buttons = group.querySelectorAll("[data-layout-button]");
    const grid = group.querySelector("[data-layout-grid]");
    const collection = group.querySelector("[data-layout-grid-collection]");
    if (!buttons.length || !grid || !collection) return;

    buttons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.classList.contains(ACTIVE_CLASS)))
    );

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetLayout = btn.getAttribute("data-layout-button");
        const currentLayout = group.getAttribute("data-layout-status");
        if (currentLayout === targetLayout) return;

        if (activeTween) { activeTween.kill(); activeTween = null; }

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          group.setAttribute("data-layout-status", targetLayout!);
          buttons.forEach((b) => {
            const isActive = b === btn;
            b.classList.toggle(ACTIVE_CLASS, isActive);
            b.setAttribute("aria-pressed", String(isActive));
          });
          return;
        }

        const items = grid.querySelectorAll("[data-layout-grid-item]");
        const state = Flip.getState(items, { simple: true });

        collection.getBoundingClientRect();
        const prevH = (collection as HTMLElement).offsetHeight;

        group.setAttribute("data-layout-status", targetLayout!);
        buttons.forEach((b) => {
          const isActive = b === btn;
          b.classList.toggle(ACTIVE_CLASS, isActive);
          b.setAttribute("aria-pressed", String(isActive));
        });

        collection.getBoundingClientRect();
        const nextH = (collection as HTMLElement).offsetHeight;

        gsap.set(collection, { height: prevH });

        const tl = gsap.timeline({
          onStart: () => {
            group.setAttribute("data-transitioning", "true");
          },
          onInterrupt: () => {
            group.removeAttribute("data-transitioning");
            gsap.set(collection, { clearProps: "height" });
          },
          onComplete: () => {
            group.removeAttribute("data-transitioning");
            gsap.set(collection, { clearProps: "height" });
            activeTween = null;
          },
        });

        tl
          .add(
            Flip.from(state, {
              duration: 0.65,
              ease: "power4.inOut",
              absolute: true,
              nested: true,
              prune: true,
              stagger:
                targetLayout === "large"
                  ? { each: 0.03, from: "end" }
                  : { each: 0.03, from: "start" },
            }),
            0
          )
          .to(collection, { height: nextH, duration: 0.65, ease: "power4.inOut" }, 0);

        activeTween = tl;
      });
    });
  });
}

export default function GameGrid({ games, title = "All Games" }: GameGridProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    gsap.registerPlugin(Flip);
    initGridLayoutFlip();
  }, []);

  return (
    <div data-layout-status="large" data-layout-group="" className="game-grid-wrap">
      {/* Header met layout-toggle */}
      <div className="game-grid-header">
        <h2 className="game-grid-title">{title}</h2>
        <div className="layout-buttons">
          <button
            data-layout-button="large"
            className="layout-btn is--active"
            aria-label="Large grid view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" className="layout-btn__icon" aria-hidden="true">
              <rect x="1" y="1" width="3.33" height="3.33" fill="currentColor" />
              <rect x="1" y="7.67" width="3.33" height="3.33" fill="currentColor" />
              <rect x="7.67" y="1" width="3.33" height="3.33" fill="currentColor" />
              <rect x="7.67" y="7.67" width="3.33" height="3.33" fill="currentColor" />
            </svg>
            <span>Comfort</span>
          </button>
          <button
            data-layout-button="small"
            className="layout-btn"
            aria-label="Compact grid view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" className="layout-btn__icon" aria-hidden="true">
              <rect x="1" y="1" width="2.5" height="2.5" fill="currentColor" />
              <rect x="4.75" y="1" width="2.5" height="2.5" fill="currentColor" />
              <rect x="8.5" y="1" width="2.5" height="2.5" fill="currentColor" />
              <rect x="1" y="4.75" width="2.5" height="2.5" fill="currentColor" />
              <rect x="4.75" y="4.75" width="2.5" height="2.5" fill="currentColor" />
              <rect x="8.5" y="4.75" width="2.5" height="2.5" fill="currentColor" />
              <rect x="1" y="8.5" width="2.5" height="2.5" fill="currentColor" />
              <rect x="4.75" y="8.5" width="2.5" height="2.5" fill="currentColor" />
              <rect x="8.5" y="8.5" width="2.5" height="2.5" fill="currentColor" />
            </svg>
            <span>Compact</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div data-layout-grid="" className="layout-grid">
        <div data-layout-grid-collection="" className="layout-grid__collection">
          <div data-layout-grid-list="" className="layout-grid__list">
            {games.map((game) => (
              <div key={game.id} data-layout-grid-item="" className="layout-grid__item">
                <GameCard
                  game={game}
                  variant={undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
