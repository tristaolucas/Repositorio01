import { getChannels } from "./actions";
import { TipsterChannelForm } from "@/components/tipster-channel-form";
import { TipsterChannelCard } from "@/components/tipster-channel-card";
import { MonitorPlay } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TipsterPage() {
  const channels = await getChannels();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MonitorPlay className="h-6 w-6" />
          Tipster Tracker
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe tipsters do YouTube. Extraia palpites da transcrição dos
          vídeos, verifique o EV de cada um e acompanhe CLV e ROI por canal.
          Palpite de tipster é só candidato — só vira recomendação se passar na
          verificação de EV.
        </p>
      </div>

      <TipsterChannelForm />

      {channels.length === 0 ? (
        <div className="text-center py-12">
          <MonitorPlay className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhum canal cadastrado</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Adicione um canal de YouTube para começar a rastrear os palpites.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {channels.map((channel) => (
            <TipsterChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Popularidade não é sinal de qualidade. Todo palpite é verificado pelo
          EV do sistema antes de virar recomendação. Acompanhe o CLV (Closing
          Line Value) para avaliar a qualidade de longo prazo de cada tipster.
        </p>
      </div>
    </div>
  );
}
