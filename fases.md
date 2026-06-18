# Play3DS — MVP Projectfases

**Werknaam:** Play3DS  
**Definitieve naam:** later bepalen  
**Website-taal:** Engels  
**Projectdocumentatie:** Nederlands  
**Kernbelofte:** _Track your Nintendo 3DS playthroughs fast and easy._

Play3DS wordt een clean, smooth en speels webplatform voor Nintendo 3DS-fans. Gebruikers kunnen bijhouden welke 3DS-games ze spelen, hebben afgerond, hebben gepauzeerd, hebben gedropt of nog willen spelen. De focus ligt op snelheid: een playthrough updaten moet binnen één minuut kunnen.

De visuele richting is een combinatie van **iiSU**, **Nintendo 3DS HOME Menu** en **Wii U Menu**, met nadruk op iiSU. De website moet voelen als een moderne, vloeiende game-library webapp, niet als een zware social media-app.

---

## 0. Werkwijze: testen & valideren via Vercel

Deze sectie legt de werkwijze voor testen en valideren vast. Ze geldt voor het hele project en heeft voorrang op losse formuleringen verderop in dit document.

### Geen lokale gebruikerstests

De applicatie wordt **niet lokaal door de eigenaar/gebruiker getest**. Verzoek de gebruiker nooit om de app lokaal te draaien (`npm run dev`, een lokale server, enz.) of om lokaal handmatig te valideren. De gebruiker hoeft geen lokale omgeving op te zetten.

### Validatie gebeurt via Vercel

Controle en validatie vinden **primair via Vercel** plaats:

- Elke branch/commit levert een **Vercel preview deployment** op.
- Na merge naar de hoofdbranch komt de wijziging op de **productie-deployment**.
- Alle functionele en visuele controle gebeurt op deze Vercel-URL's, niet lokaal.

### Stappen na elke wijziging

Claude Code doorloopt (of kaart aan) na elke wijziging deze checklist:

1. Wijziging pushen, zodat Vercel een **preview deployment** bouwt.
2. De **build/deploy-status** in Vercel controleren: build geslaagd, geen errors in de build log.
3. Functionele controle op de **preview-URL**: de betreffende pagina/flow werkt, inclusief **desktop én mobiel/responsive** gedrag.
4. **Light/dark mode** kort meenemen waar relevant.
5. Pas wanneer de preview groen en correct is → door naar **productie**.

### Lokale commands: alleen voor Claude Code, alleen technische checks

Lokale commands zijn **optioneel** en uitsluitend voor **Claude Code zelf**, als snelle technische sanity-check vóór een push. Indien beschikbaar mag Claude Code lokaal draaien:

- lint
- type-check
- build
- tests

Deze checks zijn nooit een vervanging van de Vercel-validatie en vragen geen actie van de gebruiker.

### Eindcontrole en gebruikersvalidatie = Vercel

De **definitieve controle en gebruikersvalidatie gebeuren altijd op de Vercel-deployment** (preview en/of productie), nooit op een lokale omgeving.

### Secrets

Zet **geen secrets, API keys of tokens** in dit document of in andere repobestanden. Environment variables blijven in de Vercel- en Supabase-projectinstellingen.

---

## 1. Productvisie

### Doelgroep

De primaire doelgroep bestaat uit:

- Nintendo 3DS-fans
- Nintendo-fans in bredere zin
- Gebruikers die hun game-backlog/playthroughs willen bijhouden
- Mensen die graag nostalgische, console-achtige interfaces gebruiken

### Hoofdwaarde

De hoofdwaarde van Play3DS is niet dat het een groot sociaal netwerk is, maar dat gebruikers snel en prettig hun 3DS-playthroughs kunnen bijhouden.

Belangrijkste acties:

- Zien wat je speelt
- Zien wat je hebt afgerond
- Zien wat je gepauzeerd hebt
- Zien wat je hebt gedropt
- Zien wat je nog wilt spelen
- Bijhouden hoeveel uur je in een game zit
- Automatisch een geschatte voortgang tonen
- Eventueel vastleggen waar je ongeveer bent in de game
- Na of tijdens een playthrough een review plaatsen

### Public launch

De MVP wordt openbaar gelanceerd. Geen invite-only beta. De eerste validatie gebeurt waarschijnlijk via enkele Reddit-posts in relevante Nintendo/3DS-community’s.

---

## 2. MVP-scope

### Moet in de MVP

De MVP moet minimaal deze functies bevatten:

1. Accountregistratie en login
2. Openbare homepage/app-feed
3. Dashboard voor ingelogde gebruikers
4. Complete Nintendo 3DS-gamebibliotheek
5. Game detailpagina’s
6. Playthrough starten vanaf een gamepagina
7. Playthrough beheren vanuit dashboard
8. Playthrough-statussen:
   - Want to Play
   - Playing
   - Paused
   - Completed
   - Dropped
9. Totale speeltijd per playthrough bijhouden
10. Geschatte voortgang berekenen op basis van gemiddelde speeltijd
11. Handmatig percentage kunnen invullen of corrigeren
12. Notitie/locatie in game kunnen toevoegen, bijvoorbeeld “Chapter 4” of “7 badges”
13. Update-timeline per playthrough
14. Meerdere playthroughs per game toestaan
15. Reviews plaatsen
16. Reviews liken
17. Simpele comments op reviews
18. Gebruikersprofielen
19. Openbare én privéprofielen
20. Follow-systeem zonder friend requests
21. Activity feed
22. Adminomgeving
23. Google Analytics
24. Feedbackmogelijkheid via formulier of mail

### Niet in de eerste MVP

Deze functies worden bewust niet als kern-MVP gezien:

