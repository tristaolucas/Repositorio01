"use server";

import { prisma } from "@/lib/db";
import { extractPicksFromTranscript, computeTipsterStats } from "@/lib/tipster";
import { isValueBet, oddsToImpliedProbability } from "@/lib/ev-math";
import { revalidatePath } from "next/cache";

export async function addChannel(name: string, channelUrl: string) {
  if (!name.trim()) throw new Error("Nome do canal é obrigatório");
  if (!channelUrl.trim()) throw new Error("URL do canal é obrigatória");

  const channel = await prisma.tipster.create({
    data: {
      name: name.trim(),
      channelUrl: channelUrl.trim(),
    },
  });
  revalidatePath("/tipster");
  return channel;
}

export async function getChannels() {
  return prisma.tipster.findMany({
    include: {
      picks: { orderBy: { extractedAt: "desc" }, take: 10 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function processVideo(tipsterId: string, videoUrl: string, transcript: string) {
  if (!transcript.trim()) throw new Error("Transcrição é obrigatória");

  const picks = extractPicksFromTranscript(transcript);

  if (picks.length === 0) {
    throw new Error(
      "Nenhum palpite encontrado na transcrição. Certifique-se que contém odds (ex: @2.50 ou odds 1.85)"
    );
  }

  const created = [];
  for (const pick of picks) {
    const tipsterPick = await prisma.tipsterPick.create({
      data: {
        tipsterId,
        videoUrl: videoUrl.trim(),
        description: pick.description,
        sport: pick.sport ?? "futebol",
        odds: pick.odds,
      },
    });
    created.push(tipsterPick);
  }

  await prisma.tipster.update({
    where: { id: tipsterId },
    data: { totalPicks: { increment: created.length } },
  });

  revalidatePath("/tipster");
  return { count: created.length, picks: created };
}

export async function verifyPick(pickId: string, fairProb?: number) {
  const pick = await prisma.tipsterPick.findUnique({ where: { id: pickId } });
  if (!pick) throw new Error("Palpite não encontrado");

  const estimatedProb = fairProb ?? oddsToImpliedProbability(pick.odds);
  const evPositive = isValueBet(pick.odds, estimatedProb);
  const ev = evPositive
    ? (estimatedProb * pick.odds - 1) * 100
    : (estimatedProb * pick.odds - 1) * 100;

  await prisma.tipsterPick.update({
    where: { id: pickId },
    data: {
      evVerified: true,
      evResult: ev,
    },
  });

  revalidatePath("/tipster");
  return { evPositive, ev };
}

export async function settlePick(
  pickId: string,
  outcome: "won" | "lost" | "void",
  closingOdds?: number
) {
  const pick = await prisma.tipsterPick.findUnique({
    where: { id: pickId },
    include: { tipster: true },
  });
  if (!pick) throw new Error("Palpite não encontrado");

  const updateData: Record<string, unknown> = {
    outcome,
    settledAt: new Date(),
  };
  if (closingOdds) updateData.closingOdds = closingOdds;

  await prisma.tipsterPick.update({
    where: { id: pickId },
    data: updateData,
  });

  const allPicks = await prisma.tipsterPick.findMany({
    where: { tipsterId: pick.tipsterId },
  });
  const stats = computeTipsterStats(
    allPicks.map((p) => ({
      odds: p.odds,
      closingOdds: p.closingOdds,
      outcome: p.outcome,
    }))
  );

  await prisma.tipster.update({
    where: { id: pick.tipsterId },
    data: {
      wins: stats.wins,
      losses: stats.losses,
      avgClv: stats.avgClv,
      roi: stats.roi,
    },
  });

  revalidatePath("/tipster");
}

export async function deleteChannel(id: string) {
  await prisma.tipster.delete({ where: { id } });
  revalidatePath("/tipster");
}
