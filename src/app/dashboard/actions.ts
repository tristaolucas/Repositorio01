"use server";

import { prisma } from "@/lib/db";
import {
  fetchOdds,
  fetchSports,
  isSharpBookmaker,
  isTargetBookmaker,
  mapSelectionName,
  TARGET_BOOKMAKER_TITLE,
} from "@/lib/odds-api";
import { findValueBets, type OddsEntry } from "@/lib/value-engine";
import { revalidatePath } from "next/cache";

const API_KEY = process.env.THE_ODDS_API_KEY ?? "";

export async function refreshOdds(sportKey?: string) {
  if (!API_KEY) {
    throw new Error(
      "THE_ODDS_API_KEY não configurada. Cadastre-se em https://the-odds-api.com (gratuito) e adicione a chave no .env"
    );
  }

  let sportsToFetch: string[];
  if (sportKey) {
    sportsToFetch = [sportKey];
  } else {
    const allSports = await fetchSports(API_KEY);
    sportsToFetch = allSports.filter((s) => s.active).map((s) => s.key);
  }

  let totalEvents = 0;
  let totalValueBets = 0;

  for (const sport of sportsToFetch) {
    try {
      const events = await fetchOdds(API_KEY, sport);

      for (const event of events) {
        const hasSportingbet = event.bookmakers.some((b) =>
          isTargetBookmaker(b.key)
        );
        if (!hasSportingbet) continue;

        const sportLabel = sport.startsWith("soccer")
          ? "futebol"
          : sport.split("_")[0];

        const match = await prisma.match.upsert({
          where: {
            sport_league_homeTeam_awayTeam_startTime: {
              sport: sportLabel,
              league: event.sport_title,
              homeTeam: event.home_team,
              awayTeam: event.away_team,
              startTime: new Date(event.commence_time),
            },
          },
          create: {
            sport: sportLabel,
            league: event.sport_title,
            homeTeam: event.home_team,
            awayTeam: event.away_team,
            startTime: new Date(event.commence_time),
          },
          update: { updatedAt: new Date() },
        });

        const oddsEntries: OddsEntry[] = [];

        for (const bookmaker of event.bookmakers) {
          for (const market of bookmaker.markets) {
            for (const outcome of market.outcomes) {
              const selection = mapSelectionName(
                outcome.name,
                event.home_team,
                event.away_team
              );
              const sharp = isSharpBookmaker(bookmaker.key);

              await prisma.oddsSnapshot.create({
                data: {
                  matchId: match.id,
                  bookmaker: bookmaker.title,
                  market: market.key,
                  selection,
                  odds: outcome.price,
                  isSharp: sharp,
                },
              });

              oddsEntries.push({
                bookmaker: bookmaker.title,
                selection,
                odds: outcome.price,
                isSharp: sharp,
              });
            }
          }
        }

        const valueBetCandidates = findValueBets(oddsEntries, 100, TARGET_BOOKMAKER_TITLE);
        for (const vb of valueBetCandidates) {
          await prisma.valueBet.create({
            data: {
              matchId: match.id,
              bookmaker: vb.bookmaker,
              market: "h2h",
              selection: vb.selection,
              odds: vb.odds,
              fairProb: vb.fairProb,
              ev: vb.ev,
              evPercent: vb.evPercent,
              margin: vb.margin,
              confidence: vb.confidence,
              expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            },
          });
          totalValueBets++;
        }

        totalEvents++;
      }
    } catch (error) {
      console.error(`Erro ao buscar odds para ${sport}:`, error);
    }
  }

  revalidatePath("/dashboard");
  return { totalEvents, totalValueBets };
}

export async function getTodayValueBets(filters?: {
  sport?: string;
  confidence?: string;
  minEv?: number;
}) {
  const now = new Date();
  const where: Record<string, unknown> = {
    status: "active",
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  if (filters?.confidence) {
    where.confidence = filters.confidence;
  }
  if (filters?.minEv && filters.minEv > 0) {
    where.evPercent = { gte: filters.minEv };
  }

  const valueBets = await prisma.valueBet.findMany({
    where,
    include: { match: true },
    orderBy: { evPercent: "desc" },
  });

  if (filters?.sport) {
    return valueBets.filter((vb) =>
      vb.match.sport.toLowerCase().includes(filters.sport!.toLowerCase())
    );
  }

  return valueBets;
}

export async function getAvailableSports() {
  if (!API_KEY) return [];
  try {
    const sports = await fetchSports(API_KEY);
    return sports.filter((s) => s.active);
  } catch {
    return [];
  }
}

export async function deactivateExpiredBets() {
  const now = new Date();
  await prisma.valueBet.updateMany({
    where: {
      status: "active",
      expiresAt: { lt: now },
    },
    data: { status: "expired" },
  });
  revalidatePath("/dashboard");
}
