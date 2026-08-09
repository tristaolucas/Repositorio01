"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trash2,
  ExternalLink,
  FileText,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  deleteChannel,
  processVideo,
  verifyPick,
  settlePick,
} from "@/app/tipster/actions";

interface TipsterPick {
  id: string;
  description: string;
  odds: number;
  evVerified: boolean;
  evResult: number | null;
  outcome: string;
  videoUrl: string;
  extractedAt: Date;
}

interface Channel {
  id: string;
  name: string;
  channelUrl: string;
  totalPicks: number;
  wins: number;
  losses: number;
  avgClv: number;
  roi: number;
  picks: TipsterPick[];
}

export function TipsterChannelCard({ channel }: { channel: Channel }) {
  const [isPending, startTransition] = useTransition();
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleProcessVideo() {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await processVideo(channel.id, videoUrl, transcript);
        setResult(`${res.count} palpite(s) extraído(s) do vídeo`);
        setVideoUrl("");
        setTranscript("");
        setShowForm(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erro ao processar vídeo");
      }
    });
  }

  function handleVerify(pickId: string) {
    startTransition(async () => {
      await verifyPick(pickId);
    });
  }

  function handleSettle(pickId: string, outcome: "won" | "lost") {
    startTransition(async () => {
      await settlePick(pickId, outcome);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteChannel(channel.id);
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {channel.name}
              <a
                href={channel.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardTitle>
            <CardDescription className="flex items-center gap-3 mt-1">
              <span>{channel.totalPicks} palpites</span>
              <span>
                {channel.wins}W / {channel.losses}L
              </span>
              <span
                className={
                  channel.roi >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                ROI: {channel.roi.toFixed(1)}%
              </span>
              <span>CLV médio: {(channel.avgClv * 100).toFixed(2)}%</span>
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(!showForm)}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Processar Vídeo
            </Button>
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
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 rounded-md border bg-muted/30">
            <div className="space-y-2">
              <Label>URL do Vídeo</Label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Transcrição do Vídeo (cole aqui a transcrição com os palpites)
              </Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={`Cole a transcrição aqui. O sistema busca padrões como:\n- "Flamengo ML odds 2.50"\n- "Over 2.5 @1.85"\n- "Aposta no Corinthians cotação 3.10"`}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
            {result && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                {result}
              </p>
            )}
            <Button
              onClick={handleProcessVideo}
              disabled={isPending || !transcript.trim()}
              size="sm"
            >
              {isPending ? "Processando..." : "Extrair Palpites"}
            </Button>
          </div>
        )}

        {channel.picks.length > 0 && (
          <>
            <Separator />
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Palpite</TableHead>
                    <TableHead>Odds</TableHead>
                    <TableHead>EV</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channel.picks.map((pick) => (
                    <TableRow key={pick.id}>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {pick.description}
                      </TableCell>
                      <TableCell className="font-mono">
                        {pick.odds.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {pick.evVerified ? (
                          <Badge
                            className={
                              pick.evResult !== null && pick.evResult > 0
                                ? "bg-green-600 text-white"
                                : "bg-red-600 text-white"
                            }
                          >
                            {pick.evResult !== null
                              ? `${pick.evResult > 0 ? "+" : ""}${pick.evResult.toFixed(1)}%`
                              : "N/A"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Não verificado
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            pick.outcome === "won"
                              ? "default"
                              : pick.outcome === "lost"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {pick.outcome === "pending"
                            ? "Pendente"
                            : pick.outcome === "won"
                              ? "Ganhou"
                              : pick.outcome === "lost"
                                ? "Perdeu"
                                : pick.outcome}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!pick.evVerified && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVerify(pick.id)}
                              disabled={isPending}
                              title="Verificar EV"
                              className="h-7 w-7"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {pick.outcome === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSettle(pick.id, "won")}
                                disabled={isPending}
                                title="Ganhou"
                                className="h-7 w-7 text-green-600"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleSettle(pick.id, "lost")}
                                disabled={isPending}
                                title="Perdeu"
                                className="h-7 w-7 text-red-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
