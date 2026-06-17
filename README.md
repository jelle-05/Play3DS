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
  page.tsx         homepage — twee-state (niet-ingelogd / ingelogd), DEMO_SIGNED_IN constante
  page.css         homepage-specifieke stijlen
  dashboard/
    page.tsx       dashboard — header + stats, Quick update, statusgroepen
    page.css       dashboard-specifieke stijlen
  games/
    page.tsx       game-bibliotheek met slider + grid
    [slug]/
      page.tsx     game detail — hero + about/details (SSG per game)
      page.css     detailpagina-specifieke stijlen
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
  HomeFeed/        ingelogde homepage-feed (stats, playthroughs, activiteit, reviews)
  HomeAuthPanel/   login/register prototype-panel (tabs, placeholder fields; geen echte auth)
  ActivityFeed/    verticale activiteitenfeed met icons en tijdstempels
  QuickUpdate/     quick-update prototype (game kiezen, tijd optellen, mock save)
lib/
  games.ts         Game type (+ optionele detail-metadata) + MOCK_GAMES (10 games) + STATUS_GROUPS / groupGamesByStatus / getGameById
  homeFeed.ts      MockUser, HomeStats, ActivityItem, ReviewPreview + mock-data
designs/           visuele referenties (iiSU/Shopii-stijl, 1–6)
```

> **Data:** alle data is placeholder. `lib/games.ts` voor games, `lib/homeFeed.ts` voor feed/user-data. Supabase/auth volgen in Fase 2.
>
> **Auth:** `HomeAuthPanel` is een prototype-UI — geen echte login/registratie. Auth wordt gekoppeld in Fase 1.7 / Fase 2.

## Fase-status

| Fase | Omschrijving | Status |
|------|--------------|--------|
| 0 | Concept & productkeuzes | ✅ Afgerond |
| 1.1 | Foundation & shell | ✅ Afgerond |
| 1.2 | Game card & grid | ✅ Afgerond |
| 1.3 | Home/app-feed (niet-ingelogd + ingelogd prototype) | ✅ Afgerond |
| 1.4 | Dashboard & Quick update | ✅ Afgerond |
| 1.5 | Game detail hero | ✅ Afgerond |
| 1.6 | Review card | ⏳ Volgende stap |
| 1.7 | Login/register layout | 🔲 Gepland |
| 2–9 | Technical foundation → public launch | 🔲 Gepland |

## Documentatie

- **[`fases.md`](./fases.md)** — projectplan, MVP-scope en alle fases.
- **[`CLAUDE.md`](./CLAUDE.md)** — werkafspraken en stack voor de ontwikkeling.
- **[`designs/`](./designs)** — visuele referenties (iiSU/Shopii-stijl) voor de design language.

## Werkwijze

Testen en valideren gebeurt **via Vercel**, niet lokaal. Elke wijziging wordt gecontroleerd op een Vercel preview deployment (desktop én mobiel) en pas daarna naar productie. Zie `fases.md` §0 voor de volledige werkwijze.

> **Vercel-koppeling:** nog niet gelegd. Eenmalig handmatig in te stellen via Vercel dashboard → repo koppelen → elke push levert daarna automatisch een preview-URL op.
