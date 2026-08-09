import { Alert } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function EVDisclaimer() {
  return (
    <Alert className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
      <TriangleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <div className="ml-2">
        <p className="text-sm font-medium">Aviso importante</p>
        <p className="text-xs mt-1">
          Todas as recomendações são estimativas de valor esperado (EV) baseadas
          em probabilidades calculadas. Resultados reais podem variar
          significativamente. Este sistema <strong>não executa apostas</strong>{" "}
          — apenas calcula e recomenda. A decisão final é sempre sua.
        </p>
      </div>
    </Alert>
  );
}
