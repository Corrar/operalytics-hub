import { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Timer, Gauge, Play, Pause, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, DeleteDialog, type FieldConfig } from "@/components/CrudDialog";

interface TimelineStep {
  id: number;
  label: string;
  progress: number;
  status: "concluido" | "em_andamento" | "pendente";
}

let nextId = 7;

const stepFields: FieldConfig[] = [
  { name: "label", label: "Etapa", type: "text", required: true },
  { name: "progress", label: "Progresso (%)", type: "number", required: true },
  { name: "status", label: "Status", type: "select", options: [
    { value: "pendente", label: "Pendente" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluido", label: "Concluído" },
  ]},
];

export default function EsteiraPanel() {
  const [steps, setSteps] = useState<TimelineStep[]>([
    { id: 1, label: "Corte", progress: 100, status: "concluido" },
    { id: 2, label: "Dobra", progress: 100, status: "concluido" },
    { id: 3, label: "Soldagem", progress: 78, status: "em_andamento" },
    { id: 4, label: "Montagem", progress: 0, status: "pendente" },
    { id: 5, label: "Acabamento", progress: 0, status: "pendente" },
    { id: 6, label: "Inspeção", progress: 0, status: "pendente" },
  ]);
  const [pecasHora, setPecasHora] = useState(142);
  const [running, setRunning] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; editing?: TimelineStep }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const totalProgress = steps.length ? Math.round(steps.reduce((a, s) => a + s.progress, 0) / steps.length) : 0;

  const advanceStep = (id: number) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newProgress = Math.min(s.progress + 25, 100);
        return { ...s, progress: newProgress, status: newProgress === 100 ? "concluido" : "em_andamento" };
      })
    );
  };

  const handleSubmit = (data: Record<string, string | number>) => {
    const progress = Number(data.progress) || 0;
    const status = (data.status as TimelineStep["status"]) || (progress === 100 ? "concluido" : progress > 0 ? "em_andamento" : "pendente");
    if (dialog.editing) {
      setSteps((prev) => prev.map((s) => s.id === dialog.editing!.id ? { ...s, label: String(data.label), progress, status } : s));
    } else {
      setSteps((prev) => [...prev, { id: nextId++, label: String(data.label), progress, status }]);
    }
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
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setDialog({ open: true })}>
          <Plus className="w-3.5 h-3.5" /> Nova Etapa
        </Button>
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
          <Button
            variant={running ? "destructive" : "default"}
            size="sm"
            onClick={() => setRunning(!running)}
            className="gap-2"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? "Pausar" : "Iniciar"}
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h3 className="text-base font-semibold text-foreground mb-6">Timeline de Produção</h3>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
          <div className="flex justify-between relative overflow-x-auto pb-2">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 min-w-[80px]" style={{ width: `${100 / steps.length}%` }}>
                <button
                  onClick={() => advanceStep(step.id)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer hover:scale-110",
                    step.status === "concluido" && "bg-success text-success-foreground",
                    step.status === "em_andamento" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    step.status === "pendente" && "bg-muted text-muted-foreground",
                  )}
                >
                  {step.progress}%
                </button>
                <span className="text-xs font-medium text-foreground text-center">{step.label}</span>
                <ProgressBar value={step.progress} size="sm" variant={step.status === "concluido" ? "success" : "primary"} className="w-16" />
                <div className="flex gap-0.5">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setDialog({ open: true, editing: step })}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => setDeleteTarget({ id: step.id, name: step.label })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CrudDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        onSubmit={handleSubmit}
        title={dialog.editing ? "Editar Etapa" : "Nova Etapa"}
        fields={stepFields}
        initialData={dialog.editing as any}
        submitLabel={dialog.editing ? "Atualizar" : "Criar"}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && setSteps((prev) => prev.filter((s) => s.id !== deleteTarget.id))}
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
}
