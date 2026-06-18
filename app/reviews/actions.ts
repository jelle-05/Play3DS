"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reviewStatusLabel, type ReviewStatus } from "@/lib/reviews";

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

  await supabase.from("reviews").insert({
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
