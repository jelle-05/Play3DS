export interface MockUser {
  id: string;
  username: string;
  displayName: string;
  avatarInitials: string;
  joinedYear: number;
}

export interface HomeStats {
  activePlaythroughs: number;
  hoursLogged: number;
  completed: number;
  reviews: number;
}

export type ActivityType = "log_time" | "status_change" | "review" | "started";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  gameId: string;
  gameTitle: string;
  gradientClass: string;
  description: string;
  relativeTime: string;
  timestamp: string;
}

export interface ReviewPreview {
  id: string;
  gameId: string;
  gameTitle: string;
  gradientClass: string;
  rating: number;
  excerpt: string;
  author: string;
  relativeTime: string;
}

export const MOCK_USER: MockUser = {
  id: "user-001",
  username: "jellebol",
  displayName: "Jelle",
  avatarInitials: "JB",
  joinedYear: 2024,
};

export const MOCK_HOME_STATS: HomeStats = {
  activePlaythroughs: 2,
  hoursLogged: 204,
  completed: 3,
  reviews: 5,
};

// Static mock timestamps — will be computed dynamically in Phase 2 (real auth)
export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "act-001",
    type: "log_time",
    gameId: "zelda-oot-3d",
    gameTitle: "Zelda: Ocarina of Time 3D",
    gradientClass: "game-card-cover--purple",
    description: "Added 2h 30m to Zelda: Ocarina of Time 3D",
    relativeTime: "2 hours ago",
    timestamp: "2026-06-16T10:00:00",
  },
  {
    id: "act-002",
    type: "status_change",
    gameId: "pokemon-x",
    gameTitle: "Pokémon X",
    gradientClass: "game-card-cover--mint",
    description: "Marked Pokémon X as Completed",
    relativeTime: "Yesterday",
    timestamp: "2026-06-15T18:20:00",
  },
  {
    id: "act-003",
    type: "review",
    gameId: "fire-emblem-awakening",
    gameTitle: "Fire Emblem Awakening",
    gradientClass: "game-card-cover--warm",
    description: "Left a review for Fire Emblem Awakening",
    relativeTime: "2 days ago",
    timestamp: "2026-06-14T09:00:00",
  },
  {
    id: "act-004",
    type: "log_time",
    gameId: "super-mario-3d-land",
    gameTitle: "Super Mario 3D Land",
    gradientClass: "game-card-cover--teal",
    description: "Added 1h 20m to Super Mario 3D Land",
    relativeTime: "3 days ago",
    timestamp: "2026-06-13T20:15:00",
  },
  {
    id: "act-005",
    type: "started",
    gameId: "kirby-planet-robobot",
    gameTitle: "Kirby: Planet Robobot",
    gradientClass: "game-card-cover--orange",
    description: "Started playing Kirby: Planet Robobot",
    relativeTime: "5 days ago",
    timestamp: "2026-06-11T14:30:00",
  },
];

export const MOCK_REVIEW_PREVIEWS: ReviewPreview[] = [
  {
    id: "rev-001",
    gameId: "zelda-oot-3d",
    gameTitle: "Zelda: Ocarina of Time 3D",
    gradientClass: "game-card-cover--purple",
    rating: 10,
    excerpt:
      "A masterpiece that holds up perfectly on 3DS. The visual upgrade enhances every dungeon without losing the N64 charm.",
    author: "jellebol",
    relativeTime: "1 week ago",
  },
  {
    id: "rev-002",
    gameId: "fire-emblem-awakening",
    gameTitle: "Fire Emblem Awakening",
    gradientClass: "game-card-cover--warm",
    rating: 9,
    excerpt:
      "The game that saved the Fire Emblem series. Character pairings and the Casual mode make it approachable without dumbing it down.",
    author: "jellebol",
    relativeTime: "2 weeks ago",
  },
  {
    id: "rev-003",
    gameId: "mario-kart-7",
    gameTitle: "Mario Kart 7",
    gradientClass: "game-card-cover--blue",
    rating: 9,
    excerpt:
      "Glider mechanics and underwater sections add fresh variety. Online multiplayer ran surprisingly well.",
    author: "jellebol",
    relativeTime: "3 weeks ago",
  },
];
