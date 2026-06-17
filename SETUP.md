# Play3DS — Setup (Fase 2)

Deze handleiding beschrijft de **handmatige stappen** die nodig zijn om Supabase
en de environment variables te koppelen. Claude Code kan dit niet voor je doen —
het zijn acties in de Supabase- en Vercel-dashboards.

> Geen secrets in de repo. Alle keys horen in Vercel/Supabase project settings.

## 1. Supabase-project aanmaken

1. Ga naar <https://supabase.com> → **New project**.
2. Kies een naam (bijv. `play3ds`), een sterk database-wachtwoord en een regio
   dicht bij je gebruikers (bijv. `eu-central`).
3. Wacht tot het project klaar is.

## 2. Database-schema laden

1. Open in Supabase **SQL Editor** → **New query**.
2. Plak de volledige inhoud van [`supabase/migrations/0001_initial_schema.sql`](./supabase/migrations/0001_initial_schema.sql).
3. Klik **Run**. Dit maakt alle tabellen, triggers en RLS-policies aan.

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
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (geheim, alleen server)

## 5. Environment variables in Vercel zetten

Vercel → je project → **Settings → Environment Variables**. Voeg toe voor
**Production** én **Preview**:

| Naam | Waarde |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL uit stap 4 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `NEXT_PUBLIC_GA_ID` | (optioneel) Google Analytics measurement id |

Daarna een nieuwe deploy triggeren (of opnieuw pushen) zodat de vars actief worden.

## 6. Klaar

Zodra deze stappen gedaan zijn, kan Claude Code verder met **Fase 2.2 — auth
wiring** (`/login`, `/register`, logout op echte Supabase Auth). Tot die tijd
blijft de site werken met de prototype-UI; de Supabase-code is veilig inert
zonder env-vars.

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
