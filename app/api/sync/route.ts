import { NextResponse } from "next/server";
import { resolveTeamId } from "../../../lib/teamAliases";
import { SyncedResult, SyncResponse } from "../../../lib/types";

const FOOTBALL_DATA_URL =
  "https://api.football-data.org/v4/competitions/WC/matches";

// football-data.org "card" types seen in the bookings array.
type BookingCard = "YELLOW_CARD" | "YELLOW_RED_CARD" | "RED_CARD";

interface ApiTeam {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
}

interface ApiBooking {
  team: ApiTeam;
  card: BookingCard;
}

interface ApiMatch {
  id: number;
  status: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
  };
  bookings?: ApiBooking[];
}

interface ApiResponse {
  matches: ApiMatch[];
}

/** Best-effort: try the FIFA-style code first, then the full team name. */
function identifyTeam(team: ApiTeam): { id: string | null; name: string } {
  const name = team.shortName || team.name;
  const id =
    (team.tla && resolveTeamId(team.tla)) || resolveTeamId(name) || null;
  return { id, name };
}

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    const body: SyncResponse = {
      ok: false,
      error:
        "FOOTBALL_DATA_API_KEY is not set. Get a free key from https://www.football-data.org/client/register and add it to .env.local.",
      results: [],
      unmatched: [],
      source: "football-data.org",
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(body, { status: 200 });
  }

  let apiData: ApiResponse;

  try {
    const res = await fetch(FOOTBALL_DATA_URL, {
      headers: { "X-Auth-Token": apiKey },
      // Always hit the upstream API fresh - results change during live play.
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      const body: SyncResponse = {
        ok: false,
        error: `football-data.org returned ${res.status}: ${text.slice(
          0,
          300
        )}`,
        results: [],
        unmatched: [],
        source: "football-data.org",
        fetchedAt: new Date().toISOString(),
      };
      return NextResponse.json(body, { status: 200 });
    }

    apiData = (await res.json()) as ApiResponse;
  } catch (err) {
    const body: SyncResponse = {
      ok: false,
      error: `Failed to reach football-data.org: ${
        err instanceof Error ? err.message : String(err)
      }`,
      results: [],
      unmatched: [],
      source: "football-data.org",
      fetchedAt: new Date().toISOString(),
    };
    return NextResponse.json(body, { status: 200 });
  }

  const results: SyncedResult[] = [];
  const unmatched: { homeName: string; awayName: string }[] = [];

  for (const m of apiData.matches ?? []) {
    const { fullTime } = m.score ?? { fullTime: { home: null, away: null } };
    if (fullTime.home === null || fullTime.away === null) continue;

    const home = identifyTeam(m.homeTeam);
    const away = identifyTeam(m.awayTeam);

    if (!home.id || !away.id) {
      unmatched.push({ homeName: home.name, awayName: away.name });
      continue;
    }

    const result: SyncedResult = {
      homeId: home.id,
      awayId: away.id,
      homeScore: fullTime.home,
      awayScore: fullTime.away,
      status: m.status,
      homeName: home.name,
      awayName: away.name,
    };

    results.push(result);
  }

  const body: SyncResponse = {
    ok: true,
    results,
    unmatched,
    source: "football-data.org",
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: 200 });
}
