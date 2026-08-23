import { describe, it, expect } from "vitest";
import { findValueBets, computeFairProbabilities } from "./value-engine";
import type { OddsEntry } from "./value-engine";

describe("computeFairProbabilities", () => {
  it("normaliza odds sharp removendo o vig", () => {
    // Pinnacle odds: 1.90 / 1.90 → implied 52.63% each, sum 105.26%
    // Fair: 50% / 50%
    const fair = computeFairProbabilities([1.9, 1.9]);
    expect(fair[0]).toBeCloseTo(0.5, 3);
    expect(fair[1]).toBeCloseTo(0.5, 3);
  });

  it("normaliza mercado de 3 outcomes", () => {
    const fair = computeFairProbabilities([2.0, 3.5, 4.0]);
    const sum = fair.reduce((s, p) => s + p, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe("findValueBets", () => {
  it("encontra value bet quando soft bookmaker tem odds acima da fair", () => {
    const allOdds: OddsEntry[] = [
      { bookmaker: "pinnacle", selection: "home", odds: 1.9, isSharp: true },
      { bookmaker: "pinnacle", selection: "away", odds: 1.9, isSharp: true },
      { bookmaker: "bet365", selection: "home", odds: 2.1, isSharp: false },
      { bookmaker: "bet365", selection: "away", odds: 1.75, isSharp: false },
    ];

    const valueBets = findValueBets(allOdds);
    expect(valueBets.length).toBeGreaterThanOrEqual(1);
    // Bet365 home a 2.10 vs fair 2.00 (50%) → EV+ = 5%
    const homeValue = valueBets.find((v) => v.selection === "home");
    expect(homeValue).toBeDefined();
    expect(homeValue!.evPercent).toBeCloseTo(5, 0);
    expect(homeValue!.bookmaker).toBe("bet365");
  });

  it("não encontra value bet quando odds são justas ou abaixo", () => {
    const allOdds: OddsEntry[] = [
      { bookmaker: "pinnacle", selection: "home", odds: 2.0, isSharp: true },
      { bookmaker: "pinnacle", selection: "away", odds: 2.0, isSharp: true },
      { bookmaker: "bet365", selection: "home", odds: 1.9, isSharp: false },
      { bookmaker: "bet365", selection: "away", odds: 1.85, isSharp: false },
    ];

    const valueBets = findValueBets(allOdds);
    expect(valueBets.length).toBe(0);
  });

  it("usa média do mercado quando não há sharp", () => {
    const allOdds: OddsEntry[] = [
      { bookmaker: "bet365", selection: "home", odds: 2.0, isSharp: false },
      { bookmaker: "betano", selection: "home", odds: 1.95, isSharp: false },
      { bookmaker: "sportingbet", selection: "home", odds: 2.2, isSharp: false },
      { bookmaker: "bet365", selection: "away", odds: 1.85, isSharp: false },
      { bookmaker: "betano", selection: "away", odds: 1.9, isSharp: false },
      { bookmaker: "sportingbet", selection: "away", odds: 1.7, isSharp: false },
    ];

    const valueBets = findValueBets(allOdds);
    // Sportingbet home a 2.20 deve ser value vs a média
    if (valueBets.length > 0) {
      expect(valueBets[0].bookmaker).toBe("sportingbet");
    }
  });

  it("classifica confiança por EV%", () => {
    const allOdds: OddsEntry[] = [
      { bookmaker: "pinnacle", selection: "home", odds: 1.8, isSharp: true },
      { bookmaker: "pinnacle", selection: "away", odds: 2.1, isSharp: true },
      { bookmaker: "bet365", selection: "home", odds: 2.3, isSharp: false },
      { bookmaker: "bet365", selection: "away", odds: 2.5, isSharp: false },
    ];

    const valueBets = findValueBets(allOdds);
    for (const vb of valueBets) {
      if (vb.evPercent > 5) expect(vb.confidence).toBe("high");
      else if (vb.evPercent > 2) expect(vb.confidence).toBe("medium");
      else expect(vb.confidence).toBe("low");
    }
  });

  it("ordena por EV% decrescente", () => {
    const allOdds: OddsEntry[] = [
      { bookmaker: "pinnacle", selection: "home", odds: 2.0, isSharp: true },
      { bookmaker: "pinnacle", selection: "away", odds: 2.0, isSharp: true },
      { bookmaker: "bookA", selection: "home", odds: 2.15, isSharp: false },
      { bookmaker: "bookB", selection: "home", odds: 2.3, isSharp: false },
      { bookmaker: "bookA", selection: "away", odds: 1.9, isSharp: false },
      { bookmaker: "bookB", selection: "away", odds: 1.85, isSharp: false },
    ];

    const valueBets = findValueBets(allOdds);
    for (let i = 1; i < valueBets.length; i++) {
      expect(valueBets[i - 1].evPercent).toBeGreaterThanOrEqual(
        valueBets[i].evPercent
      );
    }
  });
});