- Dislikes op reviews
- Nested comments/reply threads
- Private messages
- Uitgebreide notificaties
- Achievements/badges
- 3DS homebrew companion app
- Native mobile app
- Complete lokale cover-mirror
- Complexe communitymoderatie
- Import/export voor gebruikers
- Volledig geautomatiseerde metadata-perfectie

---

## 3. Belangrijkste productregels

### Snelheid boven volledigheid

Een playthrough updaten moet zo snel mogelijk gaan. De standaard updateflow:

1. Dashboard openen
2. Game kiezen of quick update gebruiken
3. Totale speeltijd invullen
4. Optioneel notitie/locatie toevoegen
5. Opslaan

Doel: binnen één minuut klaar.

### Schatting duidelijk benoemen

Voortgang op basis van speeltijd is altijd een schatting. Gebruik daarom copy zoals:

- “Estimated progress”
- “Based on average playtime”
- “Approximately 42%”

Niet doen:

- “You are 42% complete” alsof het exact is.

### 100% alleen door gebruiker

Automatische progressie mag maximaal 99% worden, tenzij de gebruiker zelf de playthrough afrondt.

Voorbeeld:

```text
played_minutes / average_minutes * 100 = estimated_progress_percent
```

Maar:

```text
if status !== completed: max 99%
if status === completed: 100% mogelijk
```

---

## 4. Game library

### Scope

Alle Nintendo 3DS-games moeten vanaf de MVP vindbaar en trackbaar zijn.

De library bevat:

- Officiële fysieke 3DS-games
- 3DS eShop-only games
- Virtual Console
- DSiWare
- Homebrew, indien later relevant en beheersbaar
- Alle regio’s: EU, USA, Japan en overige regio’s

### Regio’s en aliases

Regio-edities en alternatieve titels worden waar mogelijk samengevoegd via aliases.

Voorbeeld:

```text
Hoofdgame: Professor Layton and the Miracle Mask
Aliases:
- Professor Layton en het Masker der Wonderen
- Professor Layton and the Mask of Miracle
```

Doel: zoeken moet goed werken zonder dat gebruikers onnodig dubbele games zien.

### Minimale metadata per game

Per game is gewenst:

- Titel
- Cover
- Releasejaar
- Genre
- Developer
- Publisher
- Gemiddelde speeltijd

Maar: games mogen in de MVP bestaan zonder volledige metadata.

### Metadata-status

Elke game krijgt een metadata-status:

```text
basic
```

Game is vindbaar en trackbaar, maar mist mogelijk cover, speeltijd of extra metadata.

```text
enriched
```

Game heeft cover en basisinformatie.

```text
verified
```

Game is handmatig gecontroleerd en heeft betrouwbare metadata.

### Fallback bij incomplete data

Als gemiddelde speeltijd ontbreekt:

- Toon wel de speeltijd van de gebruiker
- Laat handmatige progressie toe
- Laat eventueel eigen doeltijd instellen in een latere fase

Voor MVP minimaal:

```text
Average playtime unknown.
You can still track your own playtime and set progress manually.
```

---

## 5. Progressie en playthroughs

### Playthrough starten

Een gebruiker start een playthrough vanaf een game detailpagina.

Flow:

1. Gebruiker zoekt game
2. Opent game detailpagina
3. Klikt “Start playthrough”
4. Kiest doel
5. Vult eventueel huidige speeltijd in
6. Playthrough verschijnt in dashboard

### Doeltypes

Bij start kiest de gebruiker een doel:

- Main story
- Main + extras
- 100%
- Just tracking

Het doel bepaalt welke gemiddelde speeltijd wordt gebruikt voor de progressieberekening.

### Statussen

Beschikbare statuswaarden:

```text
want_to_play
playing
paused
completed
dropped
```

User-facing labels:

- Want to Play
- Playing
- Paused
- Completed
- Dropped

### Progressieberekening

Basisformule:

```text
estimated_progress_percent = played_minutes / average_minutes * 100
```

Voorbeeld:

```text
Played: 70 minutes
Average: 900 minutes
Progress: 7.7% → 8%
```

Als de game geen gemiddelde speeltijd heeft:

- Geen automatische progressie
- Handmatige progressie toestaan
- Wel speeltijd tonen

### Handmatige correctie

Gebruiker moet altijd zelf het percentage kunnen aanpassen. Dit voorkomt frustratie wanneer een gemiddelde speeltijd niet klopt.

Mogelijke velden:

- `estimated_progress_percent`
- `manual_progress_percent`
- `progress_source`

Progress source:

```text
external_average
manual
not_available
custom_target_later
```

### Update-timeline

Elke playthrough krijgt een timeline/logboek.

Voorbeeld:

```text
Jan 14
+30 min · now 7h 45m · ±42%
Note: Finished the 6th gym.
```

Timeline-events kunnen ontstaan door:

- Speeltijd-update
- Statuswijziging
- Progressiewijziging
- Notitie
- Completion
- Reviewplaatsing

### Meerdere playthroughs per game

Gebruikers mogen meerdere playthroughs van dezelfde game hebben.

Voorbeelden:

- Eerste playthrough
- Replay
- 100% run
- Challenge run
- Nuzlocke

Voor MVP kan dit simpel blijven met een optioneel label:

```text
Run name: First playthrough
Run name: 100% run
```

---

## 6. Reviews, likes en comments

### Wanneer mag iemand reviewen?

Gebruikers mogen altijd een review plaatsen, maar de review krijgt automatisch een label op basis van de playthrough-status:

- Playing review
- Completed review
- Dropped review
- Paused review

Dit zorgt ervoor dat er vanaf launch sneller content kan ontstaan, zonder dat reviews misleidend zijn.

### Reviewvelden

Een review bevat:

- Score van 1-10
- Titel
- Tekst
- Speeltijd op moment van review
- Completion type / goal type
- Statuslabel
- Spoiler-markering
- Timestamps

### Reviewacties

In MVP:

