import { createClient } from "@/lib/supabase/server";
import { gradientForSlug } from "@/lib/games";
import {
  MOCK_REVIEWS,
  initialsFrom,
  formatRelativeTime,
  type Review,
  type ReviewComment,
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

interface ReviewMeta {
  likeCounts: Map<string, number>;
  liked: Set<string>;
  commentCounts: Map<string, number>;
}

// Likes (telling + eigen-like) en comment-tellingen per review — berekend bij
// het lezen, want likes_count/comments_count worden niet als kolom bijgehouden
// (RLS staat niet-eigenaars geen reviews-update toe).
async function reviewMetaFor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string | undefined,
  reviewIds: string[]
): Promise<ReviewMeta> {
  const likeCounts = new Map<string, number>();
  const liked = new Set<string>();
  const commentCounts = new Map<string, number>();
  if (reviewIds.length === 0) return { likeCounts, liked, commentCounts };

  const [likes, comments] = await Promise.all([
    supabase.from("review_likes").select("review_id, user_id").in("review_id", reviewIds),
    supabase
      .from("review_comments")
      .select("review_id")
      .eq("is_deleted", false)
      .in("review_id", reviewIds),
  ]);

  for (const row of likes.data ?? []) {
    likeCounts.set(row.review_id, (likeCounts.get(row.review_id) ?? 0) + 1);
    if (userId && row.user_id === userId) liked.add(row.review_id);
  }
  for (const row of comments.data ?? []) {
    commentCounts.set(row.review_id, (commentCounts.get(row.review_id) ?? 0) + 1);
  }
  return { likeCounts, liked, commentCounts };
}

function rowToReview(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any,
  usernames: Map<string, string>,
  currentUserId?: string,
  meta?: ReviewMeta
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
    likes: meta?.likeCounts.get(row.id) ?? 0,
    comments: meta?.commentCounts.get(row.id) ?? 0,
    relativeTime: formatRelativeTime(row.created_at),
    isOwner: !!currentUserId && row.user_id === currentUserId,
    likedByMe: meta?.liked.has(row.id) ?? false,
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
  const meta = await reviewMetaFor(supabase, user?.id, data.map((r) => r.id));
  return data.map((r) => rowToReview(r, usernames, user?.id, meta));
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
  const meta = await reviewMetaFor(supabase, user.id, [data.id]);
  return rowToReview(data, usernames, user.id, meta);
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
  const meta = await reviewMetaFor(supabase, user?.id, data.map((r) => r.id));
  return data.map((r) => rowToReview(r, usernames, user?.id, meta));
}

// Eén review op id (RLS: publiek of eigen). null als niet gevonden.
export async function getReviewById(id: string): Promise<Review | null> {
  if (!isConfigured) return MOCK_REVIEWS.find((r) => r.id === id) ?? null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const usernames = await usernamesFor(supabase, [data.user_id]);
  const meta = await reviewMetaFor(supabase, user?.id, [data.id]);
  return rowToReview(data, usernames, user?.id, meta);
}

// Comments van een review (niet-verwijderd, oudste eerst).
export async function getCommentsForReview(reviewId: string): Promise<ReviewComment[]> {
  if (!isConfigured) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("review_comments")
    .select("id, user_id, body, created_at")
    .eq("review_id", reviewId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  const usernames = await usernamesFor(supabase, data.map((r) => r.user_id));
  return data.map((r) => {
    const author = usernames.get(r.user_id) ?? "Player";
    return {
      id: r.id,
      author,
      authorInitials: initialsFrom(author),
      body: r.body ?? "",
      relativeTime: formatRelativeTime(r.created_at),
      isOwner: !!user && r.user_id === user.id,
    };
  });
}
