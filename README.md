# Play3DS

_Track your Nintendo 3DS playthroughs fast and easy._

Een clean, smooth en speels webplatform om je Nintendo 3DS-playthroughs bij te houden.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Plain CSS — `app/globals.css` voor tokens, `components/[Name]/[Name].css` per component
- **Fonts:** Fredoka (display) + Inter (body) via `next/font/google`
- **Hosting:** Vercel
- **Database & Auth:** Supabase (volgt in Fase 2)
- **Animaties:** GSAP / Osmo Supply (volgen in Fase 8)

## Scripts

```bash
npm run dev    # development server (localhost:3000)
npm run build  # productie build + type-check
npm run lint   # ESLint check
npm start      # productie server starten na build
```

> De gebruiker test nooit lokaal. Validatie vindt altijd plaats via **Vercel preview deployments**. Zie `fases.md` §0.

## Projectstructuur

```
app/
  globals.css      design tokens, reset, shell layout, utility classes
  layout.tsx       root layout — StatusBar + NavRail + main
  page.tsx         homepage — twee-state via echte Supabase-sessie (niet-ingelogd / ingelogde feed)
  auth/
    actions.ts     server actions: signIn / signUp / signOut
    confirm/route.ts  e-mailbevestiging / OTP-callback
  page.css         homepage-specifieke stijlen
  dashboard/
    page.tsx       dashboard — header + stats, Quick update, statusgroepen
    page.css       dashboard-specifieke stijlen
  games/
    page.tsx       game-bibliotheek met slider + grid
    [slug]/
      page.tsx     game detail — hero + about/details + reviews (SSG per game)
      page.css     detailpagina-specifieke stijlen
  reviews/
    page.tsx       community review-feed (ReviewCard grid)
    page.css       reviews-pagina-specifieke stijlen
  login/
    page.tsx       login-scherm (AuthForm, initialTab="login")
  register/
    page.tsx       register-scherm (AuthForm, initialTab="register")
components/
  NavRail/         linker nav-rail (desktop) + bottom tab bar (mobiel)
  StatusBar/       vaste statusbalk bovenaan
  GameCard/        herbruikbare game-kaart (gradient cover, progress bar, pills)
  GameGrid/        Osmo Layout Grid Flip — grid met comfort/compact toggle
  GameSlider/      Osmo Basic GSAP Slider — horizontale draggable slider
  ButtonIcon/      Osmo Button with Rotating Icon — CTA-knoppen
  DepthTiles/      Osmo Depth Tiles Infinite Loop — 3D game-carousel
  ToggleSwitch/    Osmo Toggle Switch — gesegmenteerde statusfilter
  LibraryFilter/   game-bibliotheek met statusfilter (op /games)
  DashboardLibrary/ dashboard-statusgroepen met ToggleSwitch-filter + empty states (GSAP Flip)
  GameDetailHero/  full-bleed game detail hero (cover, status/playtime/progress-pills, CTA)
  ReviewCard/      reviewkaart — score, statuslabel, spoiler-reveal, like-toggle
  HomeFeed/        ingelogde homepage-feed (stats, playthroughs, activiteit, reviews)
  AuthForm/        herbruikbaar login/register-formulier + auth-page layout (/login, /register)
  ThemeToggle/     light/dark toggle in de StatusBar (data-theme + localStorage)
  ActivityFeed/    verticale activiteitenfeed met icons en tijdstempels
  QuickUpdate/     quick-update prototype (game kiezen, tijd optellen, mock save)
  Analytics/       Google Analytics scaffold (alleen actief met NEXT_PUBLIC_GA_ID)
lib/
  games.ts         Game type + MOCK_GAMES (fallback) + STATUS_GROUPS / groupGamesByStatus / gradientForSlug
  catalog.ts       catalogus-queries op Supabase (getCatalogPage / getCatalogGameBySlug) + mock-fallback
  homeFeed.ts      MockUser, HomeStats, ActivityItem, ReviewPreview + mock-data
  reviews.ts       Review type + MOCK_REVIEWS + reviewStatusLabel / getReviewsForGame
  supabase/        Supabase client-helpers — client.ts (browser), server.ts (SSR), middleware.ts (sessie-refresh)
middleware.ts      ververst de Supabase-sessie per request (no-op zonder env-vars)
supabase/
  migrations/      SQL-migraties — 0001_initial_schema.sql (tabellen + RLS + triggers)
designs/           visuele referenties (iiSU/Shopii-stijl, 1–6)
```