- Review plaatsen
- Review bewerken
- Review verwijderen
- Review liken
- Review rapporteren of admin laten verwijderen
- Simpele comments plaatsen

Niet in MVP:

- Dislikes
- Nested replies
- Uitgebreide comment threads

### Comments

Comments worden simpel gehouden:

- Eén niveau diep
- Geen nested replies
- Eigen comment kunnen verwijderen
- Admin kan comments verwijderen

---

## 7. Accounts, profielen en privacy

### Auth

MVP-authenticatie:

- E-mail + wachtwoord
- E-mailverificatie

Later mogelijk:

- Magic link
- OAuth zoals Google/Discord

### Profielvelden

Gebruikersprofielen kunnen bevatten:

- Username
- Avatar
- Bio
- Land/regio
- Favoriete game
- Openbare playthroughs
- Reviews
- Stats

### Username

Usernames zijn uniek.

### Privacy

Er komen openbare en privéprofielen.

Minimale privacy-instelling:

```text
Profile visibility: public / private
```

Aanbevolen later:

- Reviews openbaar/privé
- Playthroughs openbaar/privé
- Activity zichtbaar/verborgen

### Rollen

Rollen:

```text
user
admin
```

Admin is in eerste instantie alleen de eigenaar van het project.

Admin moet gebruikers kunnen:

- Bekijken
- Bewerken waar nodig
- Bannen
- Verwijderen
- Content modereren

---

## 8. Follow-systeem en activity feed

### Friend/follow systeem

MVP-keuze: volgen zonder friend requests.

Dus:

- Gebruiker A kan gebruiker B volgen
- Geen acceptatie nodig
- Geen vriendschapsstatus
- Geen chat

Dit is eenvoudiger en past beter bij een openbare community.

### Homepagina als app-feed

De homepagina toont meteen app-content.

Voor ingelogde gebruikers:

- Activity van gevolgde gebruikers
- Eigen recente playthroughs
- Waar je voor het laatst gebleven bent
- Openbare reviews
- Voorgestelde games
- Quick update-sectie

Voor niet-ingelogde gebruikers:

- Links: korte uitleg hoe Play3DS werkt
- Rechts op desktop: login/register-formulier
- Openbare activity/reviews/games kunnen zichtbaar blijven

### Activity-types

Voorbeelden:

- User started a playthrough
- User updated playtime
- User completed a game
- User reviewed a game
- User added a game to Want to Play
- User dropped a game

### Admin-activiteit uitsluiten van metrics

Activiteiten van de admin/eigenaar tellen niet mee in MVP-validatie-statistieken.

Daarom moet er in analytics/dashboard onderscheid zijn tussen:

- echte gebruikersactiviteit
- admin/testactiviteit

In database kan dit via:

```text
profiles.role = admin
```

Bij metrics:

```text
WHERE profiles.role != 'admin'
```

---

## 9. Dashboard

Het dashboard is het belangrijkste scherm na login.

### Dashboard moet tonen

- Actieve playthroughs
- Quick update per actieve game
- Statusgroepen:
  - Playing
  - Paused
  - Completed
  - Dropped
  - Want to Play
- Geschatte voortgang
- Totale speeltijd
- Laatste notitie/waar je gebleven bent
- Recent activity
- Persoonlijke statistieken
- MVP-validatiemetrics voor admin

### Quick update

Belangrijkste UX-element:

```text
Update playtime
[ hours ] [ minutes ]
Optional: where are you?
[ Save update ]
```

Ook mogelijk:

```text
+15m
+30m
+1h
Custom
```

### Admin dashboard metrics

Admin ziet MVP-validatiemetrics, exclusief adminactiviteit:

- Aantal geregistreerde gebruikers
- Aantal tracked playthroughs
- Aantal completed playthroughs
- Aantal reviews
- Aantal returning users binnen 14 dagen
- Aantal actieve niet-admin gebruikers

MVP succesdoelen:

```text
50 registered users
100 tracked playthroughs
25 completed playthroughs
15 reviews
10 returning users within 14 days
```

---

## 10. Front-end en designrichting

### Visuele stijl

De stijl wordt een combinatie van:

- iiSU
- 3DS HOME Menu
- Wii U Menu
- Clean moderne webapp

Nadruk: iiSU.

De interface moet smooth, speels en clean voelen. Niet te druk, niet te kinderachtig, maar wel duidelijk geïnspireerd op console-interfaces.

### Visuele referenties

De concrete visuele richting staat als referentiebeelden in de map [`designs/`](./designs):

- `designs/1.webp` — Shopii "Featured Community Submissions": linker nav-rail (My Page, Points, Library, Search, Home), bovenbalk met klok/datum, chunky afgeronde categorie-tiles met bold labels.
- `designs/2.png` — iiSU "NEW WAVE": Wii U-achtig menu met game-tilegrid, bovenste tabs, zachte mint/teal gradient, community-posts onderaan.
- `designs/3.png` — iiSU logo/splash: glasmorfisme, paars/blauwe gradient, frosted glass tiles.
- `designs/4.webp` — Music player (Sanctuary OS): album-art carousel, glassy now-playing card, console-knophints onderaan.
- `designs/5.webp` — Game detail (Ape Escape P!): full-bleed achtergrond, grote afgeronde cover, **Playtime-pill**, achievements-pill, media-thumbnail, verticale cover-carousel.
- `designs/6.jpg` — Shopii themes: linker pill-nav, themekaarten met gradients, detailpaneel rechts.

> Deze beelden tonen fan-made 3DS/console-UI (iiSU + Shopii). Ze zijn richtinggevend voor look & feel, niet 1-op-1 over te nemen — Play3DS is een webapp met eigen content.

### Design language (afgeleid uit de referenties)

