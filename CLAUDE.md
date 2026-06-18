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

## Design

- **Referenties:** zie de map [`designs/`](./designs) (1–6). Stijl = **iiSU / Shopii** (fan-made 3DS/console-UI): pastelgradiënten, glasmorfisme/frosted panels, fors afgeronde hoeken en pills, linker nav-rail + bovenste statusbalk, kaartgrids met depth, stats als pills. Volledige design language in `fases.md` §10.
- Richtinggevend, niet 1-op-1 kopiëren — Play3DS is een webapp met eigen content.

## Fase 1 (design prototype) — aanpak

- Wordt **direct in Next.js** gebouwd en op **Vercel** gedeployd (geen losse HTML/CSS-prototypes).
- Wordt **in kleine stukjes** opgeleverd (sub-fases 1.1–1.7, zie `fases.md` §17); elk stukje is los te bekijken op een Vercel preview-URL. Pas door naar het volgende na akkoord.
- Vercel-koppeling is actief: elke push naar `main` deployt naar productie ([play3ds.vercel.app](https://play3ds.vercel.app)), feature-branches krijgen een preview-URL.

## Osmo Supply-blokken — altijd eerst raadplegen

De map [`osmo_components/`](./osmo_components) bevat kant-en-klare HTML/CSS/JS-bronnen van Osmo Supply. **Raadpleeg deze map altijd als eerste** bij het zoeken naar een UI-component of animatie-idee, vóórdat je iets zelf bouwt of een externe library zoekt.

Beschikbare blokken (`.txt`-bestanden in `osmo_components/`):

| Bestand | Wat het doet | Relevantie |
|---|---|---|
| `depth_tiles_infinite_loop.txt` | 3D-carousel van kaarten, GSAP | Zeer hoog — game covers |
| `basic_gsap_slider.txt` | Draggable slider met snap, GSAP | Zeer hoog — library scroll |
| `layout_grid_flip.txt` | Grid/list toggle met GSAP Flip | Zeer hoog — library view |
| `button_with_rotating_icon.txt` | CTA-knop met roterend pijltje | Hoog — CTA's door de site |
| `toggle_switch.txt` | Gesegmenteerde tab-switcher | Hoog — status/view filters |
| `404_minigame.txt` | Interactief 404-spel, GSAP | Hoog — 404-pagina |
| `number_up_animation.txt` | Scroll-triggered cijferodometer | Hoog — stats/dashboard |
| `cascading_slider.txt` | Gestapelde slides met clip-path | Matig — featured sectie |
| `back_to_top_button.txt` | Floating scroll-to-top, GSAP | Laag — lange pagina's |
| `click_to_zoom_lightbox_image.txt` | Klik-zoom lightbox, GSAP | Matig — game screenshots |
| `socials_share_buttons.txt` | Deelknoppen (X, Reddit, …) | Matig — review-pagina |
| `scaling_hamburger_navigation.txt` | Uitschalende hamburger-nav | Laag — al eigen nav-rail |
| `parallax_image_slider.txt` | Parallax-slider, GSAP + Smooothy | Laag |
| `events_calander_date_picker.txt` | Kalender met event-kaarten | Niet van toepassing |

**Integratieregels (verplicht):**
- `data-`-attributen **niet** verwijderen of hernoemen — deze worden gebruikt door de JS-logica.
- Animatieaanpak respecteren (GSAP, CSS of combinatie) — niet zomaar omzetten naar een andere aanpak.
- Alleen visuele/stijlaanpassingen doorvoeren; de functionele kern van het blok ongewijzigd laten.
- De map `osmo_components/` staat in `.gitignore` en wordt niet meegecommit aan de repo.

## Conventies

- **Responsive:** mobile-first; desktop moet net zo sterk aanvoelen. Neem zowel desktop als mobiel mee bij UI-controle.
- **Themes:** light mode en dark mode beide ondersteunen.
- **Osmo Supply-blokken:** niet onnodig herschrijven; `data-`attributes niet verwijderen of hernoemen; animatieaanpak respecteren. Pas alleen visuele content/layout aan waar nodig.
- **Secrets:** geen API keys, tokens of secrets in de repo of documentatie. Environment variables horen in de Vercel/Supabase project settings.
- **Documentatietaal:** projectdocumentatie in het Nederlands; de website/UI-teksten in het Engels.
