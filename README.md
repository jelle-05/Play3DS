# Play3DS

_Track your Nintendo 3DS playthroughs fast and easy._

Een clean, smooth en speels webplatform om je Nintendo 3DS-playthroughs bij te houden.

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Plain CSS — `app/globals.css` voor tokens, `components/[Name]/[Name].css` per component
- **Fonts:** Fredoka (display) + Inter (body) via `next/font/google`
- **Hosting:** Vercel (productie: [play3ds.vercel.app](https://play3ds.vercel.app))
- **Database & Auth:** Supabase (Postgres + RLS + Supabase Auth) — live
- **Externe data:** IGDB-catalogus (via Twitch-OAuth) als bron, gecachet in Supabase
- **Animaties:** GSAP / Osmo Supply

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
  globals.css            design tokens, reset, shell layout, utility classes
  layout.tsx             root layout — StatusBar + NavRail + main
  page.tsx               homepage — twee-state via echte Supabase-sessie
  page.css               homepage-specifieke stijlen
  auth/
    actions.ts           server actions: signIn / signUp / signOut
    confirm/route.ts     e-mailbevestiging / OTP-callback
  dashboard/page.tsx     dashboard — stats + Quick update + statusgroepen (echte playthroughs)
  games/
    page.tsx             game-bibliotheek — Featured slider + gepagineerde library
    actions.ts           fetchCatalogPage (Load more)
    [slug]/page.tsx      game detail — hero + about/details + playthrough-panel + reviews
  search/page.tsx        zoekpagina (?q=, titel + aliassen, accent-ongevoelig)
  playthroughs/
    actions.ts           start/update/status/progress/note/delete + addPlaytime
    [id]/page.tsx        playthrough-detail + timeline + manager
  reviews/
    page.tsx             community review-feed
    actions.ts           create/update/delete review, like, add/delete comment
    [id]/page.tsx        review-detail + comments
  users/[username]/page.tsx  publiek profiel — hero + stats + publieke library + reviews
  profile/page.tsx       redirect naar het eigen publieke profiel (of /login)
  admin/                 owner-only adminomgeving (layout met role-gate)
    page.tsx             overview · games/ · import/ · igdb/ · actions.ts
  login/ register/       AuthForm-schermen
components/
  NavRail/ StatusBar/ ThemeToggle/ SmoothScroll/ Analytics/   shell + chrome
  GameCard/ GameGrid/ GameSlider/ GameLibrary/ DepthTiles/     catalogus-UI
  SearchBar/ ToggleSwitch/ ButtonIcon/ LibraryFilter/          controls
  GameDetailHero/ StartPlaythrough/ PlaythroughPanel/          game-detail + tracking
  PlaythroughManager/ DashboardLibrary/ QuickUpdate/           dashboard + playthrough-beheer
  ReviewCard/ ReviewComposer/ ReviewComments/                  reviews + comments
  AuthForm/ HomeFeed/ ActivityFeed/                            auth + home-feed
  admin/  GameForm · ImportForm · IgdbSync                     admin-componenten
lib/
  games.ts           Game type + MOCK_GAMES (fallback) + STATUS_GROUPS / gradientForSlug
  catalog.ts         catalogus-queries (getCatalogPage / getCatalogGameBySlug) + mock-fallback
  auth.ts            getSessionUser() — ingelogde gebruiker + profiel/rol
  profiles.ts        publiek-profiel-queries (profiel, stats, library) + RLS-respect
  admin.ts           admin-queries (games, aliassen)
  csv.ts             CSV-parser + slugify (admin-import)
  igdb.ts            IGDB-client (Twitch-OAuth, 3DS-games + time-to-beat) + diagnostiek
  playthrough-types.ts  client-safe types/labels/progressie-helpers
  playthroughs.ts    server-queries voor playthroughs
  reviews.ts         Review/ReviewComment types + helpers + MOCK_REVIEWS (fallback)
  reviews-db.ts      reviews/likes/comments uit Supabase (mock-fallback)
  homeFeed.ts        mock-data voor de ingelogde home-feed
  supabase/          client.ts (browser) · server.ts (SSR) · middleware.ts (sessie-refresh)
middleware.ts        ververst de Supabase-sessie per request (no-op zonder env-vars)
supabase/
  migrations/        0001_initial_schema · 0002_security_hardening · 0003_search_games
designs/             visuele referenties (iiSU/Shopii-stijl, 1–6)
```

> **Data:** catalogus, playthroughs en reviews/comments/likes draaien op **Supabase**. Zonder env-vars vallen de meeste queries veilig terug op mock-data (`lib/games.ts`, `lib/reviews.ts`, `lib/homeFeed.ts`) zodat de app blijft renderen.
>
> **Setup:** Supabase/Vercel/IGDB-koppeling vereist handmatige stappen — zie [`SETUP.md`](./SETUP.md). Optioneel kan Claude Code via een lokale, gitignored `.mcp.json` (Supabase MCP-server) migraties draaien — zie `SETUP.md` §7.

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
| 5.3 | Review likes | ✅ Afgerond |
| 5.4 | Comments + `/reviews/[id]` | ✅ Afgerond |
| 6.1 | Publieke profielpagina (`/users/[username]`) + `/profile`-redirect | ✅ Afgerond |
| 6.2 | Profiel bewerken + privacy (public/private) | 🔲 Gepland |
| 6.3 | Follow-systeem | 🔲 Gepland |
| 6.4 | Activity events + echte home-feed | 🔲 Gepland |
| 7–9 | Admin dashboard → public launch | 🔲 Gepland |

## Documentatie

- **[`fases.md`](./fases.md)** — projectplan, MVP-scope en alle fases (met per-fase status).
- **[`SETUP.md`](./SETUP.md)** — handmatige setup: Supabase, auth, env-vars, MCP, IGDB.
- **[`CLAUDE.md`](./CLAUDE.md)** — werkafspraken en stack voor de ontwikkeling.
- **[`designs/`](./designs)** — visuele referenties (iiSU/Shopii-stijl) voor de design language.

## Werkwijze

Testen en valideren gebeurt **via Vercel**, niet lokaal. Elke wijziging gaat via een feature-branch → PR → merge naar `main`, en wordt gecontroleerd op de Vercel-deployment (desktop én mobiel, light/dark). Zie `fases.md` §0 voor de volledige werkwijze.

> **Vercel-koppeling:** actief. Elke push naar `main` levert automatisch een productie-deploy op ([play3ds.vercel.app](https://play3ds.vercel.app)); feature-branches krijgen een preview-URL.
