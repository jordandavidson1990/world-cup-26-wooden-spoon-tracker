import { GROUP_IDS, teamsByGroup } from "./teams";
import { Match, Matchday } from "./types";

/**
 * Standard 4-team round-robin pairing pattern used across all 12 groups.
 * Index pairs refer to position within each group's team list (0-3).
 * Every team plays each of the other three exactly once, spread over
 * three matchdays with two matches each.
 */
const ROUND_ROBIN_PATTERN: { matchday: Matchday; pairs: [number, number][] }[] = [
  { matchday: 1, pairs: [[0, 1], [2, 3]] },
  { matchday: 2, pairs: [[0, 2], [1, 3]] },
  { matchday: 3, pairs: [[0, 3], [1, 2]] },
];

/**
 * Generates the full 72-match group stage fixture list (12 groups x 6
 * matches). All matches start unplayed (`null` scores, zero cards) so the
 * tracker can be filled in as results come in.
 */
export function generateFixtures(): Match[] {
  const matches: Match[] = [];

  for (const group of GROUP_IDS) {
    const teams = teamsByGroup(group);

    for (const { matchday, pairs } of ROUND_ROBIN_PATTERN) {
      for (const [homeIdx, awayIdx] of pairs) {
        const home = teams[homeIdx];
        const away = teams[awayIdx];

        matches.push({
          id: `${group}-${matchday}-${home.id}-${away.id}`,
          group,
          matchday,
          home: home.id,
          away: away.id,
          homeScore: null,
          awayScore: null,
          homeYellow: 0,
          awayYellow: 0,
          homeRed: 0,
          awayRed: 0,
        });
      }
    }
  }

  return matches;
}