- **Kleur:** zachte pastelgradiënten (paars↔blauw, mint/teal, perzik/oranje); heldere accentkleuren per categorie; veel lichte/witte ruimte.
- **Materiaal:** glasmorfisme / frosted translucent panels met subtiele schaduw en diepte.
- **Vorm:** fors afgeronde hoeken (chunky radius) en pill-vormen voor knoppen, tags en stats.
- **Typografie:** bold, speels-afgeronde display-font voor koppen; clean sans voor body.
- **Layout:** linker nav-rail (icoon + label) + bovenste statusbalk; kaartgebaseerde grids met depth/tilt; optioneel console-achtige knophints onderaan.
- **Stats als pill:** speeltijd, voortgang en status tonen als pills/badges (zie `designs/5.webp`).

### Themes

MVP ondersteunt:

- Light mode
- Dark mode

### Responsive aanpak

Ontwerpaanpak:

- Mobile-first
- Desktop moet uiteindelijk net zo sterk voelen

Belangrijk: mobiele gebruikers moeten snel hun playthrough kunnen updaten.

### Pagina’s in eerste designfase

- Home/app-feed
- Dashboard
- Game detail
- Playthrough detail
- Review pagina
- Profiel
- Login
- Register
- Admin basis

### Osmo Supply

Osmo Supply-blokken worden gebruikt als production-ready HTML/CSS/JS-resources voor animaties en UI-patronen.

Regels:

- Osmo-blokken niet onnodig herschrijven
- Belangrijke `data-` attributes niet verwijderen of hernoemen
- Animatieaanpak respecteren
- Alleen visuele content/layout aanpassen waar nodig
- Blokken gebruiken voor smooth interactions, transitions, buttons, navigatie en visual sections

> **Assets volgen later.** De daadwerkelijke Osmo-block code/exports staan nog in een aparte map op de pc van de eigenaar en worden later aangeleverd. Tot die tijd bouwt Claude Code met **placeholders/eigen componenten** die later 1-op-1 vervangbaar zijn door de echte Osmo-blokken — zonder de `data-`attributes en animatieaanpak te breken.

Reeds gebruikte/genoemde blokken:

- Button with Bubble Arrow
- Depth Tiles Infinite Loop
- Bold Full Screen Navigation

Mogelijk later handig:

- Page transition blocks
- Smooth menu/nav blocks
- Card hover blocks
- Loader/preloader blocks
- Scroll-based reveal blocks
- Marquee/activity blocks
- Tab/filter blocks
- Modal blocks

### Animatie

Gebruik animaties gericht en rustig.

Wel:

- Smooth hover states
- Subtiele page transitions
- Game-card depth/tilt/loop effecten
- Snelle feedback bij opslaan
- Mobile-friendly transitions

Niet:

- Trage flashy animaties die updates vertragen
- Overmatig scrolljacking
- Animaties die formulieren onduidelijk maken

---

## 11. Technische stack

### Gekozen stack

- Framework: Next.js
- Hosting: Vercel
- Database: Supabase Postgres
- Auth: Supabase Auth
- Backend/API: Next.js server routes/server actions waar passend
- CSS: gewone CSS met combinatie-aanpak
- Animaties: GSAP waar nodig, vooral via Osmo Supply-blokken
- Analytics: Google Analytics

### Next.js aanpak

Gebruik bij voorkeur:

- Next.js App Router
- Server Components voor data-heavy pagina’s
- Client Components voor interactieve UI
- API routes/server actions voor mutations
- Supabase client/server helpers

### CSS-aanpak

Combinatie van:

```text
/app/globals.css
/components/[component]/[component].css
```

Globale CSS voor:

- Reset/base
- Theme variables
- Typography
- Layout utilities

Component CSS voor:

- Game cards
- Hero
- Dashboard widgets
- Osmo-integraties
- Forms
- Modals

### API-first waar logisch

Het project wordt geen volledig aparte backend/frontend, maar wel API-first genoeg gebouwd om later mogelijk te maken:

- 3DS companion app
- Mobile app
- Externe integraties
- Public API

---

## 12. Data en externe bronnen

### Game metadata

Voorgestelde strategie:

- Primaire bron: IGDB
- Aanvullende bron: RAWG waar nuttig
- Eigen Supabase database als cache en source of truth binnen de app
- Handmatige admin-correcties mogelijk

### Gemiddelde speeltijd

Voorgestelde strategie:

- IGDB time-to-beat waar beschikbaar
- Aanvullende bronnen waar betrouwbaar
- Handmatige admin-invoer
- Later community-data gebruiken

### Caching

Alle externe API-data wordt gecachet in Supabase.

Redenen:

- Snelheid
- Minder afhankelijkheid van externe API’s
- Handmatige correcties mogelijk
- Consistente user experience

### Covers

MVP:

- Covers via externe URL tonen

Latere fase:

- Lokale mirror/back-up voor covers
- Broken image-detectie
- Admin cover override

---

## 13. Adminomgeving

### Admin nodig in MVP

Ja. Omdat alle 3DS-games in de MVP moeten zitten, is een adminomgeving belangrijk.

### Adminfunctionaliteit

Admin moet kunnen:

- Games toevoegen
- Games bewerken
- Covers aanpassen
- Speeltijden invullen
- Metadata-status aanpassen
- Aliases beheren
- Reviews verwijderen
- Comments verwijderen
- Gebruikers beheren
- Gebruikers bannen/verwijderen
- CSV importeren
- Metrics bekijken

### CSV-import

Ook al is er nu nog geen eigen CSV, het systeem moet import via CSV ondersteunen.

CSV kan later gebruikt worden voor:

- Complete game library import
- Metadata-updates
- Aliases
- Releasejaren
- Covers

### Metadata-statussen

Te gebruiken statussen:

```text
basic
enriched
verified
```

---

## 14. Routes en pagina’s

### Publieke routes

```text
/
/games
/games/[slug]
/reviews
/reviews/[id]
/users/[username]
/login
/register
```

