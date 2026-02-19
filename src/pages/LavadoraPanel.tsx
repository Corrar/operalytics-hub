import { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { CrudDialog, DeleteDialog, type FieldConfig } from "@/components/CrudDialog";

interface KanbanCard {
  id: number;
  title: string;
  priority: "alta" | "media" | "baixa";
  progress: number;
  assignee: string;
}

type Column = "aguardando" | "lavando" | "concluido";

let nextId = 7;

const cardFields: FieldConfig[] = [
  { name: "title", label: "Título", type: "text", required: true },
  { name: "assignee", label: "Responsável", type: "text", required: true },
  { name: "priority", label: "Prioridade", type: "select", options: [
    { value: "alta", label: "Alta" },
    { value: "media", label: "Média" },
    { value: "baixa", label: "Baixa" },
  ]},
  { name: "progress", label: "Progresso (%)", type: "number" },
];

const priorityColors: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-accent/15 text-accent-foreground border-accent/30",
  baixa: "bg-primary/10 text-primary border-primary/20",
};

const columnMeta: Record<Column, { label: string; color: string }> = {
  aguardando: { label: "Aguardando", color: "bg-muted-foreground" },
  lavando: { label: "Lavando", color: "bg-primary" },
  concluido: { label: "Concluído", color: "bg-success" },
};

export default function LavadoraPanel() {
  const [cards, setCards] = useState<Record<Column, KanbanCard[]>>({
    aguardando: [
      { id: 1, title: "Lote #A12 - 45 peças", priority: "alta", progress: 0, assignee: "Carlos" },
      { id: 2, title: "Lote #B08 - 30 peças", priority: "media", progress: 0, assignee: "Ana" },
    ],
    lavando: [
      { id: 3, title: "Lavadora 01 - Enxágue", priority: "alta", progress: 60, assignee: "Pedro" },
      { id: 4, title: "Lavadora 02 - Centrifugação", priority: "media", progress: 85, assignee: "Maria" },
      { id: 5, title: "Lavadora 03 - Lavagem", priority: "baixa", progress: 35, assignee: "João" },
    ],
    concluido: [
      { id: 6, title: "Lote #C19 - 60 peças", priority: "media", progress: 100, assignee: "Lucas" },
    ],
  });
  const [dragging, setDragging] = useState<{ card: KanbanCard; from: Column } | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; column: Column; editing?: KanbanCard }>({ open: false, column: "aguardando" });
  const [deleteTarget, setDeleteTarget] = useState<{ col: Column; id: number; name: string } | null>(null);

  const allCards = [...cards.aguardando, ...cards.lavando, ...cards.concluido];
  const totalProgress = allCards.length ? Math.round(allCards.reduce((a, c) => a + c.progress, 0) / allCards.length) : 0;

  const moveCard = (cardId: number, from: Column, to: Column) => {
    if (from === to) return;
    const card = cards[from].find((c) => c.id === cardId);
    if (!card) return;
    const updated = { ...card };
    if (to === "concluido") updated.progress = 100;
    if (to === "lavando" && updated.progress === 0) updated.progress = 25;
    if (to === "aguardando") updated.progress = 0;
    setCards((prev) => ({
      ...prev,
      [from]: prev[from].filter((c) => c.id !== cardId),
      [to]: [...prev[to], updated],
    }));
  };

  const handleSubmit = (data: Record<string, string | number>) => {
    const newCard: KanbanCard = {
      id: dialog.editing?.id || nextId++,
      title: String(data.title),
      assignee: String(data.assignee),
      priority: (data.priority as KanbanCard["priority"]) || "media",
      progress: Number(data.progress) || 0,
    };
    if (dialog.editing) {
      const col = (Object.keys(cards) as Column[]).find((c) => cards[c].some((k) => k.id === dialog.editing!.id))!;
      setCards((prev) => ({ ...prev, [col]: prev[col].map((c) => c.id === dialog.editing!.id ? newCard : c) }));
    } else {
      setCards((prev) => ({ ...prev, [dialog.column]: [...prev[dialog.column], newCard] }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lavadora</h1>
          <p className="text-sm text-muted-foreground">Quadro Kanban</p>
        </div>
      </div>

      <ProgressBar value={totalProgress} showLabel size="lg" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(columnMeta) as Column[]).map((col) => (
          <div
            key={col}
            className={cn("bg-muted/30 rounded-2xl p-4 min-h-[400px] transition-colors", dragging && "ring-2 ring-primary/20 ring-dashed")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragging) { moveCard(dragging.card.id, dragging.from, col); setDragging(null); } }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("w-2.5 h-2.5 rounded-full", columnMeta[col].color)} />
              <h3 className="text-sm font-semibold text-foreground">{columnMeta[col].label}</h3>
              <span className="text-xs text-muted-foreground ml-auto">{cards[col].length}</span>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDialog({ open: true, column: col })}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-3">
              {cards[col].map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => setDragging({ card, from: col })}
                  className="bg-card rounded-xl p-4 card-shadow hover:card-shadow-hover transition-all duration-200 cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-foreground flex-1">{card.title}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border ml-2 shrink-0", priorityColors[card.priority])}>
                      {card.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{card.assignee}</p>
                  <ProgressBar value={card.progress} size="sm" variant={card.progress === 100 ? "success" : "primary"} />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground">{card.progress}%</p>
                    <div className="flex gap-0.5">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setDialog({ open: true, column: col, editing: card })}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => setDeleteTarget({ col, id: card.id, name: card.title })}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CrudDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, column: "aguardando" })}
        onSubmit={handleSubmit}
        title={dialog.editing ? "Editar Card" : "Novo Card"}
        fields={cardFields}
        initialData={dialog.editing as any}
        submitLabel={dialog.editing ? "Atualizar" : "Criar"}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && setCards((prev) => ({ ...prev, [deleteTarget.col]: prev[deleteTarget.col].filter((c) => c.id !== deleteTarget.id) }))}
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
}
