export type GameStatus = "playing" | "completed" | "paused" | "dropped" | "want";

export interface Game {
  id: string;
  title: string;
  platform: string;
  status: GameStatus;
  statusLabel: string;
  playtime: string | null;
  progressPercent: number;
  genre: string;
  releaseYear: number;
  gradientClass: string;
  rating?: number;
}

export const MOCK_GAMES: Game[] = [
  {
    id: "zelda-oot-3d",
    title: "Zelda: Ocarina of Time 3D",
    platform: "Nintendo 3DS",
    status: "playing",
    statusLabel: "Playing",
    playtime: "24h 30m",
    progressPercent: 42,
    genre: "Action RPG",
    releaseYear: 2011,
    gradientClass: "game-card-cover--purple",
    rating: 10,
  },
  {
    id: "pokemon-x",
    title: "Pokémon X",
    platform: "Nintendo 3DS",
    status: "completed",
    statusLabel: "Completed",
    playtime: "65h 12m",
    progressPercent: 100,
    genre: "RPG",
    releaseYear: 2013,
    gradientClass: "game-card-cover--mint",
    rating: 8,
  },
  {
    id: "fire-emblem-awakening",
    title: "Fire Emblem Awakening",
    platform: "Nintendo 3DS",
    status: "paused",
    statusLabel: "Paused",
    playtime: "18h 45m",
    progressPercent: 35,
    genre: "Strategy RPG",
    releaseYear: 2012,
    gradientClass: "game-card-cover--warm",
    rating: 9,
  },
  {
    id: "animal-crossing-nl",
    title: "Animal Crossing: New Leaf",
    platform: "Nintendo 3DS",
    status: "want",
    statusLabel: "Want to Play",
    playtime: null,
    progressPercent: 0,
    genre: "Simulation",
    releaseYear: 2012,
    gradientClass: "game-card-cover--pink",
  },
  {
    id: "mario-kart-7",
    title: "Mario Kart 7",
    platform: "Nintendo 3DS",
    status: "completed",
    statusLabel: "Completed",
    playtime: "40h 00m",
    progressPercent: 100,
    genre: "Racing",
    releaseYear: 2011,
    gradientClass: "game-card-cover--blue",
    rating: 9,
  },
  {
    id: "super-mario-3d-land",
    title: "Super Mario 3D Land",
    platform: "Nintendo 3DS",
    status: "playing",
    statusLabel: "Playing",
    playtime: "8h 20m",
    progressPercent: 55,
    genre: "Platformer",
    releaseYear: 2011,
    gradientClass: "game-card-cover--teal",
    rating: 9,
  },
  {
    id: "pokemon-y",
    title: "Pokémon Y",
    platform: "Nintendo 3DS",
    status: "dropped",
    statusLabel: "Dropped",
    playtime: "10h 05m",
    progressPercent: 20,
    genre: "RPG",
    releaseYear: 2013,
    gradientClass: "game-card-cover--red",
    rating: 6,
  },
  {
    id: "kirby-planet-robobot",
    title: "Kirby: Planet Robobot",
    platform: "Nintendo 3DS",
    status: "want",
    statusLabel: "Want to Play",
    playtime: null,
    progressPercent: 0,
    genre: "Platformer",
    releaseYear: 2016,
    gradientClass: "game-card-cover--orange",
  },
  {
    id: "metroid-samus-returns",
    title: "Metroid: Samus Returns",
    platform: "Nintendo 3DS",
    status: "completed",
    statusLabel: "Completed",
    playtime: "12h 30m",
    progressPercent: 100,
    genre: "Action",
    releaseYear: 2017,
    gradientClass: "game-card-cover--purple",
    rating: 8,
  },
  {
    id: "bravely-default",
    title: "Bravely Default",
    platform: "Nintendo 3DS",
    status: "paused",
    statusLabel: "Paused",
    playtime: "25h 15m",
    progressPercent: 48,
    genre: "JRPG",
    releaseYear: 2013,
    gradientClass: "game-card-cover--mint",
    rating: 8,
  },
];

/* ── Status groups & helpers (used by the dashboard) ─────────────────── */

export interface StatusGroup {
  status: GameStatus;
  label: string;
}

// Display order for the dashboard status groups — active states first.
export const STATUS_GROUPS: StatusGroup[] = [
  { status: "playing", label: "Playing" },
  { status: "paused", label: "Paused" },
  { status: "want", label: "Want to Play" },
  { status: "completed", label: "Completed" },
  { status: "dropped", label: "Dropped" },
];

// Group a list of games by their status, keeping every status key present.
export function groupGamesByStatus(games: Game[]): Record<GameStatus, Game[]> {
  const groups: Record<GameStatus, Game[]> = {
    playing: [],
    paused: [],
    want: [],
    completed: [],
    dropped: [],
  };
  for (const game of games) {
    groups[game.status].push(game);
  }
  return groups;
}
