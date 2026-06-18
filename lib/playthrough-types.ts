// Pure types, constants en helpers voor playthroughs — GEEN server-imports
// (geen next/headers / Supabase), zodat zowel client- als server-componenten
// dit veilig kunnen importeren. De server-queries staan in lib/playthroughs.ts.

import type { Game, GameStatus } from "@/lib/games";

export type PlaythroughStatus =
  | "want_to_play"
  | "playing"
  | "paused"
  | "completed"
  | "dropped";

export type GoalType =
  | "main_story"
  | "main_extras"
  | "completionist"
  | "just_tracking";

export const GOAL_LABELS: Record<GoalType, string> = {
  main_story: "Main story",
  main_extras: "Main + extras",
  completionist: "100%",
  just_tracking: "Just tracking",
};

// DB-status → UI-status (lib/games gebruikt "want" i.p.v. "want_to_play").
export const DB_TO_UI_STATUS: Record<PlaythroughStatus, GameStatus> = {
  want_to_play: "want",
  playing: "playing",
  paused: "paused",
  completed: "completed",
  dropped: "dropped",
};

export const STATUS_LABELS: Record<PlaythroughStatus, string> = {
  want_to_play: "Want to Play",
  playing: "Playing",
  paused: "Paused",
  completed: "Completed",
  dropped: "Dropped",
};

export interface TimeEstimate {
  mainMinutes: number | null;
  mainExtraMinutes: number | null;
  completionistMinutes: number | null;
}

export interface PlaythroughGame {
  id: string;
  title: string;
  slug: string;
  platform: string;
  genre: string | null;
  releaseYear: number | null;
  coverUrl: string | null;
  gradientClass: string;
}

export interface Playthrough {
  id: string;
  gameId: string;
  runName: string | null;
  status: PlaythroughStatus;
  goalType: GoalType | null;
  playedMinutes: number;
  estimatedProgressPercent: number | null;
  manualProgressPercent: number | null;
  progressSource: string | null;
  progressNote: string | null;
  startedAt: string | null;
  completedAt: string | null;
  game?: PlaythroughGame;
}

/* ── Progressie ────────────────────────────────────────────────────── */

// Gemiddelde minuten voor het gekozen doel (met nette fallbacks; IGDB levert
// vaak geen "main + extras", dan vallen we terug op main of completionist).
export function averageMinutesForGoal(
  est: TimeEstimate | null,
  goal: GoalType | null
): number | null {
  if (!est || !goal || goal === "just_tracking") return null;
  if (goal === "main_story") return est.mainMinutes ?? null;
  if (goal === "completionist") {
    return est.completionistMinutes ?? est.mainMinutes ?? null;
  }
  // main_extras
  return est.mainExtraMinutes ?? est.mainMinutes ?? est.completionistMinutes ?? null;
}

// estimated_progress = played / average * 100, afgerond en geclampt op 0–100.
export function computeProgress(
  playedMinutes: number,
  averageMinutes: number | null
): number | null {
  if (!averageMinutes || averageMinutes <= 0) return null;
  const pct = Math.round((playedMinutes / averageMinutes) * 100);
  return Math.max(0, Math.min(100, pct));
}

// Het percentage dat we tonen: handmatige correctie wint van de schatting.
export function effectiveProgress(p: {
  manualProgressPercent: number | null;
  estimatedProgressPercent: number | null;
  status: PlaythroughStatus;
}): number | null {
  if (p.status === "completed") return 100;
  if (p.manualProgressPercent !== null && p.manualProgressPercent !== undefined) {
    return p.manualProgressPercent;
  }
  return p.estimatedProgressPercent ?? null;
}

export function formatMinutes(total: number): string {
  if (!total || total <= 0) return "0m";
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// Playthrough → het Game-vorm dat GameCard/dashboard verwacht. `id` = de
// playthrough-id (uniek per run, ook bij meerdere playthroughs van één game).
export function playthroughToCard(p: Playthrough): Game {
  return {
    id: p.id,
    slug: p.game?.slug,
    title: p.game?.title ?? "Unknown game",
    platform: p.game?.platform ?? "Nintendo 3DS",
    genre: p.game?.genre ?? "",
    releaseYear: p.game?.releaseYear ?? 0,
    gradientClass: p.game?.gradientClass ?? "game-card-cover--purple",
    coverUrl: p.game?.coverUrl ?? null,
    status: DB_TO_UI_STATUS[p.status],
    statusLabel: STATUS_LABELS[p.status],
    playtime: p.playedMinutes > 0 ? formatMinutes(p.playedMinutes) : null,
    progressPercent: effectiveProgress(p) ?? 0,
  };
}