### Beschermde routes

```text
/dashboard
/playthroughs/[id]
/settings
/settings/profile
/settings/privacy
```

### Admin routes

```text
/admin
/admin/games
/admin/games/new
/admin/games/[id]
/admin/users
/admin/reviews
/admin/comments
/admin/import
/admin/metrics
```

### Homepagina

De homepage is niet alleen marketing. Het is direct een app-achtige feed.

Niet-ingelogd op desktop:

- Links: korte uitleg en openbare content
- Rechts: login/register-formulier

Ingelogd:

- Persoonlijke feed
- Quick updates
- Reviews
- Voorgestelde games
- Activiteit van gevolgde gebruikers

---

## 15. Databaseconcept

Onderstaande structuur is richtinggevend, geen definitieve migration.

### profiles

```sql
id uuid primary key
user_id uuid references auth.users(id)
username text unique not null
avatar_url text
bio text
country text
favorite_game_id uuid null
visibility text default 'public'
role text default 'user'
is_banned boolean default false
created_at timestamp
updated_at timestamp
```

### games

```sql
id uuid primary key
title text not null
slug text unique not null
platform text default 'Nintendo 3DS'
release_year int
cover_url text
genre text
developer text
publisher text
metadata_status text default 'basic'
igdb_id text
rawg_id text
created_at timestamp
updated_at timestamp
```

### game_aliases

```sql
id uuid primary key
game_id uuid references games(id)
alias text not null
region text
created_at timestamp
```

### game_time_estimates

```sql
id uuid primary key
game_id uuid references games(id)
source text
main_minutes int
main_extra_minutes int
completionist_minutes int
confidence text
sample_count int
created_at timestamp
updated_at timestamp
```

### playthroughs

```sql
id uuid primary key
user_id uuid references auth.users(id)
game_id uuid references games(id)
run_name text
status text not null
goal_type text
played_minutes int default 0
estimated_progress_percent int
manual_progress_percent int
progress_source text
progress_note text
started_at timestamp
completed_at timestamp
visibility text default 'public'
created_at timestamp
updated_at timestamp
```

### playthrough_updates

```sql
id uuid primary key
playthrough_id uuid references playthroughs(id)
user_id uuid references auth.users(id)
previous_status text
new_status text
played_minutes int
minutes_added int
estimated_progress_percent int
manual_progress_percent int
progress_note text
created_at timestamp
```

### reviews

```sql
id uuid primary key
user_id uuid references auth.users(id)
game_id uuid references games(id)
playthrough_id uuid references playthroughs(id)
rating int
label text
status_at_review text
title text
body text
has_spoilers boolean default false
likes_count int default 0
comments_count int default 0
visibility text default 'public'
created_at timestamp
updated_at timestamp
```

### review_likes

```sql
id uuid primary key
review_id uuid references reviews(id)
user_id uuid references auth.users(id)
created_at timestamp
unique(review_id, user_id)
```

### review_comments

```sql
id uuid primary key
review_id uuid references reviews(id)
user_id uuid references auth.users(id)
body text
is_deleted boolean default false
created_at timestamp
updated_at timestamp
```

### follows

```sql
id uuid primary key
follower_id uuid references auth.users(id)
following_id uuid references auth.users(id)
created_at timestamp
unique(follower_id, following_id)
```

### activity_events

```sql
id uuid primary key
user_id uuid references auth.users(id)
event_type text
entity_type text
entity_id uuid
metadata jsonb
visibility text default 'public'
created_at timestamp
```

---

## 16. MVP-validatie

### Succesmetrics

Voor de eerste publieke MVP zijn realistische doelen:

```text
50 registered users
100 tracked playthroughs
25 completed playthroughs
15 reviews
10 returning users within 14 days
```

### Admin telt niet mee

Activiteiten van admin/testaccounts tellen niet mee in deze metrics.

### Dashboardweergave

Admin dashboard toont:

- MVP progress bar per metric
- Totaal aantal echte gebruikers
- Aantal actieve gebruikers
- Aantal playthroughs
- Aantal completions
- Aantal reviews
- Retentie binnen 14 dagen

Voorbeeld:

```text
MVP Validation
Users: 18 / 50
Tracked playthroughs: 42 / 100
Completed playthroughs: 8 / 25
Reviews: 5 / 15
Returning users: 3 / 10
```

---

## 17. Fases

## Fase 0 — Concept & productkeuzes

Doel: alle belangrijke keuzes vastleggen voordat er gebouwd wordt.

Taken:

- Werknaam vastleggen: Play3DS
- Definitieve naam later bepalen
- Kernbelofte vastleggen
- MVP-scope bepalen
- Niet-MVP functies parkeren
- Visuele richting bepalen
- Stack bepalen
- Validatiemetrics bepalen

Output:

- `fases.md`
- Basis projectbrief
- MVP feature list

---

## Fase 1 — Design prototype

Doel: de feel van de website testen voordat alle backend gebouwd wordt.

### Aanpak

- Het prototype wordt **direct in Next.js** gebouwd en op **Vercel** gedeployd (geen losse HTML/CSS/JS-bestanden). Zo loopt validatie meteen via de Vercel preview-deployment (zie §0).
- Fase 1 wordt **in kleine stukjes** opgeleverd: elke sub-fase is een afgerond, los te bekijken stukje op een Vercel preview-URL. Pas na akkoord op een stukje door naar het volgende.
- Visuele richting volgt de referenties in [`designs/`](./designs) en de design language uit §10. Met mock/dummy-data; nog geen echte backend.

### Voorwaarden

- **Vercel-koppeling is nog niet gelegd** (komt nog). Zodra het repo aan een Vercel-project hangt, levert elke push een preview-URL op.
- Een **minimale Next.js + Vercel-setup** is de eerste praktische stap van Fase 1 (overlapt met Fase 2; alleen het strikt noodzakelijke om te kunnen deployen).
- Echte Osmo-blokken volgen later → tot dan placeholders (zie §10).

