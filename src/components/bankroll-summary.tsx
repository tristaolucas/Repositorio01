import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";

interface BankrollStatsProps {
  currentBalance: number;
  initialBalance: number;
  totalProfit: number;
  roi: number;
  wins: number;
  losses: number;
  pending: number;
  avgEv: number;
  totalBets: number;
}

export function BankrollSummary(props: BankrollStatsProps) {
  const winRate =
    props.wins + props.losses > 0
      ? (props.wins / (props.wins + props.losses)) * 100
      : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          {props.totalProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {props.currentBalance.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Inicial: R$ {props.initialBalance.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Lucro / Prejuízo</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              props.totalProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {props.totalProfit >= 0 ? "+" : ""}R$ {props.totalProfit.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            ROI: {props.roi.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Apostas</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{props.totalBets}</div>
          <p className="text-xs text-muted-foreground">
            {props.wins}W / {props.losses}L / {props.pending} pendentes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            EV médio: R$ {props.avgEv.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