> **Data:** UI draait nog op placeholder-data (`lib/games.ts`, `lib/homeFeed.ts`, `lib/reviews.ts`). Vanaf Fase 2.2 wordt dit aan Supabase gekoppeld.
>
> **Setup:** Supabase/Vercel-koppeling vereist handmatige stappen — zie [`SETUP.md`](./SETUP.md). De Supabase-code is veilig inert zonder env-vars. Optioneel kan Claude Code via een lokale, gitignored `.mcp.json` (Supabase MCP-server) migraties draaien — zie `SETUP.md` §7.

## Fase-status

| Fase | Omschrijving | Status |
|------|--------------|--------|
| 0 | Concept & productkeuzes | ✅ Afgerond |
| 1.1 | Foundation & shell | ✅ Afgerond |
| 1.2 | Game card & grid | ✅ Afgerond |
| 1.3 | Home/app-feed (niet-ingelogd + ingelogd prototype) | ✅ Afgerond |
| 1.4 | Dashboard & Quick update | ✅ Afgerond |
| 1.5 | Game detail hero | ✅ Afgerond |
| 1.6 | Review card | ✅ Afgerond |
| 1.7 | Login/register layout | ✅ Afgerond |
| 2.1 | Supabase-foundation + DB-schema | ✅ Afgerond — schema + RLS live op Supabase |
| 2.2 | Auth wiring (login/register/logout op echte auth) | ✅ Afgerond |
| 3.1 | Game library uit de database (seed + catalogus-queries) | ✅ Afgerond |
| 3.2 | Game search (`/search`, titel + aliassen, accent-ongevoelig) | ✅ Afgerond |
| 3.3 | Admin games + CSV-import (`/admin`, owner-only) | ✅ Afgerond |
| 3.4 | Volledige catalogus (IGDB-sync via `/admin/igdb`) | ✅ Afgerond |
| 4.1 | Playthrough starten (datalaag + start-flow op detailpagina) | ✅ Afgerond |
| 4.2 | Dashboard op echte data | ✅ Afgerond |
| 4.3 | Quick update (echte opslag) | ✅ Afgerond |
| 4.4 | Playthrough-detail + timeline (`/playthroughs/[id]`) | ✅ Afgerond |
| 5.1 | Reviews uit de database (read) | ✅ Afgerond |
| 5.2 | Review schrijven/bewerken/verwijderen | ✅ Afgerond |
| 5.3 | Review likes | ⏳ Volgende stap |
| 5.4 | Comments + `/reviews/[id]` | 🔲 Gepland |
| 6–9 | Profielen → public launch | 🔲 Gepland |

## Documentatie

- **[`fases.md`](./fases.md)** — projectplan, MVP-scope en alle fases.
- **[`CLAUDE.md`](./CLAUDE.md)** — werkafspraken en stack voor de ontwikkeling.
- **[`designs/`](./designs)** — visuele referenties (iiSU/Shopii-stijl) voor de design language.

## Werkwijze

Testen en valideren gebeurt **via Vercel**, niet lokaal. Elke wijziging wordt gecontroleerd op een Vercel preview deployment (desktop én mobiel) en pas daarna naar productie. Zie `fases.md` §0 voor de volledige werkwijze.

> **Vercel-koppeling:** nog niet gelegd. Eenmalig handmatig in te stellen via Vercel dashboard → repo koppelen → elke push levert daarna automatisch een preview-URL op.
