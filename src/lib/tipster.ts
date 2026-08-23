import { closingLineValue } from "./ev-math";

export interface RawPick {
  description: string;
  odds: number;
  sport?: string;
}

export function extractPicksFromTranscript(text: string): RawPick[] {
  const picks: RawPick[] = [];
  const lines = text.split(/\n/);

  const oddsPattern = /(?:odd[s]?\s*(?:de\s*)?|@\s*|cotação\s*(?:de\s*)?)(\d+[.,]\d+)/gi;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 5) continue;

    const oddsMatches = [...trimmed.matchAll(oddsPattern)];
    if (oddsMatches.length === 0) continue;

    for (const oddsMatch of oddsMatches) {
      const oddsStr = oddsMatch[1].replace(",", ".");
      const odds = parseFloat(oddsStr);
      if (isNaN(odds) || odds <= 1) continue;

      let description = trimmed
        .replace(oddsMatch[0], "")
        .replace(/odd[s]?\s*(de\s*)?/gi, "")
        .replace(/@/g, "")
        .replace(/cotação\s*(de\s*)?/gi, "")
        .replace(/apostar?\s*(em\s*|no\s*|na\s*)?/gi, "")
        .replace(/tip[:\s]*/gi, "")
        .replace(/palpite[:\s]*/gi, "")
        .replace(/pick[:\s]*/gi, "")
        .trim();

      if (description.length < 3) {
        description = trimmed.substring(0, 60);
      }

      picks.push({ description, odds });
    }
  }

  return picks;
}

export function computeTipsterStats(
  picks: { odds: number; closingOdds?: number | null; outcome: string }[]
) {
  const settled = picks.filter((p) => p.outcome === "won" || p.outcome === "lost");
  const wins = settled.filter((p) => p.outcome === "won").length;
  const losses = settled.filter((p) => p.outcome === "lost").length;

  const clvValues = settled
    .filter((p) => p.closingOdds && p.closingOdds > 1)
    .map((p) => closingLineValue(p.odds, p.closingOdds!));

  const avgClv = clvValues.length > 0
    ? clvValues.reduce((s, v) => s + v, 0) / clvValues.length
    : 0;

  const totalStaked = settled.length;
  const totalProfit = settled.reduce((sum, p) => {
    if (p.outcome === "won") return sum + (p.odds - 1);
    return sum - 1;
  }, 0);

  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

  return { wins, losses, avgClv, roi, totalPicks: picks.length };
}
