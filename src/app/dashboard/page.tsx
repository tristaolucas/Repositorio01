import { getTodayValueBets } from "./actions";
import { ValueBetCard } from "@/components/value-bet-card";
import { RefreshButton } from "@/components/refresh-button";
import { Alert } from "@/components/ui/alert";
import { TrendingUp, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const valueBets = await getTodayValueBets();
  const apiConfigured = !!process.env.THE_ODDS_API_KEY;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Value Bets do Dia
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Apostas com EV+ para fazer na Sportingbet. Confira a odd na
            Sportingbet — se for igual ou maior, aposte.
          </p>
        </div>
        {apiConfigured && <RefreshButton />}
      </div>

      {!apiConfigured && (
        <Alert className="border-blue-500/50 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <div className="ml-2">
            <p className="text-sm font-medium">Configuração necessária</p>
            <p className="text-xs mt-1">
              Para buscar odds automaticamente, cadastre-se gratuitamente em{" "}
              <a
                href="https://the-odds-api.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                the-odds-api.com
              </a>{" "}
              e adicione sua chave no arquivo{" "}
              <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">
                .env
              </code>
              :
              <br />
              <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded mt-1 inline-block">
                THE_ODDS_API_KEY=sua_chave_aqui
              </code>
            </p>
          </div>
        </Alert>
      )}

      {valueBets.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma value bet encontrada</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            {apiConfigured
              ? 'Clique em "Atualizar Odds" para buscar as odds mais recentes da Sportingbet em todos os esportes.'
              : "Configure a API key para começar a buscar odds automaticamente."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {valueBets.length} value bet{valueBets.length !== 1 ? "s" : ""}{" "}
            encontrada{valueBets.length !== 1 ? "s" : ""}. Cada uma mostra a
            probabilidade justa estimada e o EV%. A decisão de apostar é sempre
            sua.
          </p>
          {valueBets.map((vb) => (
            <ValueBetCard key={vb.id} vb={vb} />
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Probabilidades estimadas via remoção de vig (margem) das odds sharp.
          Incerteza inerente — resultados reais podem divergir significativamente.
          Este sistema apenas calcula e recomenda. Nunca executa apostas.
        </p>
      </div>
    </div>
  );
}
