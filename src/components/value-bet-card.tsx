import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, AlertTriangle } from "lucide-react";

interface ValueBetData {
  id: string;
  bookmaker: string;
  market: string;
  selection: string;
  odds: number;
  fairProb: number;
  ev: number;
  evPercent: number;
  confidence: string;
  foundAt: Date;
  expiresAt: Date | null;
  match: {
    homeTeam: string;
    awayTeam: string;
    league: string;
    startTime: Date;
    sport: string;
  };
}

const confidenceColors: Record<string, string> = {
  high: "bg-green-600 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-orange-500 text-white",
};

const confidenceLabels: Record<string, string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const selectionLabels: Record<string, string> = {
  home: "Casa",
  away: "Fora",
  draw: "Empate",
  over: "Over",
  under: "Under",
};

export function ValueBetCard({ vb }: { vb: ValueBetData }) {
  const fairOdds = 1 / vb.fairProb;
  const startTime = new Date(vb.match.startTime);
  const now = new Date();
  const hoursUntilStart = Math.max(
    0,
    (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)
  );

  return (
    <Card
      className={
        vb.confidence === "high"
          ? "border-green-500/50"
          : vb.confidence === "medium"
            ? "border-yellow-500/30"
            : ""
      }
    >
      <CardContent className="py-4 px-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {vb.match.homeTeam} vs {vb.match.awayTeam}
              </span>
              <Badge className={confidenceColors[vb.confidence] ?? ""}>
                {confidenceLabels[vb.confidence] ?? vb.confidence}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {vb.match.league} &middot; {vb.match.sport}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {startTime.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {hoursUntilStart < 2 && (
                <span className="text-amber-600 dark:text-amber-400 ml-1 flex items-center gap-0.5">
                  <AlertTriangle className="h-3 w-3" /> Em breve
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Seleção</div>
              <div className="font-medium">
                {selectionLabels[vb.selection] ?? vb.selection}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Casa</div>
              <div className="font-mono text-xs">{vb.bookmaker}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Odds</div>
              <div className="font-mono font-bold">{vb.odds.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Fair</div>
              <div className="font-mono">{fairOdds.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Prob. justa</div>
              <div className="font-mono">
                {(vb.fairProb * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">EV%</div>
              <div className="font-mono font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />+{vb.evPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
