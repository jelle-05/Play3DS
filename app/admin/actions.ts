"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { parseCsvObjects, slugify } from "@/lib/csv";

const META_STATUSES = ["basic", "enriched", "verified"] as const;
type MetaStatus = (typeof META_STATUSES)[number];

// Gooit (redirect) als de huidige gebruiker geen admin is. RLS dekt dit ook af,
// maar dit geeft een nette redirect i.p.v. een stille database-fout.
async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function intOrNull(value: string): number | null {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function metaStatus(value: string): MetaStatus {
  return (META_STATUSES as readonly string[]).includes(value)
    ? (value as MetaStatus)
    : "basic";
}

// Bouwt de game-payload uit een formulier (gedeeld door create/update).
function gamePayload(formData: FormData) {
  const title = str(formData, "title");
  const slugInput = str(formData, "slug");
  return {
    title,
    slug: slugInput ? slugify(slugInput) : slugify(title),
    platform: str(formData, "platform") || "Nintendo 3DS",
    release_year: intOrNull(str(formData, "release_year")),
    genre: str(formData, "genre") || null,
    developer: str(formData, "developer") || null,
    publisher: str(formData, "publisher") || null,
    cover_url: str(formData, "cover_url") || null,
    description: str(formData, "description") || null,
    metadata_status: metaStatus(str(formData, "metadata_status")),
  };
}

export async function createGame(formData: FormData) {
  await requireAdmin();
  const payload = gamePayload(formData);
  if (!payload.title || !payload.slug) return;

  const supabase = await createClient();
  const { error } = await supabase.from("games").insert(payload);
  if (error) {
    redirect(`/admin/games/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/games");
  revalidatePath("/games");
  redirect("/admin/games");
}

export async function updateGame(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;
  const payload = gamePayload(formData);
  if (!payload.title || !payload.slug) return;

  const supabase = await createClient();
  const { error } = await supabase.from("games").update(payload).eq("id", id);
  if (error) {
    redirect(`/admin/games/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${id}`);
  revalidatePath("/games");
  redirect("/admin/games");
}

export async function deleteGame(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("games").delete().eq("id", id);

  revalidatePath("/admin/games");
  revalidatePath("/games");
  redirect("/admin/games");
}

export async function addAlias(formData: FormData) {
  await requireAdmin();
  const gameId = str(formData, "game_id");
  const alias = str(formData, "alias");
  const region = str(formData, "region") || null;
  if (!gameId || !alias) return;

  const supabase = await createClient();
  await supabase.from("game_aliases").insert({ game_id: gameId, alias, region });

  revalidatePath(`/admin/games/${gameId}`);
}

export async function deleteAlias(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const gameId = str(formData, "game_id");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("game_aliases").delete().eq("id", id);

  if (gameId) revalidatePath(`/admin/games/${gameId}`);
}

/* ── CSV-import ───────────────────────────────────────────────────────
   Verwachte kolommen (header-rij, hoofdletterongevoelig):
   title (verplicht), slug, platform, release_year, genre, developer,
   publisher, cover_url, description, metadata_status, aliases
   Aliases zijn |-gescheiden ("Naam A|Naam B"). Per rij worden bestaande
   aliases vervangen wanneer de kolom is meegegeven (CSV = bron van waarheid).
   Upsert gaat op slug; ontbrekende slug wordt uit de titel afgeleid.        */

export interface ImportResult {
  ok: boolean;
  created: number;
  updated: number;
  total: number;
  errors: { line: number; message: string }[];
  message?: string;
}

export async function importGamesCsv(
  _prev: ImportResult,
  formData: FormData
): Promise<ImportResult> {
  await requireAdmin();

  const csv = String(formData.get("csv") ?? "").trim();
  const empty: ImportResult = { ok: false, created: 0, updated: 0, total: 0, errors: [] };
  if (!csv) return { ...empty, message: "Paste some CSV data first." };

  let rows: Record<string, string>[];
  try {
    rows = parseCsvObjects(csv);
  } catch {
    return { ...empty, message: "Could not parse the CSV." };
  }
  if (rows.length === 0) {
    return { ...empty, message: "No data rows found (is the header row present?)." };
  }

  const supabase = await createClient();
  const errors: ImportResult["errors"] = [];
  let created = 0;
  let updated = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const line = i + 2; // +1 header, +1 1-based
    const title = (row.title ?? "").trim();
    if (!title) {
      errors.push({ line, message: "Missing title." });
      continue;
    }
    const slug = row.slug ? slugify(row.slug) : slugify(title);
    if (!slug) {
      errors.push({ line, message: "Could not derive a slug." });
      continue;
    }

    const payload = {
      title,
      slug,
      platform: (row.platform ?? "").trim() || "Nintendo 3DS",
      release_year: intOrNull((row.release_year ?? "").trim()),
      genre: (row.genre ?? "").trim() || null,
      developer: (row.developer ?? "").trim() || null,
      publisher: (row.publisher ?? "").trim() || null,
      cover_url: (row.cover_url ?? "").trim() || null,
      description: (row.description ?? "").trim() || null,
      metadata_status: metaStatus((row.metadata_status ?? "").trim()),
    };

    // Bestaat de game al? (bepaalt created vs updated + game_id voor aliases)
    const { data: existing } = await supabase
      .from("games")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    const { data: upserted, error } = await supabase
      .from("games")
      .upsert(payload, { onConflict: "slug" })
      .select("id")
      .maybeSingle();

    if (error || !upserted) {
      errors.push({ line, message: error?.message ?? "Upsert failed." });
      continue;
    }
    if (existing) updated++;
    else created++;

    // Aliases (optioneel) — vervang bestaande wanneer de kolom is meegegeven.
    if (typeof row.aliases === "string" && row.aliases.trim() !== "") {
      const aliases = row.aliases
        .split("|")
        .map((a) => a.trim())
        .filter(Boolean);
      await supabase.from("game_aliases").delete().eq("game_id", upserted.id);
      if (aliases.length > 0) {
        await supabase.from("game_aliases").insert(
          aliases.map((alias) => ({ game_id: upserted.id, alias }))
        );
      }
    }
  }

  revalidatePath("/admin/games");
  revalidatePath("/games");

  return {
    ok: errors.length === 0,
    created,
    updated,
    total: rows.length,
    errors,
    message: `Imported ${created + updated} of ${rows.length} rows (${created} new, ${updated} updated).`,
  };
}
