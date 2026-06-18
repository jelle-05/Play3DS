import type { GameStatus } from "./games";

// Reviews are only written for games a user has actually played, so the status
// is limited to these four (no "want_to_play" reviews). See fases.md §6.
export type ReviewStatus = Extract<
  GameStatus,
  "playing" | "completed" | "paused" | "dropped"
>;

export interface Review {
  id: string;
  gameId: string;
  gameTitle: string;
  gradientClass: string;
  author: string;
  authorInitials: string;
  rating: number; // 1–10
  status: ReviewStatus;
  title: string;
  body: string;
  playtimeAtReview?: string | null;
  goalType?: string | null;
  hasSpoilers: boolean;
  likes: number;
  comments: number;
  relativeTime: string;
  // Alleen aanwezig bij DB-reviews — bepaalt of de huidige gebruiker mag
  // bewerken/verwijderen of de review al heeft geliket (5.2/5.3).
  isOwner?: boolean;
  likedByMe?: boolean;
}

// Naam → initialen (max 2 letters).
export function initialsFrom(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "P3";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ISO-datum → korte relatieve tijd ("3 days ago").
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const secs = Math.max(0, Math.round((now - then) / 1000));
  const mins = Math.round(secs / 60);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  if (secs < 60) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (days < 30) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  const months = Math.round(days / 30);
  if (days < 365) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

// Auto-generated label from status (e.g. "Completed review").
export function reviewStatusLabel(status: ReviewStatus): string {
  const map: Record<ReviewStatus, string> = {
    playing: "Playing review",
    completed: "Completed review",
    paused: "Paused review",
    dropped: "Dropped review",
  };
  return map[status];
}

// Static mock timestamps — will be computed dynamically once auth lands (Phase 2).
export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-001",
    gameId: "zelda-oot-3d",
    gameTitle: "Zelda: Ocarina of Time 3D",
    gradientClass: "game-card-cover--purple",
    author: "jellebol",
    authorInitials: "JB",
    rating: 10,
    status: "completed",
    title: "A masterpiece that holds up perfectly",
    body: "The visual upgrade enhances every dungeon without losing the N64 charm. Gyro aiming makes the bow a joy and the Water Temple is finally readable. Essential 3DS library entry.",
    playtimeAtReview: "24h 30m",
    goalType: "Main + extras",
    hasSpoilers: false,
    likes: 42,
    comments: 7,
    relativeTime: "1 week ago",
  },
  {
    id: "rev-002",
    gameId: "fire-emblem-awakening",
    gameTitle: "Fire Emblem Awakening",
    gradientClass: "game-card-cover--warm",
    author: "tactician_rob",
    authorInitials: "TR",
    rating: 9,
    status: "completed",
    title: "The game that saved the series",
    body: "Chrom's sacrifice in the second act completely gutted me, and the Grima reveal recontextualizes the whole campaign. Permadeath kept every battle tense to the very end.",
    playtimeAtReview: "41h 10m",
    goalType: "100%",
    hasSpoilers: true,
    likes: 28,
    comments: 12,
    relativeTime: "2 weeks ago",
  },
  {
    id: "rev-003",
    gameId: "super-mario-3d-land",
    gameTitle: "Super Mario 3D Land",
    gradientClass: "game-card-cover--teal",
    author: "linkmaster",
    authorInitials: "LM",
    rating: 9,
    status: "playing",
    title: "The best use of 3D on the system",
    body: "Depth perception actually matters here — jumps you'd miss in 2D suddenly click. Bite-sized levels are perfect for handheld sessions. Loving it so far.",
    playtimeAtReview: "8h 20m",
    goalType: "Main story",
    hasSpoilers: false,
    likes: 15,
    comments: 3,
    relativeTime: "4 days ago",
  },
  {
    id: "rev-004",
    gameId: "bravely-default",
    gameTitle: "Bravely Default",
    gradientClass: "game-card-cover--mint",
    author: "kalos_kid",
    authorInitials: "KK",
    rating: 8,
    status: "paused",
    title: "Brilliant combat, taking a break",
    body: "The Brave & Default system is one of the smartest battle mechanics in any JRPG. I've paused around the midpoint — the structure gets a little repetitive, but I'll be back.",
    playtimeAtReview: "25h 15m",
    goalType: "Main story",
    hasSpoilers: false,
    likes: 19,
    comments: 5,
    relativeTime: "3 weeks ago",
  },
  {
    id: "rev-005",
    gameId: "mario-kart-7",
    gameTitle: "Mario Kart 7",
    gradientClass: "game-card-cover--blue",
    author: "jellebol",
    authorInitials: "JB",
    rating: 9,
    status: "completed",
    title: "Gliders and online done right",
    body: "Underwater and airborne sections add genuine variety, and kart customization is more meaningful than it looks. Online ran shockingly well for a 2011 handheld game.",
    playtimeAtReview: "40h 00m",
    goalType: "100%",
    hasSpoilers: false,
    likes: 23,
    comments: 4,
    relativeTime: "1 month ago",
  },
  {
    id: "rev-006",
    gameId: "pokemon-y",
    gameTitle: "Pokémon Y",
    gradientClass: "game-card-cover--red",
    author: "samus_fan",
    authorInitials: "SF",
    rating: 6,
    status: "dropped",
    title: "Beautiful but a bit too easy",
    body: "Mega Evolution and the jump to 3D are great, but the Exp. Share trivializes most battles. I lost momentum after the sixth gym and drifted off.",
    playtimeAtReview: "10h 05m",
    goalType: "Just tracking",
    hasSpoilers: false,
    likes: 8,
    comments: 9,
    relativeTime: "1 month ago",
  },
];

// All reviews for a given game.
export function getReviewsForGame(gameId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.gameId === gameId);
}
