import { getBankrollStats, getBets } from "./actions";
import { BankrollSummary } from "@/components/bankroll-summary";
import { BetForm } from "@/components/bet-form";
import { BetTable } from "@/components/bet-table";

export const dynamic = "force-dynamic";

export default async function BancaPage() {
  const stats = await getBankrollStats();
  const bets = await getBets();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Banca & Registro
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Acompanhe suas apostas, saldo, lucro/prejuízo e ROI. Registre cada
          aposta e marque o resultado para análise de desempenho.
        </p>
      </div>

      <BankrollSummary
        currentBalance={stats.currentBalance}
        initialBalance={stats.bankroll.initialBalance}
        totalProfit={stats.totalProfit}
        roi={stats.roi}
        wins={stats.wins}
        losses={stats.losses}
        pending={stats.pending}
        avgEv={stats.avgEv}
        totalBets={stats.totalBets}
      />

      <BetForm />

      <div>
        <h3 className="text-lg font-semibold mb-3">Histórico de Apostas</h3>
        <BetTable bets={bets} />
      </div>
    </div>
  );
}
