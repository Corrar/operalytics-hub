import { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Gauge } from "@/components/Gauge";
import { Button } from "@/components/ui/button";
import { Play, RotateCw, Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, DeleteDialog, type FieldConfig } from "@/components/CrudDialog";

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

let nextCycleId = 4;
let nextLotId = 4;

const cycleFields: FieldConfig[] = [
  { name: "label", label: "Nome", type: "text", required: true },
  { name: "phase", label: "Fase", type: "select", options: [
    { value: "Lavagem", label: "Lavagem" },
    { value: "Enxágue", label: "Enxágue" },
    { value: "Centrifugação", label: "Centrifugação" },
    { value: "Secagem", label: "Secagem" },
  ]},
  { name: "progress", label: "Progresso (%)", type: "number" },
  { name: "temp", label: "Temperatura (°C)", type: "number" },
  { name: "chemical", label: "Químico (%)", type: "number" },
];

const lotFields: FieldConfig[] = [
  { name: "name", label: "Nome do Lote", type: "text", required: true },
  { name: "items", label: "Quantidade de Peças", type: "number", required: true },
];

export default function LavadoraPanel() {
  const [cycles, setCycles] = useState<WashCycle[]>([
    { id: 1, label: "Lavadora 01", phase: "Enxágue", progress: 85, temp: 72, chemical: 45 },
    { id: 2, label: "Lavadora 02", phase: "Lavagem", progress: 42, temp: 88, chemical: 78 },
    { id: 3, label: "Lavadora 03", phase: "Centrifugação", progress: 95, temp: 35, chemical: 12 },
  ]);
  const [lots, setLots] = useState<WaitingLot[]>([
    { id: 1, name: "Lote #A12", items: 45 },
    { id: 2, name: "Lote #B08", items: 30 },
    { id: 3, name: "Lote #C19", items: 60 },
  ]);
  const [cycleDialog, setCycleDialog] = useState<{ open: boolean; editing?: WashCycle }>({ open: false });
  const [lotDialog, setLotDialog] = useState<{ open: boolean; editing?: WaitingLot }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "cycle" | "lot"; id: number; name: string } | null>(null);

  const totalProgress = cycles.length ? Math.round(cycles.reduce((a, c) => a + c.progress, 0) / cycles.length) : 0;

  const advanceCycle = (id: number) => {
    setCycles((prev) => prev.map((c) => c.id === id ? { ...c, progress: Math.min(c.progress + 10, 100) } : c));
  };

  const handleCycleSubmit = (data: Record<string, string | number>) => {
    const cycle: WashCycle = {
      id: cycleDialog.editing?.id || nextCycleId++,
      label: String(data.label),
      phase: String(data.phase || "Lavagem"),
      progress: Number(data.progress) || 0,
      temp: Number(data.temp) || 0,
      chemical: Number(data.chemical) || 0,
    };
    if (cycleDialog.editing) {
      setCycles((prev) => prev.map((c) => c.id === cycleDialog.editing!.id ? cycle : c));
    } else {
      setCycles((prev) => [...prev, cycle]);
    }
  };

  const handleLotSubmit = (data: Record<string, string | number>) => {
    if (lotDialog.editing) {
      setLots((prev) => prev.map((l) => l.id === lotDialog.editing!.id ? { ...l, name: String(data.name), items: Number(data.items) } : l));
    } else {
      setLots((prev) => [...prev, { id: nextLotId++, name: String(data.name), items: Number(data.items) }]);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "cycle") setCycles((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    else setLots((prev) => prev.filter((l) => l.id !== deleteTarget.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lavadora</h1>
          <p className="text-sm text-muted-foreground">Ciclos e Monitoramento</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setCycleDialog({ open: true })}>
          <Plus className="w-3.5 h-3.5" /> Novo Ciclo
        </Button>
      </div>

      <ProgressBar value={totalProgress} showLabel size="lg" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="bg-card rounded-2xl p-5 card-shadow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{cycle.label}</h3>
              <div className="flex items-center gap-1">
                <span className="text-xs text-primary font-medium">{cycle.phase}</span>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setCycleDialog({ open: true, editing: cycle })}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => setDeleteTarget({ type: "cycle", id: cycle.id, name: cycle.label })}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <ProgressBar value={cycle.progress} showLabel variant={cycle.progress >= 90 ? "success" : "primary"} />
            <div className="flex justify-around">
              <Gauge value={cycle.temp} max={100} label="Temperatura" unit="°C" size={90} />
              <Gauge value={cycle.chemical} max={100} label="Químico" unit="%" size={90} />
            </div>
            <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => advanceCycle(cycle.id)}>
              <RotateCw className="w-3.5 h-3.5" /> Avançar Ciclo
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-5 card-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Lotes Aguardando Secagem</h3>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setLotDialog({ open: true })}>
            <Plus className="w-3.5 h-3.5" /> Novo Lote
          </Button>
        </div>
        <div className="space-y-2">
          {lots.map((lot) => (
            <div key={lot.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">{lot.name}</p>
                <p className="text-xs text-muted-foreground">{lot.items} peças</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="gap-1.5 text-primary">
                  <Play className="w-3.5 h-3.5" /> Iniciar
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setLotDialog({ open: true, editing: lot })}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteTarget({ type: "lot", id: lot.id, name: lot.name })}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CrudDialog open={cycleDialog.open} onClose={() => setCycleDialog({ open: false })} onSubmit={handleCycleSubmit} title={cycleDialog.editing ? "Editar Ciclo" : "Novo Ciclo"} fields={cycleFields} initialData={cycleDialog.editing as any} submitLabel={cycleDialog.editing ? "Atualizar" : "Criar"} />
      <CrudDialog open={lotDialog.open} onClose={() => setLotDialog({ open: false })} onSubmit={handleLotSubmit} title={lotDialog.editing ? "Editar Lote" : "Novo Lote"} fields={lotFields} initialData={lotDialog.editing as any} submitLabel={lotDialog.editing ? "Atualizar" : "Criar"} />
      <DeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.name || ""} />
    </div>
  );
}
