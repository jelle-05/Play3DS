import { createClient } from "@/lib/supabase/server";
import { gradientForSlug } from "@/lib/games";
import { initialsFrom, formatRelativeTime } from "@/lib/reviews";
import {
  buildActivityText,
  type ActivityEventType,
  type ActivityItem,
  type ActivityMeta,
} from "@/lib/activity-types";

// Re-export de pure helpers/types voor gemak op de server.
export * from "@/lib/activity-types";

const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

interface RecordArgs {
  userId: string;
  eventType: ActivityEventType;
  entityType: "playthrough" | "review" | "user";
  entityId: string | null;
  meta: ActivityMeta;
  visibility?: "public" | "private";
}

// Legt een activity-event vast. Bewust fail-safe: een fout hier mag de
// onderliggende actie (review plaatsen, tijd loggen, …) nooit breken.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function recordActivity(supabase: any, args: RecordArgs) {
  try {
    await supabase.from("activity_events").insert({
      user_id: args.userId,
      event_type: args.eventType,
      entity_type: args.entityType,
      entity_id: args.entityId,
      metadata: args.meta,
      visibility: args.visibility ?? "public",
    });
  } catch {
    // stil — activity is secundair.
  }
}

// Usernames per user_id (activity_events.user_id → auth.users, geen embed).
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToItem(row: any, usernames: Map<string, string>): ActivityItem {
  const actor = usernames.get(row.user_id) ?? "Player";
  const meta = (row.metadata ?? {}) as ActivityMeta;
  const { icon, text, href } = buildActivityText(
    row.event_type as ActivityEventType,
    meta
  );
  return {
    id: row.id,
    actor,
    actorInitials: initialsFrom(actor),
    actorHref: `/users/${actor}`,
    gradientClass: gradientForSlug(actor),
    icon,
    text,
    href,
    relativeTime: formatRelativeTime(row.created_at),
  };
}

export interface HomeActivity {
  items: ActivityItem[];
  scope: "following" | "you" | "empty";
}

const ACTIVITY_SELECT =
  "id, user_id, event_type, entity_type, entity_id, metadata, created_at";

// Activiteit voor de ingelogde home-feed. Toont primair de activiteit van
// gevolgde (publieke) gebruikers; volgt de bezoeker niemand of is dat leeg,
// dan valt het terug op de eigen recente activiteit.
export async function getHomeActivity(limit = 18): Promise<HomeActivity> {
  if (!isConfigured) return { items: [], scope: "empty" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { items: [], scope: "empty" };

  // Wie volgt de bezoeker?
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followingIds: string[] = (follows ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (f: any) => f.following_id
  );

  // 1) Feed van gevolgde gebruikers — alleen publieke events van publieke profielen.
  if (followingIds.length > 0) {
    const { data: pubProfiles } = await supabase
      .from("profiles")
      .select("user_id")
      .in("user_id", followingIds)
      .eq("visibility", "public");
    const publicIds: string[] = (pubProfiles ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.user_id
    );

    if (publicIds.length > 0) {
      const { data } = await supabase
        .from("activity_events")
        .select(ACTIVITY_SELECT)
        .in("user_id", publicIds)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (data && data.length > 0) {
        const usernames = await usernamesFor(
          supabase,
          data.map((r: { user_id: string }) => r.user_id)
        );
        return {
          items: data.map((r) => rowToItem(r, usernames)),
          scope: "following",
        };
      }
    }
  }

  // 2) Fallback: eigen recente activiteit (RLS staat eigen events altijd toe).
  const { data: own } = await supabase
    .from("activity_events")
    .select(ACTIVITY_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!own || own.length === 0) return { items: [], scope: "empty" };
  const usernames = await usernamesFor(
    supabase,
    own.map((r: { user_id: string }) => r.user_id)
  );
  return { items: own.map((r) => rowToItem(r, usernames)), scope: "you" };
}
