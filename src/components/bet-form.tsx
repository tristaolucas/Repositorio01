"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createBet } from "@/app/banca/actions";
import { normalBetEV, oddsToImpliedProbability, isValueBet } from "@/lib/ev-math";
import { Badge } from "@/components/ui/badge";

export function BetForm() {
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState("futebol");
  const [league, setLeague] = useState("");
  const [odds, setOdds] = useState("");
  const [stake, setStake] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const oddsNum = parseFloat(odds);
  const stakeNum = parseFloat(stake);
  const canPreview = !isNaN(oddsNum) && oddsNum > 1 && !isNaN(stakeNum) && stakeNum > 0;

  let evPreview = 0;
  let probPreview = 0;
  let isValue = false;
  if (canPreview) {
    probPreview = oddsToImpliedProbability(oddsNum);
    evPreview = normalBetEV(stakeNum, oddsNum, probPreview);
    isValue = isValueBet(oddsNum, probPreview);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await createBet({
          description,
          sport,
          league,
          odds: oddsNum,
          stake: stakeNum,
          notes,
        });
        setDescription("");
        setOdds("");
        setStake("");
        setLeague("");
        setNotes("");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erro ao registrar");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Aposta</CardTitle>
        <CardDescription>
          Registre uma aposta para acompanhar seu desempenho. O EV é
          calculado automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Flamengo ML vs Palmeiras"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Esporte</Label>
              <Input
                value={sport}
                onChange={(e) => setSport(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Liga</Label>
              <Input
                placeholder="Ex: Brasileirão"
                value={league}
                onChange={(e) => setLeague(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Odds (decimal)</Label>
            <Input
              type="number"
              min="1.01"
              step="0.01"
              placeholder="Ex: 2.50"
              value={odds}
              onChange={(e) => setOdds(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Stake (R$)</Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ex: 50.00"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Input
              placeholder="Opcional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {canPreview && (
          <div className="flex items-center gap-4 p-3 rounded-md bg-muted/50">
            <div className="text-sm">
              <span className="text-muted-foreground">Prob. implícita:</span>{" "}
              <span className="font-mono font-medium">
                {(probPreview * 100).toFixed(1)}%
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">EV:</span>{" "}
              <span
                className={`font-mono font-medium ${
                  evPreview >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                R$ {evPreview.toFixed(2)}
              </span>
            </div>
            {isValue && (
              <Badge className="bg-green-600 text-white">Value Bet</Badge>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}

        <Button onClick={handleSubmit} disabled={isPending || !canPreview}>
          {isPending ? "Registrando..." : "Registrar Aposta"}
        </Button>
      </CardContent>
    </Card>
  );
}
