"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { refreshOdds } from "@/app/dashboard/actions";

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleRefresh() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await refreshOdds();
        setResult(
          `${res.totalEvents} jogos atualizados, ${res.totalValueBets} value bets encontradas`
        );
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erro ao atualizar odds");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={handleRefresh} disabled={isPending} variant="outline">
        <RefreshCw
          className={`h-4 w-4 mr-1 ${isPending ? "animate-spin" : ""}`}
        />
        {isPending ? "Atualizando..." : "Atualizar Odds"}
      </Button>
      {result && (
        <p className="text-xs text-green-600 dark:text-green-400">{result}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
