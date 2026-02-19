import { useState, useMemo } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Gauge, Play, Pause, Plus, Pencil, Trash2, RotateCcw, ChevronLeft, Search, ArrowRight, CheckCircle2, Clock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, DeleteDialog, type FieldConfig } from "@/components/CrudDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimelineStep {
  id: number;
  label: string;
  progress: number;
  status: "concluido" | "em_andamento" | "pendente";
  responsavel: string;
  lote: string;
}

let nextId = 7;

const stepFields: FieldConfig[] = [
  { name: "label", label: "Etapa", type: "text", required: true },
  { name: "responsavel", label: "Responsável", type: "text", required: true },
  { name: "lote", label: "Lote", type: "text", required: true },
  { name: "progress", label: "Progresso (%)", type: "number", required: true },
  { name: "status", label: "Status", type: "select", options: [
    { value: "pendente", label: "Pendente" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluido", label: "Concluído" },
  ]},
];

const statusIcons: Record<string, React.ReactNode> = {
  concluido: <CheckCircle2 className="w-4 h-4" />,
  em_andamento: <Clock className="w-4 h-4" />,
  pendente: <Circle className="w-4 h-4" />,
};

const statusLabel: Record<string, string> = {
  concluido: "Concluído",
  em_andamento: "Em Andamento",
  pendente: "Pendente",
};

export default function EsteiraPanel() {
  const [steps, setSteps] = useState<TimelineStep[]>([
    { id: 1, label: "Corte", progress: 100, status: "concluido", responsavel: "Carlos", lote: "Lote #A1" },
    { id: 2, label: "Dobra", progress: 100, status: "concluido", responsavel: "Ana", lote: "Lote #A1" },
    { id: 3, label: "Soldagem", progress: 78, status: "em_andamento", responsavel: "Pedro", lote: "Lote #A1" },
    { id: 4, label: "Montagem", progress: 0, status: "pendente", responsavel: "Maria", lote: "Lote #A1" },
    { id: 5, label: "Acabamento", progress: 0, status: "pendente", responsavel: "João", lote: "Lote #A1" },
    { id: 6, label: "Inspeção", progress: 0, status: "pendente", responsavel: "Lucas", lote: "Lote #A1" },
  ]);
  const [pecasHora, setPecasHora] = useState(142);
  const [running, setRunning] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; editing?: TimelineStep }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredSteps = useMemo(() => {
    return steps.filter((s) => {
      const matchesSearch = !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase()) || s.responsavel.toLowerCase().includes(searchQuery.toLowerCase()) || s.lote.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "todos" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [steps, searchQuery, statusFilter]);

  const totalProgress = steps.length ? Math.round(steps.reduce((a, s) => a + s.progress, 0) / steps.length) : 0;
  const completedCount = steps.filter((s) => s.status === "concluido").length;
  const inProgressCount = steps.filter((s) => s.status === "em_andamento").length;
  const pendingCount = steps.filter((s) => s.status === "pendente").length;

  const advanceStep = (id: number) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newProgress = Math.min(s.progress + 25, 100);
        return { ...s, progress: newProgress, status: newProgress === 100 ? "concluido" : "em_andamento" };
      })
    );
  };

  const rewindStep = (id: number) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newProgress = Math.max(s.progress - 25, 0);
        return { ...s, progress: newProgress, status: newProgress === 0 ? "pendente" : "em_andamento" };
      })
    );
  };

  const resetStep = (id: number) => {
    setSteps((prev) =>
      prev.map((s) => s.id === id ? { ...s, progress: 0, status: "pendente" } : s)
    );
  };

  const resetAll = () => {
    setSteps((prev) => prev.map((s) => ({ ...s, progress: 0, status: "pendente" as const })));
  };

  const handleSubmit = (data: Record<string, string | number>) => {
    const progress = Number(data.progress) || 0;
    const status = (data.status as TimelineStep["status"]) || (progress === 100 ? "concluido" : progress > 0 ? "em_andamento" : "pendente");
    if (dialog.editing) {
      setSteps((prev) => prev.map((s) => s.id === dialog.editing!.id ? { ...s, label: String(data.label), responsavel: String(data.responsavel), lote: String(data.lote), progress, status } : s));
    } else {
      setSteps((prev) => [...prev, { id: nextId++, label: String(data.label), responsavel: String(data.responsavel || ""), lote: String(data.lote || ""), progress, status }]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produção Esteira</h1>
          <p className="text-sm text-muted-foreground">Linha do Tempo do Lote</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={resetAll}>
            <RotateCcw className="w-3.5 h-3.5" /> Resetar Tudo
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setDialog({ open: true })}>
            <Plus className="w-3.5 h-3.5" /> Nova Etapa
          </Button>
        </div>
      </div>

      {/* Global progress */}
      <ProgressBar value={totalProgress} showLabel size="lg" variant={totalProgress === 100 ? "success" : "primary"} />

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Peças/Hora</p>
              <p className="text-xl font-bold text-foreground">{pecasHora}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tempo Est.</p>
              <p className="text-xl font-bold text-foreground">2h 15m</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 card-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Concluídas</p>
              <p className="text-xl font-bold text-foreground">{completedCount}/{steps.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 card-shadow flex items-center justify-center">
          <Button
            variant={running ? "destructive" : "default"}
            size="sm"
            onClick={() => setRunning(!running)}
            className="gap-2 w-full"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? "Pausar Esteira" : "Iniciar Esteira"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar etapa, responsável ou lote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visual Timeline */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h3 className="text-base font-semibold text-foreground mb-6">Timeline de Produção</h3>
        <div className="relative">
          {/* Horizontal connector line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-border hidden sm:block" />
          <div className="absolute top-6 left-6 h-0.5 bg-success hidden sm:block" style={{ width: `${Math.max(0, ((completedCount) / steps.length) * 100 - 6)}%` }} />

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0 relative">
            {steps.map((step, idx) => {
              const isFiltered = !filteredSteps.find((f) => f.id === step.id);
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 relative z-10 transition-all duration-300",
                    isFiltered && "opacity-20 pointer-events-none",
                  )}
                  style={{ width: undefined }}
                >
                  {/* Circle indicator */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0 border-2",
                      step.status === "concluido" && "bg-success text-success-foreground border-success shadow-[0_0_12px_hsl(var(--success)/0.3)]",
                      step.status === "em_andamento" && "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)] animate-pulse",
                      step.status === "pendente" && "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {statusIcons[step.status]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 sm:flex-none sm:text-center space-y-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground">{step.responsavel}</p>
                    <p className="text-[10px] text-muted-foreground">{step.lote}</p>
                    <ProgressBar value={step.progress} size="sm" variant={step.status === "concluido" ? "success" : step.status === "em_andamento" ? "primary" : "accent"} className="w-20 mx-auto sm:mx-auto" />
                    <p className="text-[10px] font-semibold text-foreground">{step.progress}%</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex sm:flex-row gap-0.5 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Voltar" onClick={() => rewindStep(step.id)}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary" title="Avançar" onClick={() => advanceStep(step.id)}>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-accent-foreground" title="Resetar" onClick={() => resetStep(step.id)}>
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDialog({ open: true, editing: step })}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteTarget({ id: step.id, name: step.label })}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Steps Detail List */}
      <div className="bg-card rounded-2xl p-5 card-shadow">
        <h3 className="text-base font-semibold text-foreground mb-4">Detalhe das Etapas</h3>
        <div className="space-y-2">
          {filteredSteps.map((step, idx) => (
            <div key={step.id} className={cn(
              "flex items-center gap-4 p-3 rounded-xl transition-colors",
              step.status === "concluido" && "bg-success/5 border border-success/15",
              step.status === "em_andamento" && "bg-primary/5 border border-primary/15",
              step.status === "pendente" && "bg-muted/50",
            )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                step.status === "concluido" && "bg-success/15 text-success",
                step.status === "em_andamento" && "bg-primary/15 text-primary",
                step.status === "pendente" && "bg-muted text-muted-foreground",
              )}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{step.label}</p>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    step.status === "concluido" && "bg-success/10 text-success",
                    step.status === "em_andamento" && "bg-primary/10 text-primary",
                    step.status === "pendente" && "bg-muted text-muted-foreground",
                  )}>
                    {statusLabel[step.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{step.responsavel} • {step.lote}</p>
              </div>
              <div className="w-24 shrink-0">
                <ProgressBar value={step.progress} size="sm" variant={step.status === "concluido" ? "success" : "primary"} />
                <p className="text-[10px] text-muted-foreground text-right mt-0.5">{step.progress}%</p>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => rewindStep(step.id)}><ChevronLeft className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-primary" onClick={() => advanceStep(step.id)}><ArrowRight className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-accent-foreground" onClick={() => resetStep(step.id)}><RotateCcw className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
          {filteredSteps.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma etapa encontrada.</p>
          )}
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
