"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Een andere gebruiker volgen. De DB borgt de regels (unieke follow + geen
// self-follow via de check-constraint); we vangen ze hier netjes af.
export async function followUser(targetUserId: string, username?: string) {
  if (!targetUserId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  if (user.id === targetUserId) return; // self-follow voorkomen

  // Insert is idempotent dankzij de unique-constraint; een dubbele follow
  // levert een 23505 die we stilzwijgend negeren.
  await supabase
    .from("follows")
    .insert({ follower_id: user.id, following_id: targetUserId });

  if (username) revalidatePath(`/users/${username}`);
}

// Een gebruiker ontvolgen. RLS (follows_delete_own) borgt dat alleen de eigen
// follow-rij wordt verwijderd.
export async function unfollowUser(targetUserId: string, username?: string) {
  if (!targetUserId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  if (username) revalidatePath(`/users/${username}`);
}
