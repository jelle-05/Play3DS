"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  getTimeEstimateForGame,
  averageMinutesForGoal,
  computeProgress,
  type GoalType,
} from "@/lib/playthroughs";

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

  revalidatePath("/dashboard");
  if (slug) revalidatePath(`/games/${slug}`);
  redirect("/dashboard");
}
