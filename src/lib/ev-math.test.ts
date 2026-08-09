import { describe, it, expect } from "vitest";
import {
  oddsToImpliedProbability,
  removeVig,
  freebetEV,
  freebetEVFactor,
  normalBetEV,
  isValueBet,
  closingLineValue,
  rankFreebetSelections,
} from "./ev-math";

describe("oddsToImpliedProbability", () => {
  it("converts decimal odds 2.0 to 50%", () => {
    expect(oddsToImpliedProbability(2.0)).toBeCloseTo(0.5);
  });

  it("converts decimal odds 4.0 to 25%", () => {
    expect(oddsToImpliedProbability(4.0)).toBeCloseTo(0.25);
  });

  it("converts decimal odds 1.5 to 66.67%", () => {
    expect(oddsToImpliedProbability(1.5)).toBeCloseTo(0.6667, 3);
  });

  it("throws for odds <= 1", () => {
    expect(() => oddsToImpliedProbability(1.0)).toThrow();
    expect(() => oddsToImpliedProbability(0.5)).toThrow();
  });
});

describe("removeVig", () => {
  it("removes vig from a two-outcome market", () => {
    // Market: team A at 1.90, team B at 1.90
    // Implied: 1/1.9 = 0.5263 each, sum = 1.0526
    // Fair: 0.5263 / 1.0526 = 0.5 each
    const fair = removeVig([1.9, 1.9]);
    expect(fair[0]).toBeCloseTo(0.5, 4);
    expect(fair[1]).toBeCloseTo(0.5, 4);
  });

  it("removes vig from an asymmetric two-outcome market", () => {
    // Market: 1.5 and 3.0
    // Implied: 0.6667 + 0.3333 = 1.0
    // This is already a fair market (no vig)
    const fair = removeVig([1.5, 3.0]);
    expect(fair[0]).toBeCloseTo(0.6667, 3);
    expect(fair[1]).toBeCloseTo(0.3333, 3);
  });

  it("removes vig from a three-outcome market", () => {
    // Market: 2.5, 3.2, 3.0
    // Implied: 0.4 + 0.3125 + 0.3333 = 1.0458
    // Fair: 0.4/1.0458, 0.3125/1.0458, 0.3333/1.0458
    const fair = removeVig([2.5, 3.2, 3.0]);
    expect(fair[0]).toBeCloseTo(0.4 / 1.0458, 3);
    expect(fair[1]).toBeCloseTo(0.3125 / 1.0458, 3);
    expect(fair[2]).toBeCloseTo(0.3333 / 1.0458, 3);
    expect(fair.reduce((s, p) => s + p, 0)).toBeCloseTo(1.0, 10);
  });

  it("throws if any odds <= 1", () => {
    expect(() => removeVig([1.0, 2.0])).toThrow();
  });
});

describe("freebetEV", () => {
  it("calculates EV for freebet R$50, odds 3.0, prob 40%", () => {
    // EV = 0.4 * (3.0 - 1) * 50 = 0.4 * 2 * 50 = 40
    expect(freebetEV(50, 3.0, 0.4)).toBeCloseTo(40);
  });

  it("calculates EV for freebet R$100, odds 2.0, prob 50%", () => {
    // EV = 0.5 * (2.0 - 1) * 100 = 0.5 * 1 * 100 = 50
    expect(freebetEV(100, 2.0, 0.5)).toBeCloseTo(50);
  });

  it("calculates EV for freebet R$25, odds 5.0, prob 20%", () => {
    // EV = 0.2 * (5.0 - 1) * 25 = 0.2 * 4 * 25 = 20
    expect(freebetEV(25, 5.0, 0.2)).toBeCloseTo(20);
  });

  it("throws for invalid inputs", () => {
    expect(() => freebetEV(50, 0.5, 0.4)).toThrow();
    expect(() => freebetEV(50, 3.0, -0.1)).toThrow();
    expect(() => freebetEV(50, 3.0, 1.1)).toThrow();
    expect(() => freebetEV(-10, 3.0, 0.4)).toThrow();
  });
});

