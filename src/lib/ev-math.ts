export function oddsToImpliedProbability(decimalOdds: number): number {
  if (decimalOdds <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  return 1 / decimalOdds;
}

export function removeVig(odds: number[]): number[] {
  if (odds.some((o) => o <= 1)) {
    throw new Error("All odds must be greater than 1");
  }
  const impliedProbs = odds.map((o) => 1 / o);
  const totalMargin = impliedProbs.reduce((sum, p) => sum + p, 0);
  return impliedProbs.map((p) => p / totalMargin);
}

export function freebetEV(
  faceValue: number,
  decimalOdds: number,
  estimatedProb: number
): number {
  if (decimalOdds <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  if (estimatedProb < 0 || estimatedProb > 1) {
    throw new Error("Probability must be between 0 and 1");
  }
  if (faceValue <= 0) {
    throw new Error("Face value must be positive");
  }
  return estimatedProb * (decimalOdds - 1) * faceValue;
}

export function freebetEVFactor(
  decimalOdds: number,
  estimatedProb: number
): number {
  if (decimalOdds <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  if (estimatedProb < 0 || estimatedProb > 1) {
    throw new Error("Probability must be between 0 and 1");
  }
  return estimatedProb * (decimalOdds - 1);
}

export function normalBetEV(
  stake: number,
  decimalOdds: number,
  estimatedProb: number
): number {
  if (decimalOdds <= 1) {
    throw new Error("Decimal odds must be greater than 1");
  }
  if (estimatedProb < 0 || estimatedProb > 1) {
    throw new Error("Probability must be between 0 and 1");
  }
  if (stake <= 0) {
    throw new Error("Stake must be positive");
  }
  return (estimatedProb * decimalOdds - 1) * stake;
}

export function isValueBet(
  decimalOdds: number,
  estimatedProb: number
): boolean {
  return estimatedProb * decimalOdds > 1;
}

export function closingLineValue(
  oddsTaken: number,
  closingOdds: number
): number {
  if (oddsTaken <= 1 || closingOdds <= 1) {
    throw new Error("Odds must be greater than 1");
  }
  const impliedTaken = 1 / oddsTaken;
  const impliedClosing = 1 / closingOdds;
  return (impliedClosing - impliedTaken) / impliedTaken;
}

export interface FreebetCandidate {
  description: string;
  odds: number;
}

export interface FreebetResult {
  description: string;
  odds: number;
  impliedProb: number;
  ev: number;
  evFactor: number;
}

export function rankFreebetSelections(
  faceValue: number,
  candidates: FreebetCandidate[]
): FreebetResult[] {
  if (candidates.length === 0) return [];

  const allOdds = candidates.map((c) => c.odds);
  if (allOdds.some((o) => o <= 1)) {
    throw new Error("All odds must be greater than 1");
  }

  return candidates
    .map((c) => {
      const impliedProb = oddsToImpliedProbability(c.odds);
      const evFactor = freebetEVFactor(c.odds, impliedProb);
      const ev = freebetEV(faceValue, c.odds, impliedProb);
      return {
        description: c.description,
        odds: c.odds,
        impliedProb,
        ev,
        evFactor,
      };
    })
    .sort((a, b) => b.evFactor - a.evFactor);
}
