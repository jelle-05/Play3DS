"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reviewStatusLabel, type ReviewStatus } from "@/lib/reviews";
import { recordActivity } from "@/lib/activity";

const STATUSES: ReviewStatus[] = ["playing", "completed", "paused", "dropped"];

function statusOf(value: string): ReviewStatus {
  return (STATUSES as string[]).includes(value) ? (value as ReviewStatus) : "completed";
}

function ratingOf(value: string): number {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.max(1, Math.min(10, n));
}

interface ReviewFields {
  rating: number;
  status: ReviewStatus;
  title: string;
  body: string;
  hasSpoilers: boolean;
}

function readFields(formData: FormData): ReviewFields {
  return {
    rating: ratingOf(String(formData.get("rating") ?? "")),
    status: statusOf(String(formData.get("status") ?? "")),
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? "").trim(),
    hasSpoilers: formData.get("has_spoilers") === "on",
  };
}

export async function createReview(formData: FormData) {
  const gameId = String(formData.get("game_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const fields = readFields(formData);
  if (!gameId || fields.rating < 1 || !fields.body) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Koppel (optioneel) de meest recente playthrough van deze game.
  const { data: pt } = await supabase
    .from("playthroughs")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: inserted } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      game_id: gameId,
      playthrough_id: pt?.id ?? null,
      rating: fields.rating,
      status_at_review: fields.status,
      label: reviewStatusLabel(fields.status),
      title: fields.title || null,
      body: fields.body,
      has_spoilers: fields.hasSpoilers,
      visibility: "public",
    })
    .select("id")
    .maybeSingle();

  // Activity-event (review). Game-titel ophalen voor de feed.
  const { data: g } = await supabase
    .from("games")
    .select("title, slug")
    .eq("id", gameId)
    .maybeSingle();
  await recordActivity(supabase, {
    userId: user.id,
    eventType: "reviewed",
    entityType: "review",
    entityId: inserted?.id ?? null,
    meta: {
      gameTitle: g?.title,
      gameSlug: g?.slug ?? (slug || undefined),
      reviewId: inserted?.id,
      rating: fields.rating,
    },
  });

  if (slug) revalidatePath(`/games/${slug}`);
  revalidatePath("/reviews");
}

export async function updateReview(formData: FormData) {
  const reviewId = String(formData.get("review_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const fields = readFields(formData);
  if (!reviewId || fields.rating < 1 || !fields.body) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("reviews")
    .update({
      rating: fields.rating,
      status_at_review: fields.status,
      label: reviewStatusLabel(fields.status),
      title: fields.title || null,
      body: fields.body,
      has_spoilers: fields.hasSpoilers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (slug) revalidatePath(`/games/${slug}`);
  revalidatePath("/reviews");
}

// Like/unlike togglen. Houdt reviews.likes_count synchroon (hertelt na afloop).
export async function toggleReviewLike(reviewId: string) {
  if (!reviewId) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("review_likes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("review_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("review_likes").insert({ review_id: reviewId, user_id: user.id });
  }
  // likes_count wordt niet bijgehouden op reviews (RLS: alleen de eigenaar mag
  // reviews updaten) — de telling wordt bij het lezen berekend.

  revalidatePath("/reviews");
}

// Verwijderen — RLS staat dit toe voor de eigenaar én voor admins
// (reviews_modify_own / reviews_admin_delete), dus geen user-filter nodig.
export async function deleteReview(reviewId: string) {
  if (!reviewId) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("reviews").delete().eq("id", reviewId);

  revalidatePath("/reviews");
}

// Comment plaatsen bij een review.
export async function addComment(reviewId: string, body: string) {
  const text = body.trim();
  if (!reviewId || !text) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("review_comments").insert({
    review_id: reviewId,
    user_id: user.id,
    body: text.slice(0, 2000),
  });

  revalidatePath(`/reviews/${reviewId}`);
  revalidatePath("/reviews");
}

// Comment verwijderen — RLS staat eigenaar én admin toe.
export async function deleteComment(commentId: string, reviewId: string) {
  if (!commentId) return;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("review_comments").delete().eq("id", commentId);

  if (reviewId) revalidatePath(`/reviews/${reviewId}`);
  revalidatePath("/reviews");
}
