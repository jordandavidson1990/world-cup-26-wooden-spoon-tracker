import { TEAMS } from "./teams";
import { Match, TeamStats } from "./types";

/**
 * Builds the live table for every team from the set of matches played so
 * far. Unplayed matches (homeScore/awayScore === null) are ignored.
 */
export function computeStats(matches: Match[]): TeamStats[] {
  const table = new Map<string, TeamStats>();

  for (const team of TEAMS) {
    table.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      yellowCards: 0,
      redCards: 0,
      disciplinaryPoints: 0,
    });
  }

  for (const m of matches) {
    if (m.homeScore === null || m.awayScore === null) continue;

    const home = table.get(m.home);
    const away = table.get(m.away);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;

    home.goalsFor += m.homeScore;
    home.goalsAgainst += m.awayScore;
    away.goalsFor += m.awayScore;
    away.goalsAgainst += m.homeScore;

    if (m.homeScore > m.awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (m.homeScore < m.awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }

    home.yellowCards += m.homeYellow;
    away.yellowCards += m.awayYellow;
    home.redCards += m.homeRed;
    away.redCards += m.awayRed;
  }

  for (const stats of table.values()) {
    stats.goalDifference = stats.goalsFor - stats.goalsAgainst;
    // FIFA-style disciplinary points: 1 per yellow, 4 per straight red /
    // second-yellow dismissal. Higher = worse disciplinary record.
    stats.disciplinaryPoints = stats.yellowCards * 1 + stats.redCards * 4;
  }

  return Array.from(table.values());
}

/**
 * Orders every team from "worst" to "best" using the criteria requested
 * for the Wooden Spoon tracker:
 *
 *   1. Fewest points
 *   2. Worst goal difference (tiebreak)
 *   3. Fewest goals scored (tiebreak)
 *   4. Worst disciplinary record - most accumulated card points (tiebreak)
 *   5. Alphabetical, as a final stable tiebreak
 */
export function rankWorstToBest(stats: TeamStats[]): TeamStats[] {
  return [...stats].sort((a, b) => {
    if (a.points !== b.points) return a.points - b.points;
    if (a.goalDifference !== b.goalDifference)
      return a.goalDifference - b.goalDifference;
    if (a.goalsFor !== b.goalsFor) return a.goalsFor - b.goalsFor;
    if (a.disciplinaryPoints !== b.disciplinaryPoints)
      return b.disciplinaryPoints - a.disciplinaryPoints;
    return a.team.name.localeCompare(b.team.name);
  });
}

/** Number of group matches that have a recorded result. */
export function countPlayedMatches(matches: Match[]): number {
  return matches.filter((m) => m.homeScore !== null && m.awayScore !== null)
    .length;
}
