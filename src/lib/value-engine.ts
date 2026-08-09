import { removeVig, isValueBet, normalBetEV } from "./ev-math";

export interface OddsEntry {
  bookmaker: string;
  selection: string;
  odds: number;
  isSharp: boolean;
}

export interface ValueBetCandidate {
  bookmaker: string;
  selection: string;
  odds: number;
  fairProb: number;
  ev: number;
  evPercent: number;
  margin: number;
  confidence: "low" | "medium" | "high";
}

export function computeFairProbabilities(
  sharpOdds: number[]
): number[] {
  if (sharpOdds.length === 0) return [];
  return removeVig(sharpOdds);
}

export function findValueBets(
  allOdds: OddsEntry[],
  stakeReference = 100,
  targetBookmaker?: string
): ValueBetCandidate[] {
  const selections = [...new Set(allOdds.map((o) => o.selection))];

  const sharpBySelection = new Map<string, number[]>();
  const softBySelection = new Map<string, OddsEntry[]>();

  for (const entry of allOdds) {
    if (entry.isSharp) {
      const arr = sharpBySelection.get(entry.selection) ?? [];
      arr.push(entry.odds);
      sharpBySelection.set(entry.selection, arr);
    } else {
      const arr = softBySelection.get(entry.selection) ?? [];
      arr.push(entry);
      softBySelection.set(entry.selection, arr);
    }
  }

  const sharpOddsPerSelection = selections.map((sel) => {
    const odds = sharpBySelection.get(sel) ?? [];
    if (odds.length === 0) return null;
    return odds.reduce((sum, o) => sum + o, 0) / odds.length;
  });

  if (sharpOddsPerSelection.some((o) => o === null)) {
    const allBySelection = selections.map((sel) => {
      const odds = allOdds
        .filter((o) => o.selection === sel)
        .map((o) => o.odds);
      if (odds.length === 0) return 1.01;
      return odds.reduce((sum, o) => sum + o, 0) / odds.length;
    });
    const fairProbs = computeFairProbabilities(allBySelection);

    return findValueFromFairProbs(fairProbs, selections, allOdds, stakeReference, targetBookmaker);
  }

  const sharpAvgOdds = sharpOddsPerSelection as number[];
  const fairProbs = computeFairProbabilities(sharpAvgOdds);

  return findValueFromFairProbs(fairProbs, selections, allOdds, stakeReference, targetBookmaker);
}

function findValueFromFairProbs(
  fairProbs: number[],
  selections: string[],
  allOdds: OddsEntry[],
  stakeReference: number,
  targetBookmaker?: string
): ValueBetCandidate[] {
  const valueBets: ValueBetCandidate[] = [];

  for (let i = 0; i < selections.length; i++) {
    const sel = selections[i];
    const fairProb = fairProbs[i];

    let softEntries = allOdds.filter(
      (o) => o.selection === sel && !o.isSharp
    );
    if (targetBookmaker) {
      softEntries = softEntries.filter(
        (o) => o.bookmaker.toLowerCase().includes(targetBookmaker.toLowerCase())
      );
    }

    for (const entry of softEntries) {
      if (!isValueBet(entry.odds, fairProb)) continue;

      const ev = normalBetEV(stakeReference, entry.odds, fairProb);
      const evPercent = (fairProb * entry.odds - 1) * 100;
      const fairOdds = 1 / fairProb;
      const margin = ((entry.odds - fairOdds) / fairOdds) * 100;

      let confidence: "low" | "medium" | "high" = "low";
      if (evPercent > 5) confidence = "high";
      else if (evPercent > 2) confidence = "medium";

      valueBets.push({
        bookmaker: entry.bookmaker,
        selection: sel,
        odds: entry.odds,
        fairProb,
        ev,
        evPercent,
        margin,
        confidence,
      });
    }
  }

  return valueBets.sort((a, b) => b.evPercent - a.evPercent);
}
