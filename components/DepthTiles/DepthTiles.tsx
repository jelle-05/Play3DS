"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import "./DepthTiles.css";

export interface DepthTile {
  title: string;
  gradientClass: string;
  status: string;
  statusLabel: string;
  playtime?: string;
}

const DEFAULT_TILES: DepthTile[] = [
  { title: "Zelda: OoT 3D", gradientClass: "depth-tile--purple", status: "playing", statusLabel: "Playing", playtime: "24h 30m" },
  { title: "Pokémon X", gradientClass: "depth-tile--mint", status: "completed", statusLabel: "Completed", playtime: "65h 12m" },
  { title: "Fire Emblem: Awakening", gradientClass: "depth-tile--warm", status: "paused", statusLabel: "Paused", playtime: "18h 45m" },
  { title: "Animal Crossing: New Leaf", gradientClass: "depth-tile--pink", status: "want", statusLabel: "Want to Play" },
];

/* ── Osmo Supply: Depth Tiles Infinite Loop ────────────────────────────
   Broncode uit osmo_components/depth_tiles_infinite_loop.txt.
   data-attributen en animatielogica zijn ongewijzigd.                   */
function initDepthTiles() {
  document.querySelectorAll("[data-depth-tiles-init]").forEach((container) => {
    const list = container.querySelector("[data-depth-tiles-list]");
    const tiles = container.querySelectorAll("[data-depth-tiles-item]");
    const tileCount = tiles.length;
    if (tileCount < 2 || !list) return;

    const xMultiplier = 0.65;
    const backScale = 0.5;
    const backOpacity = 1;
    const backDarkness = 1;
    const sideRotateY = 5;
    const perspective = 75;

    const moveDuration = 1.5;
    const startDelay = 0.5;
    const pauseDuration = 0.125;

    const state = { progress: 0 };

    let isActive = false;
    let isHovering = false;
    let hasStarted = false;
    let stepTimeline: gsap.core.Timeline | null = null;
    let delayedCall: gsap.core.Tween | null = null;
    let startDelayedCall: gsap.core.Tween | null = null;
    let activeTileIndex = -1;

    gsap.set(list as HTMLElement, { perspective: `${perspective}em` });
    gsap.set(tiles as NodeListOf<Element>, {
      transformStyle: "preserve-3d",
      transformPerspective: perspective * 16,
    });

    function getRelativeIndex(index: number) {
      let relative = index - state.progress;
      relative = ((relative + tileCount / 2) % tileCount + tileCount) % tileCount - tileCount / 2;
      return gsap.utils.clamp(-2, 2, relative);
    }

    function getActiveIndex() {
      return ((Math.round(state.progress) % tileCount) + tileCount) % tileCount;
    }

    function updateTileStatus() {
      const currentActiveIndex = getActiveIndex();
      if (currentActiveIndex === activeTileIndex) return;
      activeTileIndex = currentActiveIndex;
      tiles.forEach((tile, index) => {
        tile.setAttribute(
          "data-depth-tiles-item-status",
          index === activeTileIndex ? "active" : "not-active"
        );
      });
    }

    function renderDepth() {
      const tileWidth = (tiles[0] as HTMLElement).offsetWidth;
      const radiusX = tileWidth * xMultiplier;

      updateTileStatus();

      tiles.forEach((tile, index) => {
        const relative = getRelativeIndex(index);
        const angle = (relative / 2) * Math.PI;

        const orbitX = Math.sin(angle) * radiusX;
        const orbitDepth = (Math.cos(angle) + 1) / 2;

        const x = relative <= -2 || relative >= 2 ? 0 : orbitX;
        const scale = gsap.utils.interpolate(backScale, 1, orbitDepth);
        const opacity = gsap.utils.interpolate(backOpacity, 1, orbitDepth);
        const brightness = gsap.utils.interpolate(backDarkness, 1, orbitDepth);
        const rotateY = Math.sin(angle) * -sideRotateY;
        const zIndex = Math.round(gsap.utils.interpolate(1, 1000, orbitDepth));

        gsap.set(tile, {
          x,
          scale,
          opacity,
          rotateY,
          filter: `brightness(${brightness})`,
          zIndex,
        });
      });
    }

    function goToNextTile() {
      if (!isActive || isHovering) return;

      stepTimeline = gsap.timeline({
        paused: true,
        onComplete: () => {
          if (isActive && !isHovering) {
            delayedCall = gsap.delayedCall(pauseDuration, goToNextTile);
          }
        },
      });

      stepTimeline.to(state, {
        progress: state.progress + 1,
        duration: moveDuration,
        ease: "depth",
        onUpdate: renderDepth,
      });

      stepTimeline.play();
    }

    function pauseDepth() {
      isActive = false;
      if (stepTimeline) stepTimeline.pause();
      if (delayedCall) delayedCall.pause();
      if (startDelayedCall) startDelayedCall.pause();
    }

    function playDepth() {
      isActive = true;
      if (isHovering) return;

      if (!hasStarted) {
        hasStarted = true;
        startDelayedCall = gsap.delayedCall(startDelay, goToNextTile);
        return;
      }

      if (stepTimeline && stepTimeline.progress() < 1) {
        stepTimeline.play();
      } else {
        goToNextTile();
      }
    }

    function handleHoverStart() {
      isHovering = true;
      if (delayedCall) delayedCall.pause();
      if (startDelayedCall) startDelayedCall.pause();
    }

    function handleHoverEnd() {
      isHovering = false;
      if (!isActive) return;

      if (!hasStarted) {
        playDepth();
        return;
      }

      if (stepTimeline && stepTimeline.progress() < 1) {
        stepTimeline.play();
      } else {
        goToNextTile();
      }
    }

    list.addEventListener("pointerover", (event) => {
      if (!(event.target as Element).closest("[data-depth-tiles-item]")) return;
      handleHoverStart();
    });

    list.addEventListener("pointerleave", () => {
      handleHoverEnd();
    });

    renderDepth();

    ScrollTrigger.create({
      trigger: container as HTMLElement,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? playDepth() : pauseDepth()),
    });
  });
}

export default function DepthTiles({ tiles = DEFAULT_TILES }: { tiles?: DepthTile[] }) {
  useEffect(() => {
    gsap.registerPlugin(CustomEase, ScrollTrigger);
    CustomEase.create("depth", "M0,0 C0.6,0 0,1 1,1");
    initDepthTiles();

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div data-depth-tiles-init="" className="depth-tiles">
      <div data-depth-tiles-collection="" className="depth-tiles__collection">
        <div data-depth-tiles-list="" className="depth-tiles__list">
          {tiles.map((tile, i) => (
            <div key={i} data-depth-tiles-item="" className="depth-tiles__item">
              <div className={`depth-tile ${tile.gradientClass}`}>
                <div className="depth-tile__cover" aria-hidden="true" />
                <div className="depth-tile__overlay">
                  <p className="depth-tile__title">{tile.title}</p>
                  <div className="depth-tile__pills">
                    <span className={`pill pill-${tile.status}`}>{tile.statusLabel}</span>
                    {tile.playtime && (
                      <span className="pill pill-surface">{tile.playtime}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
