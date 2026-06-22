// Pure types + helpers voor activity events — GEEN server-imports, zodat zowel
// client- als server-componenten dit veilig kunnen gebruiken. De server-queries
// en het vastleggen van events staan in lib/activity.ts.

import { STATUS_LABELS, formatMinutes } from "@/lib/playthrough-types";
import type { PlaythroughStatus } from "@/lib/playthrough-types";

export type ActivityEventType =
  | "started"
  | "logged_time"
  | "status_changed"
  | "completed"
  | "reviewed"
  | "followed";

// Wat we per event opslaan in activity_events.metadata (jsonb). Gedenormaliseerd
// zodat de feed geen extra joins nodig heeft om te renderen.
export interface ActivityMeta {
  gameTitle?: string;
  gameSlug?: string;
  minutesAdded?: number;
  status?: PlaythroughStatus;
  rating?: number | null;
  reviewId?: string;
  targetUsername?: string;
}

// Klaargemaakt item voor de ActivityFeed (alles serialiseerbaar).
export interface ActivityItem {
  id: string;
  actor: string;
  actorInitials: string;
  actorHref: string;
  gradientClass: string;
  icon: string;
  text: string; // de zin ná de actornaam
  href: string | null;
  relativeTime: string;
}

const ICONS: Record<ActivityEventType, string> = {
  started: "▶",
  logged_time: "⏱",
  status_changed: "↻",
  completed: "🏆",
  reviewed: "★",
  followed: "＋",
};

// Bouwt de leesbare zin (zonder actornaam) + het icoon en de link uit het
// event-type en de metadata. Pure functie — veilig op client én server.
export function buildActivityText(
  eventType: ActivityEventType,
  meta: ActivityMeta
): { icon: string; text: string; href: string | null } {
  const game = meta.gameTitle ?? "a game";
  const gameHref = meta.gameSlug ? `/games/${meta.gameSlug}` : null;
  const icon = ICONS[eventType] ?? "•";

  switch (eventType) {
    case "started":
      return { icon, text: `started playing ${game}`, href: gameHref };
    case "logged_time": {
      const mins = meta.minutesAdded ? formatMinutes(meta.minutesAdded) : "time";
      return { icon, text: `logged ${mins} on ${game}`, href: gameHref };
    }
    case "status_changed": {
      const label = meta.status ? STATUS_LABELS[meta.status] : "updated";
      return { icon, text: `marked ${game} as ${label}`, href: gameHref };
    }
    case "completed":
      return { icon, text: `completed ${game}`, href: gameHref };
    case "reviewed": {
      const score = meta.rating ? ` · ${meta.rating}/10` : "";
      const href = meta.reviewId ? `/reviews/${meta.reviewId}` : gameHref;
      return { icon, text: `reviewed ${game}${score}`, href };
    }
    case "followed": {
      const who = meta.targetUsername ?? "someone";
      const href = meta.targetUsername
        ? `/users/${meta.targetUsername}`
        : null;
      return { icon, text: `followed ${who}`, href };
    }
    default:
      return { icon, text: "did something", href: null };
  }
}
