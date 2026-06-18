// IGDB-client (server-only). Auth via Twitch OAuth (client credentials).
// Vereist env-vars IGDB_CLIENT_ID en IGDB_CLIENT_SECRET (geen NEXT_PUBLIC_*).
// Zonder die vars is isIgdbConfigured false en doet de sync niets.
//
// Docs: https://api-docs.igdb.com/  — platform 37 = Nintendo 3DS, 137 = New 3DS.

import { slugify } from "@/lib/csv";

export const isIgdbConfigured =
  !!process.env.IGDB_CLIENT_ID && !!process.env.IGDB_CLIENT_SECRET;

const PLATFORM_3DS = 37;
const PLATFORM_NEW_3DS = 137;
const PAGE_SIZE = 500; // IGDB-maximum per request

// IGDB cover-images: t_cover_big geeft een nette covergrootte.
function coverUrl(imageId?: string): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
}

export interface IgdbGame {
  igdbId: string;
  title: string;
  slug: string;
  releaseYear: number | null;
  genre: string | null;
  developer: string | null;
  publisher: string | null;
  description: string | null;
  coverUrl: string | null;
}

export interface IgdbTimeToBeat {
  igdbGameId: number;
  mainMinutes: number | null;
  completionistMinutes: number | null;
  sampleCount: number | null;
}

/* ── Token (in-memory cache binnen een warme serverless-instantie) ──── */
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value;
  }

  const params = new URLSearchParams({
    client_id: process.env.IGDB_CLIENT_ID!,
    client_secret: process.env.IGDB_CLIENT_SECRET!,
    grant_type: "client_credentials",
  });

  const res = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, {
    method: "POST",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Twitch auth failed (${res.status}). Check your IGDB credentials.`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  };
  return json.access_token;
}

// Lage-niveau apicalypse-request.
async function igdbRequest<T>(endpoint: string, body: string): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": process.env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IGDB ${endpoint} failed (${res.status}): ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/* ── Games ─────────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeGame(row: any): IgdbGame {
  const companies = Array.isArray(row.involved_companies)
    ? row.involved_companies
    : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dev = companies.find((c: any) => c.developer)?.company?.name ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pub = companies.find((c: any) => c.publisher)?.company?.name ?? null;
  const year =
    typeof row.first_release_date === "number"
      ? new Date(row.first_release_date * 1000).getUTCFullYear()
      : null;

  const title: string = row.name ?? "Untitled";
  const slug: string = row.slug ? slugify(row.slug) : slugify(title);

  return {
    igdbId: String(row.id),
    title,
    slug,
    releaseYear: year,
    genre: row.genres?.[0]?.name ?? null,
    developer: dev,
    publisher: pub,
    description: row.summary ?? null,
    coverUrl: coverUrl(row.cover?.image_id),
  };
}

// Haalt één pagina 3DS-games op (category 0 = main game). Lege array = klaar.
export async function fetchIgdb3dsGamesPage(offset: number): Promise<IgdbGame[]> {
  const body = `
    fields name, slug, summary, first_release_date, category,
           genres.name, cover.image_id,
           involved_companies.company.name,
           involved_companies.developer,
           involved_companies.publisher;
    where (platforms = (${PLATFORM_3DS}) | platforms = (${PLATFORM_NEW_3DS})) & category = 0;
    sort id asc;
    limit ${PAGE_SIZE};
    offset ${offset};
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await igdbRequest<any[]>("games", body);
  return rows.map(normalizeGame);
}

export const IGDB_PAGE_SIZE = PAGE_SIZE;

/* ── Time to beat ──────────────────────────────────────────────────── */
// game_time_to_beats: tijden in seconden (hastily/normally/completely).
export async function fetchIgdbTimeToBeats(
  igdbGameIds: string[]
): Promise<IgdbTimeToBeat[]> {
  if (igdbGameIds.length === 0) return [];
  const ids = igdbGameIds.join(",");
  const body = `
    fields game_id, normally, completely, count;
    where game_id = (${ids});
    limit ${PAGE_SIZE};
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await igdbRequest<any[]>("game_time_to_beats", body);
  return rows.map((r) => ({
    igdbGameId: r.game_id,
    mainMinutes: typeof r.normally === "number" ? Math.round(r.normally / 60) : null,
    completionistMinutes:
      typeof r.completely === "number" ? Math.round(r.completely / 60) : null,
    sampleCount: typeof r.count === "number" ? r.count : null,
  }));
}
