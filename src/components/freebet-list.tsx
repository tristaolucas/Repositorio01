"use client";

import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, Trash2 } from "lucide-react";
import { chooseSelection, deleteFreebet } from "@/app/actions";

interface FreebetSelection {
  id: string;
  description: string;
  odds: number;
  impliedProb: number;
  ev: number;
}

interface FreebetDecision {
  id: string;
  selectionId: string;
  chosenAt: Date;
}

interface Freebet {
  id: string;
  name: string;
  faceValue: number;
  createdAt: Date;
  selections: FreebetSelection[];
  decision: FreebetDecision | null;
}

export function FreebetList({ freebets }: { freebets: Freebet[] }) {
  return (
    <div className="space-y-4">
      {freebets.map((fb) => (
        <FreebetCard key={fb.id} freebet={fb} />
      ))}
    </div>
  );
}

function FreebetCard({ freebet }: { freebet: Freebet }) {
  const [isPending, startTransition] = useTransition();
  const bestEv =
    freebet.selections.length > 0
      ? Math.max(...freebet.selections.map((s) => s.ev))
      : 0;

  function handleChoose(selectionId: string) {
    startTransition(async () => {
      await chooseSelection(freebet.id, selectionId);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteFreebet(freebet.id);
    });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{freebet.name}</CardTitle>
            <CardDescription>
              Valor de face: R$ {freebet.faceValue.toFixed(2)} &mdash;{" "}
              {new Date(freebet.createdAt).toLocaleDateString("pt-BR")}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {freebet.selections.map((sel) => {
            const isBest = sel.ev === bestEv;
            const isChosen = freebet.decision?.selectionId === sel.id;

            return (
              <div
                key={sel.id}
                className={`flex items-center justify-between gap-4 p-3 rounded-md border flex-wrap ${
                  isChosen
                    ? "border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20"
                    : isBest
                      ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10"
                      : "border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{sel.description}</span>
                  {isBest && (
                    <Badge
                      variant="default"
                      className="bg-green-600 text-white text-xs"
                    >
                      Melhor EV
                    </Badge>
                  )}
                  {isChosen && (
                    <Badge variant="secondary" className="text-xs">
                      Escolhida
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs">Odds</div>
                    <div className="font-mono">{sel.odds.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs">Prob.</div>
                    <div className="font-mono">
                      {(sel.impliedProb * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs">EV</div>
                    <div className="font-mono font-bold">
                      R$ {sel.ev.toFixed(2)}
                    </div>
                  </div>
                  {!isChosen && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChoose(sel.id)}
                      disabled={isPending}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Escolher
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Separator className="my-3" />
        <p className="text-xs text-muted-foreground">
          Freebet de variância — o stake não retorna. EV calculado com
          probabilidade implícita (1/odd). Resultados reais podem divergir
          significativamente da estimativa.
        </p>
      </CardContent>
    </Card>
  );
}
