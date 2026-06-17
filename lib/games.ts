export type GameStatus = "playing" | "completed" | "paused" | "dropped" | "want";

export interface Game {
  id: string;
  slug?: string; // routing key (DB-slug); mock-data gebruikt id als slug
  title: string;
  platform: string;
  genre: string;
  releaseYear: number;
  gradientClass: string;
  coverUrl?: string | null;
  metadataStatus?: "basic" | "enriched" | "verified";
  // Optionele metadata — getoond op de detailpagina; mag ontbreken (fallback).
  developer?: string;
  publisher?: string;
  description?: string;
  averagePlaytime?: string;
  // Playthrough-/UI-velden — optioneel; alleen in mock/dashboard-context
  // (een catalogusgame heeft deze niet, een getrackte game wel).
  status?: GameStatus;
  statusLabel?: string;
  playtime?: string | null;
  progressPercent?: number;
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
    developer: "Grezzo",
    publisher: "Nintendo",
    averagePlaytime: "~25h",
    description:
      "A ground-up 3DS remake of the N64 classic, with sharper visuals, gyro aiming and the extra-tough Master Quest. Guide Link across time to stop Ganondorf.",
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
    developer: "Game Freak",
    publisher: "The Pokémon Company",
    averagePlaytime: "~32h",
    description:
      "The first fully 3D mainline Pokémon adventure, set in the France-inspired Kalos region and introducing Mega Evolution and the Fairy type.",
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
    developer: "Intelligent Systems",
    publisher: "Nintendo",
    averagePlaytime: "~40h",
    description:
      "The strategy RPG that revived the series, blending tactical grid battles with deep character bonds, optional permadeath and a sweeping time-travel story.",
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
    developer: "Nintendo EAD",
    publisher: "Nintendo",
    averagePlaytime: "Endless",
    description:
      "Become mayor of your own town in this relaxed life sim — decorate, fish, fossil-hunt and pay off your ever-growing house at your own pace.",
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
    developer: "Nintendo EAD / Retro Studios",
    publisher: "Nintendo",
    averagePlaytime: "~15h",
    description:
      "Mario Kart takes to the air and underwater with gliders and propellers, plus kart customization and a strong online multiplayer suite.",
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
    developer: "Nintendo EAD",
    publisher: "Nintendo",
    averagePlaytime: "~10h",
    description:
      "A bridge between 2D and 3D Mario built around stereoscopic depth, the Tanooki suit and bite-sized levels perfect for handheld play.",
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
    developer: "Game Freak",
    publisher: "The Pokémon Company",
    averagePlaytime: "~32h",
    description:
      "The companion version to Pokémon X, featuring the legendary Yveltal and its own set of exclusive Pokémon in the Kalos region.",
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
    developer: "HAL Laboratory",
    publisher: "Nintendo",
    averagePlaytime: "~8h",
    description:
      "Kirby pilots a transforming Robobot Armor to fight off a mechanized invasion, combining classic copy abilities with mech-powered mayhem.",
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
    developer: "MercurySteam",
    publisher: "Nintendo",
    averagePlaytime: "~12h",
    description:
      "A full reimagining of Metroid II, adding the melee counter, 360° aiming and gorgeous 2.5D visuals to Samus's hunt across planet SR388.",
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
    developer: "Silicon Studio",
    publisher: "Square Enix",
    averagePlaytime: "~50h",
    description:
      "A throwback JRPG with a flexible job system and the risk/reward Brave & Default battle mechanic, wrapped in hand-painted watercolor towns.",
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
    if (game.status) groups[game.status].push(game);
  }
  return groups;
}

// Look up a single mock game by its id/slug.
export function getGameById(id: string): Game | undefined {
  return MOCK_GAMES.find((game) => game.id === id);
}

// Deterministische gradient per slug — geeft elke catalogusgame een vaste,
// speelse cover-kleur zolang er nog geen echte cover-URL is.
export const GRADIENT_CLASSES = [
  "game-card-cover--purple",
  "game-card-cover--mint",
  "game-card-cover--warm",
  "game-card-cover--pink",
  "game-card-cover--blue",
  "game-card-cover--teal",
  "game-card-cover--red",
  "game-card-cover--orange",
];

export function gradientForSlug(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return GRADIENT_CLASSES[hash % GRADIENT_CLASSES.length];
}
