import { createClient } from "@/lib/supabase/server";
import { gradientForSlug } from "@/lib/games";
import {
  MOCK_REVIEWS,
  initialsFrom,
  formatRelativeTime,
  type Review,
  type ReviewStatus,
} from "@/lib/reviews";

const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

const REVIEW_SELECT =
  "id, user_id, game_id, rating, status_at_review, title, body, has_spoilers, likes_count, comments_count, created_at, games ( title, slug )";

// Haalt voor een set user_ids de usernames op (reviews.user_id verwijst naar
// auth.users, niet naar profiles — dus geen PostgREST-embed mogelijk).
async function usernamesFor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const ids = Array.from(new Set(userIds));
  if (ids.length === 0) return map;
  const { data } = await supabase
    .from("profiles")
    .select("user_id, username")
    .in("user_id", ids);
  for (const row of data ?? []) map.set(row.user_id, row.username);
  return map;
}

interface LikeInfo {
  counts: Map<string, number>;
  liked: Set<string>;
}

// Like-telling per review + welke de huidige gebruiker heeft geliket — in één
// query (likes_count wordt niet als kolom bijgehouden vanwege RLS).
async function likeInfoFor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string | undefined,
  reviewIds: string[]
): Promise<LikeInfo> {
  const counts = new Map<string, number>();
  const liked = new Set<string>();
  if (reviewIds.length === 0) return { counts, liked };

  const { data } = await supabase
    .from("review_likes")
    .select("review_id, user_id")
    .in("review_id", reviewIds);

  for (const row of data ?? []) {
    counts.set(row.review_id, (counts.get(row.review_id) ?? 0) + 1);
    if (userId && row.user_id === userId) liked.add(row.review_id);
  }
  return { counts, liked };
}

function rowToReview(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any,
  usernames: Map<string, string>,
  currentUserId?: string,
  likeInfo?: LikeInfo
): Review {
  const g = row.games;
  const gameSlug: string = g?.slug ?? row.game_id;
  const author = usernames.get(row.user_id) ?? "Player";
  return {
    id: row.id,
    gameId: gameSlug, // routing key (slug)
    gameTitle: g?.title ?? "Unknown game",
    gradientClass: gradientForSlug(gameSlug),
    author,
    authorInitials: initialsFrom(author),
    rating: row.rating ?? 0,
    status: (row.status_at_review as ReviewStatus) ?? "completed",
    title: row.title ?? "",
    body: row.body ?? "",
    playtimeAtReview: null,
    goalType: null,
    hasSpoilers: row.has_spoilers ?? false,
    likes: likeInfo?.counts.get(row.id) ?? 0,
    comments: row.comments_count ?? 0,
    relativeTime: formatRelativeTime(row.created_at),
    isOwner: !!currentUserId && row.user_id === currentUserId,
    likedByMe: likeInfo?.liked.has(row.id) ?? false,
  };
}

// Recente publieke reviews (voor /reviews). Mock-fallback zonder env-vars.
export async function getRecentReviews(limit = 30): Promise<Review[]> {
  if (!isConfigured) return MOCK_REVIEWS;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  const usernames = await usernamesFor(supabase, data.map((r) => r.user_id));
  const likeInfo = await likeInfoFor(supabase, user?.id, data.map((r) => r.id));
  return data.map((r) => rowToReview(r, usernames, user?.id, likeInfo));
}

// De review van de huidige gebruiker voor één game (game-uuid), of null.
export async function getMyReviewForGame(gameId: string): Promise<Review | null> {
  if (!isConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("game_id", gameId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  const usernames = await usernamesFor(supabase, [data.user_id]);
  const likeInfo = await likeInfoFor(supabase, user.id, [data.id]);
  return rowToReview(data, usernames, user.id, likeInfo);
}

// Reviews voor één game. `gameKey` = game-uuid (DB) of slug (mock-fallback).
export async function getReviewsForGameDb(gameKey: string): Promise<Review[]> {
  if (!isConfigured) {
    return MOCK_REVIEWS.filter((r) => r.gameId === gameKey);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("game_id", gameKey)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  const usernames = await usernamesFor(supabase, data.map((r) => r.user_id));
  const likeInfo = await likeInfoFor(supabase, user?.id, data.map((r) => r.id));
  return data.map((r) => rowToReview(r, usernames, user?.id, likeInfo));
}
