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
import { Plus } from "lucide-react";
import { addChannel } from "@/app/tipster/actions";

export function TipsterChannelForm() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await addChannel(name, url);
        setName("");
        setUrl("");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erro ao adicionar canal");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Canal</CardTitle>
        <CardDescription>
          Cadastre um canal de YouTube de tipster para acompanhar seus palpites.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome do Canal</Label>
            <Input
              placeholder="Ex: Apostas do João"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>URL do Canal</Label>
            <Input
              placeholder="https://youtube.com/@canal"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
        <Button onClick={handleSubmit} disabled={isPending}>
          <Plus className="h-4 w-4 mr-1" />
          {isPending ? "Adicionando..." : "Adicionar Canal"}
        </Button>
      </CardContent>
    </Card>
  );
}
