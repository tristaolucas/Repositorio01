import { describe, it, expect } from "vitest";
import { extractPicksFromTranscript, computeTipsterStats } from "./tipster";

describe("extractPicksFromTranscript", () => {
  it("extrai palpites com padrão 'odds X.XX'", () => {
    const text = `
      Flamengo pra ganhar do Palmeiras odds 2.50
      Over 2.5 gols odds 1.85
    `;
    const picks = extractPicksFromTranscript(text);
    expect(picks.length).toBeGreaterThanOrEqual(2);
    expect(picks.some((p) => p.odds === 2.5)).toBe(true);
    expect(picks.some((p) => p.odds === 1.85)).toBe(true);
  });

  it("extrai palpites com padrão '@X.XX'", () => {
    const text = "Corinthians ML @2.10";
    const picks = extractPicksFromTranscript(text);
    expect(picks.length).toBeGreaterThanOrEqual(1);
    expect(picks[0].odds).toBe(2.1);
  });

  it("extrai palpites com vírgula como decimal", () => {
    const text = "Real Madrid odds 1,75";
    const picks = extractPicksFromTranscript(text);
    expect(picks.length).toBeGreaterThanOrEqual(1);
    expect(picks[0].odds).toBe(1.75);
  });

  it("ignora odds inválidas (<= 1)", () => {
    const text = "Aposta segura odds 0.50";
    const picks = extractPicksFromTranscript(text);
    expect(picks.length).toBe(0);
  });

  it("retorna vazio para texto sem odds", () => {
    const text = "Hoje vou falar sobre futebol brasileiro";
    const picks = extractPicksFromTranscript(text);
    expect(picks.length).toBe(0);
  });
});

describe("computeTipsterStats", () => {
  it("calcula stats básicos de um tipster", () => {
    const picks = [
      { odds: 2.0, closingOdds: 1.8, outcome: "won" },
      { odds: 2.5, closingOdds: 2.3, outcome: "lost" },
      { odds: 1.8, closingOdds: 2.0, outcome: "won" },
      { odds: 3.0, outcome: "pending" },
    ];

    const stats = computeTipsterStats(picks);
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.totalPicks).toBe(4);
  });

  it("calcula ROI corretamente", () => {
    const picks = [
      { odds: 2.0, outcome: "won" },   // +1
      { odds: 2.0, outcome: "lost" },  // -1
      { odds: 3.0, outcome: "won" },   // +2
    ];
    const stats = computeTipsterStats(picks);
    // profit = 1 - 1 + 2 = 2, staked = 3
    expect(stats.roi).toBeCloseTo(66.67, 0);
  });

  it("calcula CLV médio quando closing odds disponíveis", () => {
    const picks = [
      { odds: 2.2, closingOdds: 2.0, outcome: "won" },
      { odds: 1.8, closingOdds: 2.0, outcome: "lost" },
    ];
    const stats = computeTipsterStats(picks);
    // CLV1 = (0.5 - 0.4545)/0.4545 ≈ 0.1
    // CLV2 = (0.5 - 0.5556)/0.5556 ≈ -0.1
    // avg ≈ 0
    expect(stats.avgClv).toBeCloseTo(0, 1);
  });

  it("retorna zeros para lista vazia", () => {
    const stats = computeTipsterStats([]);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(0);
    expect(stats.roi).toBe(0);
  });
});
