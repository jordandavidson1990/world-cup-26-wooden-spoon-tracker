# Wooden Spoon Watch — World Cup 2026 Tracker

A Next.js (App Router) + TypeScript app that tracks the **worst-placed
team** across all 48 nations at the 2026 FIFA World Cup, ranked by:

1. Fewest points
2. Worst goal difference (tiebreak)
3. Fewest goals scored (tiebreak)
4. Worst disciplinary record — most card points, 1 per yellow + 4 per red
   (final tiebreak)

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## How it works

- **`lib/teams.ts`** — the official 48-team list and groups (A–L) from the
  5 December 2025 FIFA final draw.
- **`lib/fixtures.ts`** — generates the 72 group-stage matches (6 per
  group) using a standard round-robin pattern across 3 matchdays.
- **`lib/standings.ts`** — computes the live table for every team from
  whichever matches have results, and sorts worst → best using the
  criteria above.
- **`context/TournamentContext.tsx`** — holds match results in React
  state and saves them to `localStorage`, so your entered scores persist
  between visits in the same browser.
- **`components/MatchEditor.tsx`** — pick a group and matchday, then enter
  scores, yellow cards and red cards for each fixture.
- **`components/WoodenSpoonHero.tsx`** & **`StandingsTable.tsx`** — the
  "Wooden Spoon Watch" headline card and the full sortable/filterable
  table, with the current last-placed team highlighted.

## Live results sync (optional)

Instead of typing every score in by hand, the app can pull real group-stage
results from [football-data.org](https://www.football-data.org), which has
a free tier covering the FIFA World Cup.

1. [Register for a free API key](https://www.football-data.org/client/register)
   (instant, no credit card).
2. Copy `.env.local.example` to `.env.local` and paste your key in:
   ```bash
   cp .env.local.example .env.local
   ```
3. Restart `npm run dev`. On the page, use the **Live results sync** panel
   to fetch the latest scores, or tick **Auto-refresh every 5 minutes** to
   keep it updating during matchdays.

How it works:

- `app/api/sync/route.ts` is a server-side route handler that calls
  `https://api.football-data.org/v4/competitions/WC/matches` using your API
  key (kept server-side, never exposed to the browser).
- `lib/teamAliases.ts` maps the team names/codes returned by the API onto
  the internal team ids in `lib/teams.ts` (handling naming differences like
  "Korea Republic" vs "South Korea" or "Czech Republic" vs "Czechia").
- `TournamentContext.applyResults()` merges any matched scores into the
  fixture list, pairing fixtures up by the two teams involved regardless of
  which side the API calls "home".

**Card data**: the free football-data.org tier doesn't include bookings
(yellow/red cards), so disciplinary numbers still need to be entered by hand
in the **Enter match results** section below the sync panel — the sync only
overwrites scores, never cards, unless the API response happens to include a
`bookings` array. If you upgrade to a provider that does include card-level
data (e.g. API-Football / api-sports.io), you can swap the fetch URL and
response parsing in `app/api/sync/route.ts`; `SyncedResult` already has
optional `homeYellow`/`awayYellow`/`homeRed`/`awayRed` fields ready for it.

If a fixture's teams don't resolve, the sync panel lists the unmatched names
so you can extend `TEAM_NAME_ALIASES`.

## Notes & customisation

- The fixture pairings (which teams play which other teams on which
  matchday) are generated programmatically rather than copied from the
  official match schedule. If you want the editor to follow the exact
  real-world kick-off order, edit `ROUND_ROBIN_PATTERN` in
  `lib/fixtures.ts` or the team order within each group in `lib/teams.ts`.
- Disciplinary points use a simplified FIFA-style formula (1 per yellow,
  4 per red). If you'd rather track the official tie-breaker exactly
  (which distinguishes a second-yellow red from a straight red), extend
  the `Match` type in `lib/types.ts` with separate fields and update the
  calculation in `lib/standings.ts`.
- All data is stored locally in the browser — there's no backend or
  database. To share a live leaderboard with other people, you'd want to
  swap `TournamentContext` for a small API + database (e.g. a Next.js
  route handler backed by Postgres or a key-value store).
# world-cup-26-wooden-spoon-tracker
