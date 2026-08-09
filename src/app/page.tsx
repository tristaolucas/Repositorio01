import { getFreebets } from "./actions";
import { FreebetCalculator } from "@/components/freebet-calculator";
import { FreebetList } from "@/components/freebet-list";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const freebets = await getFreebets();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Calculadora de Freebet por EV
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Insira uma freebet e suas seleções candidatas. O sistema calcula o
          valor esperado (EV) de cada opção e recomenda a melhor alocação.
          Freebet sem hedge é aposta de variância — o stake não retorna.
        </p>
        <FreebetCalculator />
      </section>

      {freebets.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Freebets Registradas
          </h2>
          <FreebetList freebets={freebets} />
        </section>
      )}
    </div>
  );
}
