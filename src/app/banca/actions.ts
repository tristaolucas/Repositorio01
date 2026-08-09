"use server";

import { prisma } from "@/lib/db";
import { normalBetEV, oddsToImpliedProbability } from "@/lib/ev-math";
import { revalidatePath } from "next/cache";

export async function createBankroll(name: string, initialBalance: number) {
  if (!name.trim()) throw new Error("Nome da banca é obrigatório");
  if (initialBalance <= 0) throw new Error("Saldo inicial deve ser positivo");

  const bankroll = await prisma.bankroll.create({
    data: { name: name.trim(), initialBalance },
  });
  revalidatePath("/banca");
  return bankroll;
}

export async function getBankroll() {
  let bankroll = await prisma.bankroll.findFirst({
    include: { bets: { orderBy: { placedAt: "desc" } } },
  });
  if (!bankroll) {
    bankroll = await prisma.bankroll.create({
      data: { name: "Principal", initialBalance: 0 },
      include: { bets: true },
    });
  }
  return bankroll;
}

export async function getBankrollStats() {
  const bankroll = await getBankroll();
  const bets = bankroll.bets;

  const settled = bets.filter(
    (b) => b.status === "won" || b.status === "lost" || b.status === "void"
  );
  const totalStaked = settled.reduce((s, b) => s + b.stake, 0);
  const totalProfit = settled.reduce((s, b) => s + b.profit, 0);
  const wins = settled.filter((b) => b.status === "won").length;
  const losses = settled.filter((b) => b.status === "lost").length;
  const pending = bets.filter((b) => b.status === "pending").length;
  const currentBalance =
    bankroll.initialBalance +
    totalProfit -
    bets.filter((b) => b.status === "pending").reduce((s, b) => s + b.stake, 0);
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;
  const avgEv =
    settled.length > 0
      ? settled.reduce((s, b) => s + b.ev, 0) / settled.length
      : 0;

  return {
    bankroll,
    currentBalance,
    totalProfit,
    totalStaked,
    roi,
    wins,
    losses,
    pending,
    avgEv,
    totalBets: bets.length,
  };
}

export async function createBet(data: {
  description: string;
  sport?: string;
  league?: string;
  odds: number;
  stake: number;
  estimatedProb?: number;
  notes?: string;
}) {
  if (!data.description.trim()) throw new Error("Descrição é obrigatória");
  if (data.odds <= 1) throw new Error("Odds devem ser > 1.0");
  if (data.stake <= 0) throw new Error("Stake deve ser positivo");

  const bankroll = await getBankroll();
  const estimatedProb =
    data.estimatedProb ?? oddsToImpliedProbability(data.odds);
  const ev = normalBetEV(data.stake, data.odds, estimatedProb);

  await prisma.bet.create({
    data: {
      bankrollId: bankroll.id,
      description: data.description.trim(),
      sport: data.sport ?? "futebol",
      league: data.league ?? "",
      odds: data.odds,
      stake: data.stake,
      impliedProb: oddsToImpliedProbability(data.odds),
      estimatedProb,
      ev,
      notes: data.notes ?? "",
    },
  });

  revalidatePath("/banca");
}

export async function settleBet(
  betId: string,
  status: "won" | "lost" | "void",
  _closingOdds?: number
) {
  const bet = await prisma.bet.findUnique({ where: { id: betId } });
  if (!bet) throw new Error("Aposta não encontrada");

  let profit = 0;
  if (status === "won") profit = bet.stake * (bet.odds - 1);
  else if (status === "lost") profit = -bet.stake;

  await prisma.bet.update({
    where: { id: betId },
    data: {
      status,
      profit,
      settledAt: new Date(),
    },
  });

  revalidatePath("/banca");
}

export async function deleteBet(id: string) {
  await prisma.bet.delete({ where: { id } });
  revalidatePath("/banca");
}

export async function getBets(status?: string) {
  const where = status && status !== "all" ? { status } : {};
  return prisma.bet.findMany({
    where,
    orderBy: { placedAt: "desc" },
  });
}
