const BASE_URL = "https://api.the-odds-api.com/v4";

export interface OddsApiEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

export interface OddsApiBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsApiMarket[];
}

export interface OddsApiMarket {
  key: string;
  last_update: string;
  outcomes: OddsApiOutcome[];
}

export interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}

const SPORT_MAP: Record<string, string> = {
  futebol: "soccer",
  basquete: "basketball",
  tenis: "tennis",
  mma: "mma_mixed_martial_arts",
  boxe: "boxing_boxing",
};

const SHARP_BOOKMAKERS = ["pinnacle", "betfair_ex_eu", "matchbook"];

export const TARGET_BOOKMAKER = "Sportingbet";

export function isSharpBookmaker(key: string): boolean {
  return SHARP_BOOKMAKERS.includes(key.toLowerCase());
}

export async function fetchSports(
  apiKey: string
): Promise<{ key: string; title: string; active: boolean }[]> {
  const res = await fetch(`${BASE_URL}/sports/?apiKey=${apiKey}`);
  if (!res.ok) throw new Error(`Odds API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchOdds(
  apiKey: string,
  sportKey: string,
  regions = "eu",
  markets = "h2h"
): Promise<OddsApiEvent[]> {
  const url = new URL(`${BASE_URL}/sports/${sportKey}/odds/`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("regions", regions);
  url.searchParams.set("markets", markets);
  url.searchParams.set("oddsFormat", "decimal");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Odds API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchScores(
  apiKey: string,
  sportKey: string,
  daysFrom = 3
): Promise<
  {
    id: string;
    sport_key: string;
    home_team: string;
    away_team: string;
    commence_time: string;
    completed: boolean;
    scores: { name: string; score: string }[] | null;
  }[]
> {
  const url = new URL(`${BASE_URL}/sports/${sportKey}/scores/`);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("daysFrom", String(daysFrom));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Odds API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export function getSportKey(sport: string): string {
  return SPORT_MAP[sport.toLowerCase()] ?? sport;
}

export function mapSelectionName(
  outcomeName: string,
  homeTeam: string,
  awayTeam: string
): string {
  if (outcomeName === homeTeam) return "home";
  if (outcomeName === awayTeam) return "away";
  if (outcomeName.toLowerCase() === "draw") return "draw";
  if (outcomeName.toLowerCase().startsWith("over")) return "over";
  if (outcomeName.toLowerCase().startsWith("under")) return "under";
  return outcomeName.toLowerCase();
}