### Sub-fases (in stukjes)

- **Fase 1.1 — Foundation & shell:** minimale Next.js-app + Vercel-deploy, design tokens (kleur/gradients/radius/typografie/shadows uit §10), globale CSS, light/dark basis, app-shell (linker nav-rail + bovenste statusbalk). ✅
- **Fase 1.2 — Game card & grid:** game card component met depth/tilt + library-achtig grid, responsive (mobiel én desktop). ✅
- **Fase 1.3 — Home/app-feed:** ingelogd vs. niet-ingelogd, feed-secties, suggested games. Geïmplementeerd: twee-state homepage via `DEMO_SIGNED_IN`, niet-ingelogde split-layout (hero + DepthTiles + auth-panel), ingelogde feed (stats-pills, actieve playthroughs, QuickUpdate-preview, ActivityFeed, suggested games, review-previews). Auth is prototype-UI; Supabase volgt in Fase 1.7/2. ✅
- **Fase 1.4 — Dashboard & Quick update:** dashboard met statusgroepen + het quick-update component (de kernbelofte: updaten binnen één minuut). Geïmplementeerd: nieuwe `/dashboard`-route met header + stats-pills (playing/completed/total/want), prominente Quick update bovenaan (hergebruik `QuickUpdate`), statusgroepen (Playing/Paused/Want to Play/Completed/Dropped) via nieuw `DashboardLibrary`-component met `ToggleSwitch`-filter en vriendelijke empty states. Nieuwe helpers `STATUS_GROUPS` + `groupGamesByStatus` in `lib/games.ts`; Dashboard toegevoegd aan `NavRail` (Home → Dashboard → Library → Search → Profile); gedeelde `feed-section*`-stijlen verplaatst naar `globals.css`. Mock-data; auth/Supabase volgt in Fase 1.7/2. ✅
- **Fase 1.5 — Game detail hero:** full-bleed hero met cover, playtime-/status-pills, "Start playthrough". Geïmplementeerd: nieuwe SSG-route `/games/[slug]` (prerender per game via `generateStaticParams`, `notFound()`-fallback) — lost ook de bestaande GameCard-links op. Nieuw `GameDetailHero`-component: full-bleed blurred backdrop o.b.v. cover-gradient, grote afgeronde cover, status/playtime/geschatte-voortgang/rating/avg-pills, voortgangsbalk en "Start/Continue playthrough"-CTA (ButtonIcon, prototype → /dashboard). Daaronder About + details-grid met fallback-copy bij ontbrekende metadata. `Game`-type uitgebreid met optionele `developer`/`publisher`/`description`/`averagePlaytime`; helper `getGameById`. Mock-data; echte start-playthrough-flow + auth volgen later. ✅
- **Fase 1.6 — Review card:** reviewkaart met score, label en spoiler-markering. Geïmplementeerd: nieuw `ReviewCard`-component (auteur + avatar, gekleurde score-badge 1–10, statuslabel-pill "Playing/Completed/Paused/Dropped review", titel + body, **spoiler-blur met tap-to-reveal**, playtime-/goal-pills, like-toggle + comment-count). Nieuwe `lib/reviews.ts` (`Review`-type, `MOCK_REVIEWS`, `reviewStatusLabel`, `getReviewsForGame`). Nieuwe publieke route `/reviews` (feed) en een reviews-sectie op de game-detailpagina (`showGame={false}`). Discoverability-links vanaf de homepage (logged-out + HomeFeed). Mock-data; likes/comments/auth volgen in Fase 5/2. ✅
- **Fase 1.7 — Login/register layout:** auth-schermen (alleen UI, nog geen echte auth). Geïmplementeerd: nieuw herbruikbaar `AuthForm`-component (login/register-tabs via `ToggleSwitch`, prototype-velden username/email/password, forgot-password, disclaimer, proto-notice) + gecentreerde auth-page/card-layout. Nieuwe publieke routes `/login` (`initialTab="login"`) en `/register` (`initialTab="register"`) met brand-link naar home en kruislinks tussen login/register; lost de bestaande "Get Started → /register"-CTA op (was 404). `HomeAuthPanel` op de homepage blijft ongewijzigd. Geen echte auth — koppeling aan Supabase volgt in Fase 2. ✅

> **Fase 1 (design prototype) is hiermee volledig afgerond.** Volgende stap: Fase 2 — technical foundation (Supabase, auth, database) waarin de prototype-UI's aan echte data/auth worden gekoppeld.
- **Osmo-integratie:** echte Osmo-blokken inpassen zodra de assets zijn aangeleverd.

Belangrijk:

- Smooth maar functioneel
- iiSU als hoofdinspiratie
- Mobile-first
- Desktop moet rijk aanvoelen
- Elk stukje controleren op de Vercel preview-URL (desktop én mobiel, light/dark)

Output:

- Werkende Next.js-prototypes op Vercel, stukje voor stukje
- Herbruikbare componenten + design tokens
- Eerste visuele stijlset (iiSU/Shopii-gericht)

---

## Fase 2 — Technical foundation

Doel: technische basis neerzetten.

Taken:

- Next.js project opzetten
- Supabase project aanmaken
- Supabase Auth configureren
- Vercel deploy instellen (preview deployments worden hét validatiekanaal — zie §0)
- Environment variables instellen (in Vercel/Supabase, niet in de repo)
- Database schema eerste versie maken
- RLS policies voorbereiden
- Basis layout maken
- Globale CSS/theme variables maken
- Google Analytics voorbereiden

Output:

- Werkende Next.js app
- Supabase gekoppeld
- Login/register technisch mogelijk
- Eerste deploy op Vercel