describe("freebetEVFactor", () => {
  it("calculates EV factor p*(d-1) for odds 3.0, prob 40%", () => {
    // 0.4 * (3 - 1) = 0.8
    expect(freebetEVFactor(3.0, 0.4)).toBeCloseTo(0.8);
  });

  it("calculates EV factor for odds 2.0, prob 50%", () => {
    // 0.5 * (2 - 1) = 0.5
    expect(freebetEVFactor(2.0, 0.5)).toBeCloseTo(0.5);
  });
});

describe("normalBetEV", () => {
  it("calculates EV for a value bet", () => {
    // Stake 100, odds 2.5, prob 50%
    // EV = (0.5 * 2.5 - 1) * 100 = (1.25 - 1) * 100 = 25
    expect(normalBetEV(100, 2.5, 0.5)).toBeCloseTo(25);
  });

  it("calculates negative EV for a losing proposition", () => {
    // Stake 100, odds 2.0, prob 40%
    // EV = (0.4 * 2.0 - 1) * 100 = (0.8 - 1) * 100 = -20
    expect(normalBetEV(100, 2.0, 0.4)).toBeCloseTo(-20);
  });

  it("throws for invalid inputs", () => {
    expect(() => normalBetEV(100, 0.9, 0.5)).toThrow();
    expect(() => normalBetEV(-100, 2.0, 0.5)).toThrow();
  });
});

describe("isValueBet", () => {
  it("returns true when p * d > 1", () => {
    expect(isValueBet(2.5, 0.5)).toBe(true); // 1.25 > 1
  });

  it("returns false when p * d < 1", () => {
    expect(isValueBet(2.0, 0.4)).toBe(false); // 0.8 < 1
  });

  it("returns false when p * d = 1 (fair)", () => {
    expect(isValueBet(2.0, 0.5)).toBe(false); // 1.0 = 1
  });
});

describe("closingLineValue", () => {
  it("calculates positive CLV (took better odds)", () => {
    // Took 2.2, closed at 2.0
    // Implied taken: 1/2.2 = 0.4545, implied closing: 1/2.0 = 0.5
    // CLV = (0.5 - 0.4545) / 0.4545 = 0.1
    expect(closingLineValue(2.2, 2.0)).toBeCloseTo(0.1, 3);
  });

  it("calculates negative CLV (took worse odds)", () => {
    // Took 1.8, closed at 2.0
    // Implied taken: 1/1.8 = 0.5556, implied closing: 1/2.0 = 0.5
    // CLV = (0.5 - 0.5556) / 0.5556 = -0.1
    expect(closingLineValue(1.8, 2.0)).toBeCloseTo(-0.1, 3);
  });

  it("throws for invalid odds", () => {
    expect(() => closingLineValue(0.5, 2.0)).toThrow();
    expect(() => closingLineValue(2.0, 1.0)).toThrow();
  });
});

describe("rankFreebetSelections", () => {
  it("ranks selections by EV factor (highest first)", () => {
    const results = rankFreebetSelections(100, [
      { description: "Draw", odds: 3.5 },
      { description: "Team A", odds: 2.0 },
      { description: "Team B", odds: 5.0 },
    ]);

    expect(results).toHaveLength(3);
    // Using implied probability from odds:
    // Team A: p=0.5, factor=0.5*(2-1)=0.5
    // Draw: p=0.2857, factor=0.2857*(3.5-1)=0.7143
    // Team B: p=0.2, factor=0.2*(5-1)=0.8
    // Sorted: Team B > Draw > Team A
    expect(results[0].description).toBe("Team B");
    expect(results[1].description).toBe("Draw");
    expect(results[2].description).toBe("Team A");
  });

  it("returns empty array for empty input", () => {
    expect(rankFreebetSelections(100, [])).toEqual([]);
  });

  it("calculates EV in reais correctly", () => {
    const results = rankFreebetSelections(50, [
      { description: "Over 2.5", odds: 2.0 },
    ]);
    // p=0.5, factor=0.5, EV = 0.5 * 1 * 50 = 25
    expect(results[0].ev).toBeCloseTo(25);
    expect(results[0].impliedProb).toBeCloseTo(0.5);
  });
});
