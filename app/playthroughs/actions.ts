"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getTimeEstimateForGame,
  averageMinutesForGoal,
  computeProgress,
  type GoalType,
  type PlaythroughStatus,
} from "@/lib/playthroughs";
import { recordActivity } from "@/lib/activity";

const STATUSES: PlaythroughStatus[] = [
  "want_to_play",
  "playing",
  "paused",
  "completed",
  "dropped",
];

function revalidatePlaythrough(id: string) {
  revalidatePath(`/playthroughs/${id}`);
  revalidatePath("/dashboard");
}

const GOALS: GoalType[] = ["main_story", "main_extras", "completionist", "just_tracking"];

function goalOf(value: string): GoalType {
  return (GOALS as string[]).includes(value) ? (value as GoalType) : "just_tracking";
}

function intField(formData: FormData, key: string): number {
  const n = parseInt(String(formData.get(key) ?? "0"), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Start een playthrough vanaf de game-detailpagina.
export async function startPlaythrough(formData: FormData) {
  const gameId = String(formData.get("game_id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const goalType = goalOf(String(formData.get("goal_type") ?? ""));
  const runName = String(formData.get("run_name") ?? "").trim() || null;
  const playedMinutes = intField(formData, "hours") * 60 + intField(formData, "minutes");

  if (!gameId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const est = await getTimeEstimateForGame(gameId);
  const avg = averageMinutesForGoal(est, goalType);
  const estimated = computeProgress(playedMinutes, avg);
  const progressSource =
    goalType === "just_tracking" ? "not_available" : avg ? "external_average" : "not_available";

  const { data: inserted, error } = await supabase
    .from("playthroughs")
    .insert({
      user_id: user.id,
      game_id: gameId,
      run_name: runName,
      status: "playing",
      goal_type: goalType,
      played_minutes: playedMinutes,
      estimated_progress_percent: estimated,
      progress_source: progressSource,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (error || !inserted) {
    const dest = slug ? `/games/${slug}` : "/games";
    redirect(`${dest}?error=${encodeURIComponent(error?.message ?? "Could not start playthrough.")}`);
  }

  // Eerste timeline-event.
  await supabase.from("playthrough_updates").insert({
    playthrough_id: inserted.id,
    user_id: user.id,
    new_status: "playing",
    played_minutes: playedMinutes,
    minutes_added: playedMinutes,
    estimated_progress_percent: estimated,
  });

  // Activity-event (start). Game-titel ophalen voor een leesbare feed.
  const { data: g } = await supabase
    .from("games")
    .select("title, slug")
    .eq("id", gameId)
    .maybeSingle();
  await recordActivity(supabase, {
    userId: user.id,
    eventType: "started",
    entityType: "playthrough",
    entityId: inserted.id,
    meta: { gameTitle: g?.title, gameSlug: g?.slug ?? (slug || undefined) },
  });

  revalidatePath("/dashboard");
  if (slug) revalidatePath(`/games/${slug}`);
  redirect("/dashboard");
}

// Speeltijd toevoegen aan een playthrough (Quick update). Herberekent de
// geschatte voortgang en schrijft een timeline-event. Geen redirect — de
// client ververst zelf.
export async function addPlaytime(playthroughId: string, minutesToAdd: number) {
  if (!playthroughId || !Number.isFinite(minutesToAdd) || minutesToAdd <= 0) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: pt } = await supabase
    .from("playthroughs")
    .select("id, game_id, status, goal_type, played_minutes, visibility, games ( title, slug )")
    .eq("id", playthroughId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pt) return;

  const newPlayed = (pt.played_minutes ?? 0) + minutesToAdd;
  const est = await getTimeEstimateForGame(pt.game_id);
  const avg = averageMinutesForGoal(est, pt.goal_type as GoalType | null);
  const estimated = computeProgress(newPlayed, avg);
  // Tijd loggen op een "want to play" run betekent dat je begonnen bent.
  const newStatus = pt.status === "want_to_play" ? "playing" : pt.status;

  const update: Record<string, unknown> = {
    played_minutes: newPlayed,
    estimated_progress_percent: estimated,
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  if (pt.status === "want_to_play") update.started_at = new Date().toISOString();

  await supabase.from("playthroughs").update(update).eq("id", playthroughId);

  await supabase.from("playthrough_updates").insert({
    playthrough_id: playthroughId,
    user_id: user.id,
    previous_status: pt.status,
    new_status: newStatus,
    played_minutes: newPlayed,
    minutes_added: minutesToAdd,
    estimated_progress_percent: estimated,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = (pt as any).games;
  await recordActivity(supabase, {
    userId: user.id,
    eventType: "logged_time",
    entityType: "playthrough",
    entityId: playthroughId,
    meta: { gameTitle: g?.title, gameSlug: g?.slug, minutesAdded: minutesToAdd },
    visibility: pt.visibility === "private" ? "private" : "public",
  });

  revalidatePath("/dashboard");
}

/* ── Beheer (4.4 — playthrough-detailpagina) ───────────────────────── */

// Statuswijziging — schrijft een timeline-event en zet completed_at.
export async function updatePlaythroughStatus(
  playthroughId: string,
  status: PlaythroughStatus
) {
  if (!STATUSES.includes(status)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: pt } = await supabase
    .from("playthroughs")
    .select("id, status, played_minutes, estimated_progress_percent, visibility, games ( title, slug )")
    .eq("id", playthroughId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pt) return;
  if (pt.status === status) return;

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  update.completed_at = status === "completed" ? new Date().toISOString() : null;

  await supabase.from("playthroughs").update(update).eq("id", playthroughId);

  await supabase.from("playthrough_updates").insert({
    playthrough_id: playthroughId,
    user_id: user.id,
    previous_status: pt.status,
    new_status: status,
    played_minutes: pt.played_minutes ?? 0,
    estimated_progress_percent: pt.estimated_progress_percent ?? null,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = (pt as any).games;
  await recordActivity(supabase, {
    userId: user.id,
    eventType: status === "completed" ? "completed" : "status_changed",
    entityType: "playthrough",
    entityId: playthroughId,
    meta: { gameTitle: g?.title, gameSlug: g?.slug, status },
    visibility: pt.visibility === "private" ? "private" : "public",
  });

  revalidatePlaythrough(playthroughId);
}

// Handmatige voortgangscorrectie (0–100). Wint van de schatting.
export async function setManualProgress(playthroughId: string, percent: number) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: pt } = await supabase
    .from("playthroughs")
    .select("id, played_minutes")
    .eq("id", playthroughId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pt) return;

  await supabase
    .from("playthroughs")
    .update({
      manual_progress_percent: pct,
      progress_source: "manual",
      updated_at: new Date().toISOString(),
    })
    .eq("id", playthroughId);

  await supabase.from("playthrough_updates").insert({
    playthrough_id: playthroughId,
    user_id: user.id,
    played_minutes: pt.played_minutes ?? 0,
    manual_progress_percent: pct,
  });

  revalidatePlaythrough(playthroughId);
}

// Notitie toevoegen aan de timeline.
export async function addPlaythroughNote(playthroughId: string, note: string) {
  const text = note.trim();
  if (!text) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: pt } = await supabase
    .from("playthroughs")
    .select("id, played_minutes")
    .eq("id", playthroughId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pt) return;

  await supabase
    .from("playthroughs")
    .update({ progress_note: text, updated_at: new Date().toISOString() })
    .eq("id", playthroughId);

  await supabase.from("playthrough_updates").insert({
    playthrough_id: playthroughId,
    user_id: user.id,
    played_minutes: pt.played_minutes ?? 0,
    progress_note: text,
  });

  revalidatePlaythrough(playthroughId);
}

// Playthrough verwijderen → terug naar het dashboard.
export async function deletePlaythrough(playthroughId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("playthroughs")
    .delete()
    .eq("id", playthroughId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
