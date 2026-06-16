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
  page.tsx         tijdelijke homepage (Phase 1.1 placeholder)
  page.css         homepage-specifieke stijlen
components/
  NavRail/         linker nav-rail (desktop) + bottom tab bar (mobiel)
  StatusBar/       vaste statusbalk bovenaan
designs/           visuele referenties (iiSU/Shopii-stijl, 1–6)
```

## Fase-status

| Fase | Omschrijving | Status |
|------|--------------|--------|
| 0 | Concept & productkeuzes | ✅ Afgerond |
| 1.1 | Foundation & shell | ✅ Afgerond |
| 1.2 | Game card & grid | ⏳ Volgende stap |
| 1.3–1.7 | Home feed, dashboard, game detail, review, login/register | 🔲 Gepland |
| 2–9 | Technical foundation → public launch | 🔲 Gepland |

## Documentatie

- **[`fases.md`](./fases.md)** — projectplan, MVP-scope en alle fases.
- **[`CLAUDE.md`](./CLAUDE.md)** — werkafspraken en stack voor de ontwikkeling.
- **[`designs/`](./designs)** — visuele referenties (iiSU/Shopii-stijl) voor de design language.

## Werkwijze

Testen en valideren gebeurt **via Vercel**, niet lokaal. Elke wijziging wordt gecontroleerd op een Vercel preview deployment (desktop én mobiel) en pas daarna naar productie. Zie `fases.md` §0 voor de volledige werkwijze.

> **Vercel-koppeling:** nog niet gelegd. Eenmalig handmatig in te stellen via Vercel dashboard → repo koppelen → elke push levert daarna automatisch een preview-URL op.