> **Status (in uitvoering):**
> - **2.1 — foundation (code klaar):** `@supabase/ssr` + `@supabase/supabase-js`; client-helpers (`lib/supabase/client.ts`, `server.ts`, `middleware.ts`); root `middleware.ts` voor sessie-refresh (veilig no-op zonder env-vars); `.env.example`; volledige DB-schema + RLS + triggers in `supabase/migrations/0001_initial_schema.sql`; Google Analytics-scaffold (`components/Analytics`, alleen actief met `NEXT_PUBLIC_GA_ID`); handmatige stappen in `SETUP.md`.
> - **Handmatig (eigenaar):** Supabase-project aanmaken, SQL-migratie draaien, auth configureren, env-vars in Vercel zetten — zie `SETUP.md`.
> - **2.2 — auth wiring (afgerond):** server actions `signIn`/`signUp`/`signOut` (`app/auth/actions.ts`); `AuthForm` gekoppeld via `useActionState` met inline errors/messages; `/login` + `/register` redirecten ingelogde gebruikers naar `/dashboard`; `app/auth/confirm` route voor e-mailbevestiging; `lib/auth.ts` `getSessionUser()` (user + profiel); homepage toont echte signed-in feed i.p.v. `DEMO_SIGNED_IN`; NavRail toont Log in vs Log out o.b.v. sessie. Database-schema + RLS zijn live op Supabase (migraties 0001 + 0002).
>
> Hierna volgt **Fase 3 — game library & metadata**: echte games uit de database i.p.v. de mock-data.

---

## Fase 3 — Game library & metadata

Doel: alle 3DS-games vindbaar en trackbaar maken.

Taken:

- Databronnen onderzoeken en kiezen
- IGDB-integratie opzetten
- RAWG-aanvulling onderzoeken
- Game import-script maken
- Games opslaan in Supabase
- Aliases ondersteunen
- Metadata-statussen toevoegen
- Covers via externe URL tonen
- Time estimates opslaan
- Fallback ondersteunen bij ontbrekende data
- Admin CSV-import voorbereiden

Output:

- Complete basic game library
- Verrijkte metadata waar beschikbaar
- Game search werkt
- Game detailpagina toont data

> **Bron-keuze:** IGDB als primaire bron (time-to-beat voedt de voortgangsschatting); RAWG/CSV optioneel later. IGDB vereist een (gratis) Twitch dev-app → credentials als env-vars, nodig bij 3.4.
>
> **Status (in uitvoering):**
> - **3.1 — library uit DB (afgerond):** 10 games geseed in de `games`-tabel (via MCP); `lib/catalog.ts` met `getCatalogGames` / `getCatalogGameBySlug` (server-queries, mock-fallback zonder env); `/games` en `/games/[slug]` lezen nu uit Supabase (detail = dynamisch i.p.v. SSG). `Game`-type gesplitst in catalogus-metadata vs. optionele playthrough-velden; `gradientForSlug` voor cover-kleur zolang er geen echte cover-URL is. Dashboard/home/reviews draaien nog op mock t/m Fase 4/5.
> - **3.2 — search (afgerond):** `/search`-route met een gedebouncede `SearchBar` (query in de URL `?q=`, server-side resultaten in de bestaande `GameGrid`). Postgres-functie `search_games` (migratie 0003) zoekt op titel én aliassen, **accent-ongevoelig** ("pokemon" vindt "Pokémon") via de `unaccent`-extensie, met dedupe en relevantie-sortering (prefix-match eerst). `searchCatalogGames` in `lib/catalog.ts` roept de RPC aan, met mock-fallback zonder env.
> - **3.3 — admin games + CSV-import (afgerond):** owner-only adminomgeving onder `/admin` (role-gate in `app/admin/layout.tsx`, `force-dynamic`; Admin-link in de NavRail enkel voor admins). Overzicht met metadata-status-tellingen, games-tabel, `/admin/games/new` + `/admin/games/[id]` (gedeelde `GameForm`) met aliasbeheer en verwijderen. `/admin/import`: CSV plakken/uploaden → upsert op slug, aliases (`|`-gescheiden) vervangen, per-rij foutrapportage. Bouwstenen: `lib/csv.ts` (parser + `slugify`), `lib/admin.ts` (queries), `app/admin/actions.ts` (server actions, `requireAdmin`). Schrijven loopt via de RLS-policies `*_admin_write` (`is_admin()`), geen service-role nodig.
> - **3.4 — volledige catalogus via IGDB (afgerond):** `lib/igdb.ts` (Twitch-OAuth met token-cache, gepagineerde 3DS-games platform 37/137 + `game_time_to_beats`), server-action `syncIgdbPage(offset)` (één pagina/500 per call → bulk-upsert games op slug + time-estimates in `game_time_estimates`, source `igdb`), en `/admin/igdb` met client-`IgdbSync` die de pagina's in een lus afroept met live voortgang. `isIgdbConfigured`-guard: zonder `IGDB_CLIENT_ID`/`IGDB_CLIENT_SECRET` toont de pagina uitleg en blijft de sync inert (zie SETUP.md §8). Cover-URL's via IGDB-images, metadata-status `enriched` bij cover. **Daarmee is Fase 3 compleet.**
> - **3.x — library-performance (na de IGDB-sync van ~2256 games):** `/games` laadde alle kaarten in één keer (~1,3MB). Opgelost met paginatie: `getCatalogPage(limit, offset)` (+ totaalcount), een `GameLibrary`-client met **"Load more"** (48 per batch via server-action `fetchCatalogPage`), en de Featured-slider beperkt tot 8.

---

## Fase 4 — Core playthrough tracking

Doel: de belangrijkste waarde van Play3DS bouwen.

Taken:

