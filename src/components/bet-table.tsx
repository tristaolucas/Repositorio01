"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Minus, Trash2 } from "lucide-react";
import { settleBet, deleteBet } from "@/app/banca/actions";

interface Bet {
  id: string;
  description: string;
  sport: string;
  odds: number;
  stake: number;
  ev: number;
  status: string;
  profit: number;
  placedAt: Date;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  won: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  void: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  won: "Ganhou",
  lost: "Perdeu",
  void: "Anulada",
};

export function BetTable({ bets }: { bets: Bet[] }) {
  const [isPending, startTransition] = useTransition();

  function handleSettle(betId: string, status: "won" | "lost" | "void") {
    startTransition(async () => {
      await settleBet(betId, status);
    });
  }

  function handleDelete(betId: string) {
    startTransition(async () => {
      await deleteBet(betId);
    });
  }

  if (bets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Nenhuma aposta registrada ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Odds</TableHead>
            <TableHead>Stake</TableHead>
            <TableHead>EV</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>P/L</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bets.map((bet) => (
            <TableRow key={bet.id}>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(bet.placedAt).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">
                {bet.description}
              </TableCell>
              <TableCell className="font-mono">{bet.odds.toFixed(2)}</TableCell>
              <TableCell className="font-mono">
                R$ {bet.stake.toFixed(2)}
              </TableCell>
              <TableCell
                className={`font-mono ${
                  bet.ev >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                R$ {bet.ev.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[bet.status] ?? ""}>
                  {statusLabels[bet.status] ?? bet.status}
                </Badge>
              </TableCell>
              <TableCell
                className={`font-mono font-medium ${
                  bet.profit > 0
                    ? "text-green-600 dark:text-green-400"
                    : bet.profit < 0
                      ? "text-red-600 dark:text-red-400"
                      : ""
                }`}
              >
                {bet.status !== "pending"
                  ? `${bet.profit >= 0 ? "+" : ""}R$ ${bet.profit.toFixed(2)}`
                  : "-"}
              </TableCell>
              <TableCell>
                {bet.status === "pending" ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSettle(bet.id, "won")}
                      disabled={isPending}
                      title="Ganhou"
                      className="h-7 w-7 text-green-600"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSettle(bet.id, "lost")}
                      disabled={isPending}
                      title="Perdeu"
                      className="h-7 w-7 text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSettle(bet.id, "void")}
                      disabled={isPending}
                      title="Anular"
                      className="h-7 w-7"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(bet.id)}
                    disabled={isPending}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
