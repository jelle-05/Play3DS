import { createClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string | null;
  username: string;
  role: "user" | "admin";
  avatarInitials: string;
}

function initialsFrom(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === "") return "P3";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Huidige ingelogde gebruiker + profiel (server-side). null als niet ingelogd
// of als Supabase nog niet geconfigureerd is.
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("user_id", user.id)
    .maybeSingle();

  const username =
    profile?.username ?? user.email?.split("@")[0] ?? "Player";

  return {
    id: user.id,
    email: user.email ?? null,
    username,
    role: (profile?.role as "user" | "admin") ?? "user",
    avatarInitials: initialsFrom(username),
  };
}
