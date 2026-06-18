# Play3DS — Setup

Deze handleiding beschrijft de **handmatige stappen** die nodig zijn om Supabase,
de environment variables en (optioneel) IGDB te koppelen. Claude Code kan dit niet
voor je doen — het zijn acties in de Supabase-, Vercel- en Twitch-dashboards.

> Geen secrets in de repo. Alle keys horen in Vercel/Supabase project settings.

## 1. Supabase-project aanmaken

1. Ga naar <https://supabase.com> → **New project**.
2. Kies een naam (bijv. `play3ds`), een sterk database-wachtwoord en een regio
   dicht bij je gebruikers (bijv. `eu-central`).
3. Wacht tot het project klaar is.

## 2. Database-schema laden

1. Open in Supabase **SQL Editor** → **New query**.
2. Draai de migraties uit [`supabase/migrations/`](./supabase/migrations) op volgorde:
   - `0001_initial_schema.sql` — tabellen, triggers en RLS-policies
   - `0002_security_hardening.sql` — `search_path`/grants-hardening
   - `0003_search_games.sql` — `unaccent`-extensie + `search_games`-functie
3. Klik per query **Run**.

> Heeft Claude Code de Supabase MCP gekoppeld (§7), dan zijn deze migraties al
> via `apply_migration` toegepast en kun je deze stap overslaan.

## 3. Auth configureren

1. Supabase → **Authentication → Providers → Email**: zorg dat **Email** aanstaat.
2. **Authentication → URL Configuration**:
   - **Site URL**: je productie-URL (bijv. `https://play3ds.vercel.app`).
   - **Redirect URLs**: voeg ook de Vercel preview-URL('s) toe en
     `http://localhost:3000` (optioneel).
3. E-mailverificatie staat standaard aan (conform `fases.md` §7). Voor sneller
   testen kun je "Confirm email" tijdelijk uitzetten.

## 4. Keys ophalen

Supabase → **Project Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> De app gebruikt **geen** service-role key — alle toegang loopt via de
> ingelogde gebruiker + RLS-policies (admin-acties via `is_admin()`).

## 5. Environment variables in Vercel zetten

Vercel → je project → **Settings → Environment Variables**. Voeg toe voor
**Production** én **Preview**:

| Naam | Waarde |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL uit stap 4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `NEXT_PUBLIC_GA_ID` | (optioneel) Google Analytics measurement id |
| `IGDB_CLIENT_ID` / `IGDB_CLIENT_SECRET` | (optioneel) IGDB-catalogus — zie §8 |

Daarna een nieuwe deploy triggeren (of opnieuw pushen) zodat de vars actief worden.

## 6. Klaar

Zodra deze stappen gedaan zijn, draait de app op echte data: auth, de IGDB-
catalogus, playthrough-tracking en reviews/comments/likes. Zonder env-vars
blijft de site renderen op mock-data (de Supabase-code is veilig inert).

> `.env.example` bevat de namen van alle variabelen. Lokaal testen (optioneel,
> alleen Claude Code) kan via een `.env.local` met dezelfde namen.

## 7. (Optioneel) Supabase MCP voor Claude Code

Om Claude Code rechtstreeks migraties te laten draaien en de database te laten
inspecteren, kan een **Supabase MCP-server** worden gekoppeld via een lokaal
`.mcp.json` in de projectroot:

- `.mcp.json` staat in `.gitignore` — het bevat een **Personal Access Token** en
  hoort **nooit** in de repo.
- De server is gescope't op één project via `--project-ref`.
- Na het plaatsen van het bestand: **Claude Code herstarten** en de `supabase`-
  server **goedkeuren** (project-scoped servers vragen eenmalig toestemming).
- De token is op elk moment in te trekken in Supabase → Account → Access Tokens.

Dit is puur een ontwikkelhulpmiddel; het staat los van de app-runtime (die de
keys uit de Vercel env-vars gebruikt).

## 8. (Fase 3.4) IGDB-catalogus koppelen

De volledige 3DS-catalogus wordt opgehaald uit **IGDB**. IGDB gebruikt
**Twitch**-authenticatie, dus je hebt een gratis Twitch developer-app nodig.

1. Ga naar <https://dev.twitch.tv/console/apps> en log in (Twitch-account +
   2FA vereist). Klik **Register Your Application**.
   - **Name:** bijv. `Play3DS`
   - **OAuth Redirect URLs:** `http://localhost` (wordt niet gebruikt, maar is verplicht)
   - **Category:** Application Integration
2. Open de aangemaakte app → noteer de **Client ID** en genereer een **Client Secret**.
3. Zet beide als environment variables in Vercel (**Production** én **Preview**):

   | Naam | Waarde |
   |------|--------|
   | `IGDB_CLIENT_ID` | Client ID uit Twitch |
   | `IGDB_CLIENT_SECRET` | Client Secret uit Twitch |

   > Server-only — **geen** `NEXT_PUBLIC_`-prefix. De secret hoort nooit in de repo.
4. Nieuwe deploy triggeren. Daarna verschijnt op **`/admin/igdb`** de sync-knop.
   De sync haalt de 3DS-games (platform 37 + New 3DS 137, main games) en
   time-to-beat-schattingen op, in pagina's van 500, en **upsert** ze op `slug`
   (her-runnen dupliceert nooit). Zonder de env-vars toont de pagina een uitleg
   en blijft de sync inert.
