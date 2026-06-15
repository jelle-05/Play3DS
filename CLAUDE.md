# CLAUDE.md — Play3DS

Werkafspraken en context voor Claude Code in dit project. Het volledige projectplan en de fases staan in [`fases.md`](./fases.md).

## Werkwijze: testen & valideren via Vercel (belangrijkste regel)

> Volledige beschrijving: zie `fases.md` §0.

- **Niet lokaal testen door de gebruiker.** Vraag de gebruiker nooit om de app lokaal te draaien of lokaal handmatig te valideren. De gebruiker zet geen lokale omgeving op.
- **Valideren via Vercel.** Elke wijziging wordt gecontroleerd op een **Vercel preview deployment** (per branch/commit) en, na merge, op **productie**.
- **Na elke wijziging:** pushen → Vercel build/deploy-status checken → functionele controle op de preview-URL (desktop én mobiel/responsive) → light/dark mode waar relevant → pas bij groen door naar productie.
- **Lokale commands zijn alleen voor Claude Code**, als optionele technische sanity-check vóór push (lint, type-check, build, tests), indien beschikbaar. Ze vervangen de Vercel-validatie nooit.
- **Eindcontrole en gebruikersvalidatie gebeuren altijd op de Vercel-deployment**, niet lokaal.

## Stack

- **Framework:** Next.js (App Router) — Server Components voor data-heavy pagina's, Client Components voor interactie, server actions/API routes voor mutations
- **Hosting:** Vercel
- **Database & Auth:** Supabase Postgres + Supabase Auth
- **CSS:** gewone CSS — globaal in `/app/globals.css`, per component in `/components/[component]/[component].css`
- **Animaties:** GSAP, vooral via Osmo Supply-blokken
- **Analytics:** Google Analytics

## Conventies

- **Responsive:** mobile-first; desktop moet net zo sterk aanvoelen. Neem zowel desktop als mobiel mee bij UI-controle.
- **Themes:** light mode en dark mode beide ondersteunen.
- **Osmo Supply-blokken:** niet onnodig herschrijven; `data-`attributes niet verwijderen of hernoemen; animatieaanpak respecteren. Pas alleen visuele content/layout aan waar nodig.
- **Secrets:** geen API keys, tokens of secrets in de repo of documentatie. Environment variables horen in de Vercel/Supabase project settings.
- **Documentatietaal:** projectdocumentatie in het Nederlands; de website/UI-teksten in het Engels.
