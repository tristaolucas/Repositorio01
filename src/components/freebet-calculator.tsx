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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Calculator } from "lucide-react";
import { createFreebet, type SelectionInput } from "@/app/actions";
import {
  freebetEV,
  freebetEVFactor,
  oddsToImpliedProbability,
} from "@/lib/ev-math";

interface SelectionRow {
  id: string;
  description: string;
  odds: string;
}

interface PreviewResult {
  description: string;
  odds: number;
  impliedProb: number;
  ev: number;
  evFactor: number;
  isBest: boolean;
}

export function FreebetCalculator() {
  const [name, setName] = useState("");
  const [faceValue, setFaceValue] = useState("");
  const [selections, setSelections] = useState<SelectionRow[]>([
    { id: crypto.randomUUID(), description: "", odds: "" },
    { id: crypto.randomUUID(), description: "", odds: "" },
  ]);
  const [preview, setPreview] = useState<PreviewResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addSelection() {
    setSelections((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", odds: "" },
    ]);
  }

  function removeSelection(id: string) {
    if (selections.length <= 1) return;
    setSelections((prev) => prev.filter((s) => s.id !== id));
    setPreview(null);
  }

  function updateSelection(
    id: string,
    field: "description" | "odds",
    value: string
  ) {
    setSelections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    setPreview(null);
  }

  function calculatePreview() {
    setError(null);
    const fv = parseFloat(faceValue);
    if (isNaN(fv) || fv <= 0) {
      setError("Valor de face deve ser um número positivo");
      return;
    }

    const validSelections: { description: string; odds: number }[] = [];
    for (const sel of selections) {
      if (!sel.description.trim()) {
        setError("Todas as seleções precisam de descrição");
        return;
      }
      const odds = parseFloat(sel.odds);
      if (isNaN(odds) || odds <= 1) {
        setError(
          `Odds inválidas para "${sel.description}". Devem ser > 1.0 (formato decimal)`
        );
        return;
      }
      validSelections.push({ description: sel.description.trim(), odds });
    }

    const results: PreviewResult[] = validSelections.map((sel) => {
      const impliedProb = oddsToImpliedProbability(sel.odds);
      const evFactor = freebetEVFactor(sel.odds, impliedProb);
      const ev = freebetEV(fv, sel.odds, impliedProb);
      return {
        description: sel.description,
        odds: sel.odds,
        impliedProb,
        ev,
        evFactor,
        isBest: false,
      };
    });

    results.sort((a, b) => b.evFactor - a.evFactor);
    if (results.length > 0) results[0].isBest = true;

    setPreview(results);
  }

  function handleSave() {
    setError(null);
    const fv = parseFloat(faceValue);
    const sels: SelectionInput[] = selections
      .filter((s) => s.description.trim() && s.odds.trim())
      .map((s) => ({
        description: s.description.trim(),
        odds: parseFloat(s.odds),
      }));

    startTransition(async () => {
      try {
        await createFreebet(name, fv, sels);
        setName("");
        setFaceValue("");
        setSelections([
          { id: crypto.randomUUID(), description: "", odds: "" },
          { id: crypto.randomUUID(), description: "", odds: "" },
        ]);
        setPreview(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erro ao salvar");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Freebet</CardTitle>
        <CardDescription>
          Insira o valor de face e as seleções candidatas com suas odds
          decimais. O sistema calcula o EV usando probabilidade implícita (1/odd).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="freebet-name">Nome / Identificação</Label>
            <Input
              id="freebet-name"
              placeholder="Ex: Freebet Bet365 Agosto"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="face-value">Valor de Face (R$)</Label>
            <Input
              id="face-value"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Ex: 50.00"
              value={faceValue}
              onChange={(e) => {
                setFaceValue(e.target.value);
                setPreview(null);
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Seleções Candidatas</Label>
            <Button type="button" variant="outline" size="sm" onClick={addSelection}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {selections.map((sel, idx) => (
            <div key={sel.id} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                {idx === 0 && (
                  <Label className="text-xs text-muted-foreground">
                    Descrição
                  </Label>
                )}
                <Input
                  placeholder="Ex: Flamengo ML"
                  value={sel.description}
                  onChange={(e) =>
                    updateSelection(sel.id, "description", e.target.value)
                  }
                />
              </div>
              <div className="w-28 space-y-1">
                {idx === 0 && (
                  <Label className="text-xs text-muted-foreground">
                    Odds (dec.)
                  </Label>
                )}
                <Input
                  type="number"
                  min="1.01"
                  step="0.01"
                  placeholder="Ex: 2.50"
                  value={sel.odds}
                  onChange={(e) =>
                    updateSelection(sel.id, "odds", e.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSelection(sel.id)}
                disabled={selections.length <= 1}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}

        <div className="flex gap-2">
          <Button type="button" onClick={calculatePreview} variant="secondary">
            <Calculator className="h-4 w-4 mr-1" />
            Calcular EV
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !preview}
          >
            {isPending ? "Salvando..." : "Salvar Freebet"}
          </Button>
        </div>

        {preview && (
          <div className="space-y-3">
            <Separator />
            <h3 className="font-semibold text-sm">
              Resultado — Ranking por EV
            </h3>
            <p className="text-xs text-muted-foreground">
              Freebet de variância: o stake (valor de face) NÃO retorna.
              EV = prob. &times; (odd &minus; 1) &times; valor de face.
            </p>
            <div className="space-y-2">
              {preview.map((r, idx) => (
                <Card
                  key={idx}
                  className={
                    r.isBest
                      ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20"
                      : ""
                  }
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <span className="font-medium">{r.description}</span>
                        {r.isBest && (
                          <Badge
                            variant="default"
                            className="bg-green-600 text-white"
                          >
                            Melhor EV
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-muted-foreground text-xs">
                            Odds
                          </div>
                          <div className="font-mono">{r.odds.toFixed(2)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground text-xs">
                            Prob. Implícita
                          </div>
                          <div className="font-mono">
                            {(r.impliedProb * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground text-xs">
                            Fator EV
                          </div>
                          <div className="font-mono">
                            {r.evFactor.toFixed(4)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-muted-foreground text-xs">
                            EV (R$)
                          </div>
                          <div className="font-mono font-bold">
                            R$ {r.ev.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
