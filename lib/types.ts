export type GroupId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export interface Team {
  /** Three-letter FIFA-style code, used as the canonical id */
  id: string;
  name: string;
  group: GroupId;
  /** Emoji flag, or null for teams without a simple emoji (e.g. England, Scotland) */
  flag: string | null;
}

export type Matchday = 1 | 2 | 3;

export interface Match {
  id: string;
  group: GroupId;
  matchday: Matchday;
  home: string; // team id
  away: string; // team id
  homeScore: number | null;
  awayScore: number | null;
  /** Yellow cards shown to the home / away team in this match */
  homeYellow: number;
  awayYellow: number;
  /** Red cards (direct or second-yellow) shown to the home / away team */
  homeRed: number;
  awayRed: number;
}

/** A single result pulled from an external data source, ready to merge. */
export interface SyncedResult {
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
  status: string;
  /** Original team names as returned by the API, for diagnostics. */
  homeName: string;
  awayName: string;
  /** Card counts, only present if the data source includes bookings. */
  homeYellow?: number;
  awayYellow?: number;
  homeRed?: number;
  awayRed?: number;
}

export interface SyncResponse {
  ok: boolean;
  /** Human-readable error, present when ok is false. */
  error?: string;
  results: SyncedResult[];
  /** Fixtures with scores that couldn't be matched to a known team. */
  unmatched: { homeName: string; awayName: string }[];
  source: string;
  fetchedAt: string;
}

export interface TeamStats {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  yellowCards: number;
  redCards: number;
  /** FIFA-style disciplinary points: 1 per yellow, 4 per red. Higher = worse record. */
  disciplinaryPoints: number;
}