- Playthrough starten vanaf gamepagina
- Doeltype kiezen
- Status opslaan
- Totale speeltijd opslaan
- Estimated progress berekenen
- Handmatige progressie toestaan
- Progress source opslaan
- Playthrough dashboard bouwen
- Quick update bouwen
- Timeline events opslaan
- Meerdere playthroughs per game toestaan

Output:

- Gebruiker kan games tracken
- Dashboard werkt
- Quick update werkt
- Timeline werkt
- Geschatte voortgang werkt

> **Opdeling (volgens de gebruikersreis):**
> - **4.1 — datalaag + "Start playthrough" (afgerond):** `lib/playthrough-types.ts` (client-safe types/labels/progressie-helpers: `averageMinutesForGoal`, `computeProgress`, `effectiveProgress`, `formatMinutes`) + `lib/playthroughs.ts` (server-queries `getTimeEstimateForGame`, `getPlaythroughsForGame`). Start-flow op de game-detailpagina via `PlaythroughPanel` + client-`StartPlaythrough` (doel kiezen, optionele huidige speeltijd, run-naam) → server-action `startPlaythrough` (berekent estimated progress uit IGDB-speeltijd + doeltype, schrijft eerste timeline-event, redirect naar dashboard). Detailpagina toont nu echte gemiddelde speeltijd en bestaande playthroughs; hero-CTA linkt naar de track-sectie.
> - **4.2 — dashboard op echte data (volgende).**
> - **4.3 — quick update (echte opslag).**
> - **4.4 — playthrough-detail + timeline.**

---

## Fase 5 — Reviews, comments & likes

Doel: lichte communitylaag toevoegen.

Taken:

- Reviewmodel bouwen
- Review plaatsen bij game/playthrough
- Review label bepalen op basis van status
- Score 1-10
- Spoiler-markering
- Review bewerken/verwijderen
- Review likes
- Simpele comments
- Admin delete voor reviews/comments
- Publieke reviewpagina

Output:

- Reviews werken
- Likes werken
- Comments werken zonder nested replies
- Reviews zichtbaar op gamepagina’s en profielen

---

## Fase 6 — Profiles, privacy & activity feed

Doel: gebruikers en activiteit zichtbaar maken.

Taken:

- Profielpagina bouwen
- Username uniek maken
- Avatar/bio/regio/favoriete game
- Public/private profielinstelling
- Follow-systeem bouwen
- Activity events genereren
- Home feed bouwen
- Feed voor gevolgde gebruikers
- Openbare activity tonen
- Eigen recente activiteit tonen

Output:

- Profielen werken
- Follow werkt
- Activity feed werkt
- Home voelt als app-dashboard

---

## Fase 7 — Admin dashboard & moderation

Doel: platform beheersbaar maken.

Taken:

- Admin routes beveiligen
- Games beheren
- Covers aanpassen
- Speeltijden invullen
- Aliases beheren
- Metadata-status wijzigen
- Reviews verwijderen
- Comments verwijderen
- Gebruikers beheren
- Gebruikers bannen/verwijderen
- CSV import
- MVP metrics dashboard
- Adminactiviteiten uitsluiten van metrics

Output:

- Admin kan platform beheren
- Metrics zichtbaar
- Basis moderation aanwezig

---

## Fase 8 — Polish, performance & Osmo animations

Doel: de app echt smooth en launchwaardig maken.

> Alle controles in deze fase gebeuren op de **Vercel preview/productie-URL**, niet lokaal (zie §0).

Taken:

- Osmo Supply-blokken netjes integreren
- Animaties testen op mobiel (op de Vercel preview-URL)
- Interacties versnellen waar nodig
- Loading states toevoegen
- Empty states ontwerpen
- Error states ontwerpen
- Forms verbeteren
- Image fallback toevoegen
- Performance check (op de Vercel-deployment)
- Lighthouse/PageSpeed check (op de Vercel-deployment)
- Accessibility basischeck (op de Vercel-deployment)
- Dark/light mode polish

Output:

- Smooth UX
- Minder bugs
- Betere performance
- Launchwaardige interface

---

## Fase 9 — Public beta launch

Doel: live zetten en animo testen.

Taken:

- Productieomgeving controleren (op de Vercel-productiedeployment — zie §0)
- Testaccounts verwijderen of markeren als admin/test
- Analytics controleren
- Feedbackformulier/mail instellen
- Eerste Reddit-post voorbereiden
- Known issues documenteren
- Monitoring doen na launch
- Metrics bijhouden

Output:

- Publieke MVP live
- Eerste gebruikers binnenhalen
- Feedback verzamelen

---

## Fase 10 — Post-launch improvements

Doel: op basis van echte gebruikersdata verbeteren.

Mogelijke verbeteringen:

- Magic link login
- Lokale cover mirror/back-up
- Community average playtimes
- Betere progressvragen per game
- Badges/achievements
- Notifications
- Meer Osmo transitions
- Game recommendations
- Meer privacy-instellingen
- Public API
- 3DS companion app

---

## 18. Openstaande keuzes voor later

Nog niet definitief:

- Definitieve projectnaam
- Logo/branding
- Exacte game metadata-bronnen per veld
- Of homebrew direct in MVP volledig wordt ondersteund
- Cookiebanner/analytics consent-aanpak
- Of magic link snel na launch komt
- Exacte Osmo-blokken per pagina
- Lokale cover mirror-strategie
- Community-richtlijnen/moderatiebeleid

---

## 19. MVP samengevat

De eerste versie van Play3DS moet vooral dit goed doen:

> Een gebruiker kan snel een Nintendo 3DS-game vinden, een playthrough starten, speeltijd bijhouden, geschatte voortgang zien, status wijzigen, een timeline opbouwen en reviews/community-activiteit bekijken.

De communitylaag is belangrijk, maar blijft simpel. De kern is tracking.

De website moet aanvoelen als een smooth, moderne, iiSU-geïnspireerde 3DS-library webapp.
