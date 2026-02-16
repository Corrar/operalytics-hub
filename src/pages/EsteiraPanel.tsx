import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Gauge, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: number;
  label: string;
  progress: number;
  status: "concluido" | "em_andamento" | "pendente";
}

const initialSteps: TimelineStep[] = [
  { id: 1, label: "Corte", progress: 100, status: "concluido" },
  { id: 2, label: "Dobra", progress: 100, status: "concluido" },
  { id: 3, label: "Soldagem", progress: 78, status: "em_andamento" },
  { id: 4, label: "Montagem", progress: 0, status: "pendente" },
  { id: 5, label: "Acabamento", progress: 0, status: "pendente" },
  { id: 6, label: "Inspeção", progress: 0, status: "pendente" },
];

export default function EsteiraPanel() {
  const { canEdit } = useUser();
  const editable = canEdit("esteira");
  const [steps, setSteps] = useState(initialSteps);
  const [pecasHora] = useState(142);
  const [running, setRunning] = useState(true);

  const totalProgress = Math.round(steps.reduce((a, s) => a + s.progress, 0) / steps.length);

  const advanceStep = (id: number) => {
    if (!editable) return;
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newProgress = Math.min(s.progress + 25, 100);
        return {
          ...s,
          progress: newProgress,
          status: newProgress === 100 ? "concluido" : "em_andamento",
        };
      })
    );
  };

  const statusBg: Record<string, string> = {
    concluido: "bg-success",
    em_andamento: "bg-primary",
    pendente: "bg-muted",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produção Esteira</h1>
          <p className="text-sm text-muted-foreground">Linha do Tempo do Lote</p>
        </div>
        <div className="flex items-center gap-2">
          {!editable && (
            <Badge variant="outline" className="border-accent text-accent-foreground bg-accent/10">
              Somente Leitura
            </Badge>
          )}
        </div>
      </div>

      <ProgressBar value={totalProgress} showLabel size="lg" />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 card-shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gauge className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Peças/Hora</p>
            <p className="text-xl font-bold text-foreground">{pecasHora}</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 card-shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Timer className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tempo Estimado</p>
            <p className="text-xl font-bold text-foreground">2h 15min</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 card-shadow flex items-center gap-4">
          {editable ? (
            <Button
              variant={running ? "destructive" : "default"}
              size="sm"
              onClick={() => setRunning(!running)}
              className="gap-2"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? "Pausar" : "Iniciar"}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className={cn("w-2.5 h-2.5 rounded-full", running ? "bg-success animate-pulse" : "bg-muted-foreground")} />
              <span className="text-sm font-medium">{running ? "Em operação" : "Parada"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h3 className="text-base font-semibold text-foreground mb-6">Timeline de Produção</h3>
        <div className="relative">
          {/* Horizontal line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          <div className="flex justify-between relative">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10" style={{ width: `${100 / steps.length}%` }}>
                <button
                  onClick={() => advanceStep(step.id)}
                  disabled={!editable || step.status === "concluido"}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    step.status === "concluido" && "bg-success text-success-foreground",
                    step.status === "em_andamento" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    step.status === "pendente" && "bg-muted text-muted-foreground",
                    editable && step.status !== "concluido" && "cursor-pointer hover:scale-110"
                  )}
                >
                  {step.progress}%
                </button>
                <span className="text-xs font-medium text-foreground text-center">{step.label}</span>
                <ProgressBar value={step.progress} size="sm" variant={step.status === "concluido" ? "success" : "primary"} className="w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
