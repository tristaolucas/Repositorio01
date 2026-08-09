"use server";

import { prisma } from "@/lib/db";
import { freebetEV, oddsToImpliedProbability } from "@/lib/ev-math";
import { revalidatePath } from "next/cache";

export interface SelectionInput {
  description: string;
  odds: number;
}

export async function createFreebet(
  name: string,
  faceValue: number,
  selections: SelectionInput[]
) {
  if (!name.trim()) throw new Error("Nome da freebet é obrigatório");
  if (faceValue <= 0) throw new Error("Valor de face deve ser positivo");
  if (selections.length === 0)
    throw new Error("Adicione pelo menos uma seleção");

  for (const sel of selections) {
    if (!sel.description.trim())
      throw new Error("Descrição da seleção é obrigatória");
    if (sel.odds <= 1) throw new Error("Odds devem ser maiores que 1.0");
  }

  const freebet = await prisma.freebet.create({
    data: {
      name: name.trim(),
      faceValue,
      selections: {
        create: selections.map((sel) => {
          const impliedProb = oddsToImpliedProbability(sel.odds);
          const ev = freebetEV(faceValue, sel.odds, impliedProb);
          return {
            description: sel.description.trim(),
            odds: sel.odds,
            impliedProb,
            ev,
          };
        }),
      },
    },
    include: { selections: true },
  });

  revalidatePath("/");
  return freebet;
}

export async function chooseSelection(freebetId: string, selectionId: string) {
  await prisma.freebetDecision.upsert({
    where: { freebetId },
    create: { freebetId, selectionId },
    update: { selectionId, chosenAt: new Date() },
  });
  revalidatePath("/");
}

export async function deleteFreebet(id: string) {
  await prisma.freebet.delete({ where: { id } });
  revalidatePath("/");
}

export async function getFreebets() {
  return prisma.freebet.findMany({
    include: {
      selections: { orderBy: { ev: "desc" } },
      decision: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
