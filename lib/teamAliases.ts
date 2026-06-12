/**
 * Maps every World Cup 2026 team to the various ways its name can appear
 * in third-party football data APIs (full names, short names, alternate
 * spellings). Used to line up results from an external API with the
 * internal team ids in lib/teams.ts.
 *
 * Matching is done on a normalised form: lowercase, accents stripped,
 * punctuation removed, whitespace collapsed. See `normalizeTeamName`.
 */
export const TEAM_NAME_ALIASES: Record<string, string[]> = {
  MEX: ["mexico"],
  RSA: ["south africa"],
  KOR: ["south korea", "korea republic", "korea south", "republic of korea"],
  CZE: ["czechia", "czech republic"],

  CAN: ["canada"],
  BIH: ["bosnia and herzegovina", "bosnia herzegovina", "bosnia"],
  QAT: ["qatar"],
  SUI: ["switzerland"],

  BRA: ["brazil"],
  MAR: ["morocco"],
  HAI: ["haiti"],
  SCO: ["scotland"],

  USA: ["united states", "usa", "united states of america", "us"],
  PAR: ["paraguay"],
  AUS: ["australia"],
  TUR: ["turkiye", "turkey"],

  GER: ["germany"],
  CUW: ["curacao"],
  CIV: ["cote divoire", "ivory coast"],
  ECU: ["ecuador"],

  NED: ["netherlands", "holland"],
  JPN: ["japan"],
  SWE: ["sweden"],
  TUN: ["tunisia"],

  BEL: ["belgium"],
  EGY: ["egypt"],
  IRN: ["iran", "ir iran", "islamic republic of iran"],
  NZL: ["new zealand"],

  ESP: ["spain"],
  CPV: ["cabo verde", "cape verde"],
  KSA: ["saudi arabia"],
  URU: ["uruguay"],

  FRA: ["france"],
  SEN: ["senegal"],
  IRQ: ["iraq"],
  NOR: ["norway"],

  ARG: ["argentina"],
  ALG: ["algeria"],
  AUT: ["austria"],
  JOR: ["jordan"],

  POR: ["portugal"],
  COD: [
    "dr congo",
    "congo dr",
    "democratic republic of the congo",
    "dr congo democratic republic of the congo",
    "congo democratic republic",
  ],
  UZB: ["uzbekistan"],
  COL: ["colombia"],

  ENG: ["england"],
  CRO: ["croatia"],
  GHA: ["ghana"],
  PAN: ["panama"],
};

/** Lowercase, strip accents/punctuation, collapse whitespace. */
export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let aliasIndex: Map<string, string> | null = null;

/**
 * Resolves an external API team name (e.g. "Korea Republic", "IR Iran",
 * "Côte d'Ivoire") to our internal three-letter team id (e.g. "KOR",
 * "IRN", "CIV"). Returns null if nothing matches.
 */
export function resolveTeamId(apiName: string): string | null {
  if (!aliasIndex) {
    aliasIndex = new Map();
    for (const [id, aliases] of Object.entries(TEAM_NAME_ALIASES)) {
      for (const alias of aliases) {
        aliasIndex.set(normalizeTeamName(alias), id);
      }
      // Also index the id itself in case the API returns short codes.
      aliasIndex.set(normalizeTeamName(id), id);
    }
  }

  const key = normalizeTeamName(apiName);
  if (aliasIndex.has(key)) return aliasIndex.get(key)!;

  // Fall back to a loose "contains" match for names with extra words
  // (e.g. "Korea Republic U23" or "Iran (IRN)").
  for (const [alias, id] of aliasIndex.entries()) {
    if (key.includes(alias) || alias.includes(key)) return id;
  }

  return null;
}
