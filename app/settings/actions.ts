"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Resultaat van een settings-actie, voor useActionState-feedback in de client.
export interface SettingsState {
  ok: boolean;
  error?: string;
  message?: string;
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const BIO_MAX = 280;
const COUNTRY_MAX = 56;
const AVATAR_MAX = 500;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// Profiel bijwerken: username, avatar, bio, land, favoriete game. RLS
// (profiles_update_own) borgt dat alleen het eigen profiel wordt geraakt.
export async function updateProfile(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to be logged in." };

  const username = str(formData, "username");
  const avatarUrl = str(formData, "avatar_url");
  const bio = str(formData, "bio");
  const country = str(formData, "country");
  const favoriteGameId = str(formData, "favorite_game_id");

  // ── Validatie ──
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      error:
        "Username must be 3–20 characters: letters, numbers or underscores only.",
    };
  }
  if (bio.length > BIO_MAX) {
    return { ok: false, error: `Bio can be at most ${BIO_MAX} characters.` };
  }
  if (country.length > COUNTRY_MAX) {
    return { ok: false, error: "That country name is too long." };
  }
  if (avatarUrl) {
    if (avatarUrl.length > AVATAR_MAX || !/^https?:\/\//i.test(avatarUrl)) {
      return {
        ok: false,
        error: "Avatar URL must start with http:// or https://.",
      };
    }
  }

  // Username-uniciteit (case-insensitief), het eigen profiel uitgezonderd.
  const { data: clash } = await supabase
    .from("profiles")
    .select("user_id")
    .ilike("username", username)
    .neq("user_id", user.id)
    .maybeSingle();
  if (clash) {
    return { ok: false, error: "That username is already taken." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      avatar_url: avatarUrl || null,
      bio: bio || null,
      country: country || null,
      favorite_game_id: favoriteGameId || null,
    })
    .eq("user_id", user.id);

  if (error) {
    // Unieke-constraint of andere DB-fout netjes terugkoppelen.
    const taken = error.code === "23505";
    return {
      ok: false,
      error: taken ? "That username is already taken." : "Could not save your profile.",
    };
  }

  revalidatePath("/settings/profile");
  revalidatePath("/profile");
  revalidatePath(`/users/${username}`);
  return { ok: true, message: "Profile saved." };
}

// Zichtbaarheid (public/private) bijwerken.
export async function updatePrivacy(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You need to be logged in." };

  const visibility = str(formData, "visibility");
  if (visibility !== "public" && visibility !== "private") {
    return { ok: false, error: "Invalid visibility setting." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ visibility })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Could not update your privacy setting." };

  revalidatePath("/settings/privacy");
  revalidatePath("/profile");
  return {
    ok: true,
    message:
      visibility === "private"
        ? "Your profile is now private."
        : "Your profile is now public.",
  };
}
