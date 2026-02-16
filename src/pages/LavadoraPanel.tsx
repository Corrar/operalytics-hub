import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ProgressBar } from "@/components/ProgressBar";
import { Gauge } from "@/components/Gauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface WashCycle {
  id: number;
  label: string;
  phase: string;
  progress: number;
  temp: number;
  chemical: number;
}

interface WaitingLot {
  id: number;
  name: string;
  items: number;
}

const initialCycles: WashCycle[] = [
  { id: 1, label: "Lavadora 01", phase: "Enxágue", progress: 85, temp: 72, chemical: 45 },
  { id: 2, label: "Lavadora 02", phase: "Lavagem", progress: 42, temp: 88, chemical: 78 },
  { id: 3, label: "Lavadora 03", phase: "Centrifugação", progress: 95, temp: 35, chemical: 12 },
];

const waitingLots: WaitingLot[] = [
  { id: 1, name: "Lote #A12", items: 45 },
  { id: 2, name: "Lote #B08", items: 30 },
  { id: 3, name: "Lote #C19", items: 60 },
];

export default function LavadoraPanel() {
  const { canEdit } = useUser();
  const editable = canEdit("lavadora");
  const [cycles, setCycles] = useState(initialCycles);

  const totalProgress = Math.round(cycles.reduce((a, c) => a + c.progress, 0) / cycles.length);

  const advanceCycle = (id: number) => {
    if (!editable) return;
    setCycles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, progress: Math.min(c.progress + 10, 100) } : c))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lavadora</h1>
          <p className="text-sm text-muted-foreground">Ciclos e Monitoramento</p>
        </div>
        {!editable && (
          <Badge variant="outline" className="border-accent text-accent-foreground bg-accent/10">
            Somente Leitura
          </Badge>
        )}
      </div>

      <ProgressBar value={totalProgress} showLabel size="lg" />

      {/* Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="bg-card rounded-2xl p-5 card-shadow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{cycle.label}</h3>
              <span className="text-xs text-primary font-medium">{cycle.phase}</span>
            </div>

            <ProgressBar value={cycle.progress} showLabel variant={cycle.progress >= 90 ? "success" : "primary"} />

            <div className="flex justify-around">
              <Gauge value={cycle.temp} max={100} label="Temperatura" unit="°C" size={90} />
              <Gauge value={cycle.chemical} max={100} label="Químico" unit="%" size={90} />
            </div>

            {editable && (
              <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => advanceCycle(cycle.id)}>
                <RotateCw className="w-3.5 h-3.5" /> Avançar Ciclo
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Waiting lots */}
      <div className="bg-card rounded-2xl p-5 card-shadow">
        <h3 className="text-base font-semibold text-foreground mb-3">Lotes Aguardando Secagem</h3>
        <div className="space-y-2">
          {waitingLots.map((lot) => (
            <div key={lot.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">{lot.name}</p>
                <p className="text-xs text-muted-foreground">{lot.items} peças</p>
              </div>
              {editable && (
                <Button size="sm" variant="ghost" className="gap-1.5 text-primary">
                  <Play className="w-3.5 h-3.5" /> Iniciar
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
