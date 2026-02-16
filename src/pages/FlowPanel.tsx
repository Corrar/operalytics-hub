import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KanbanCard {
  id: number;
  title: string;
  priority: "alta" | "media" | "baixa";
  progress: number;
  assignee: string;
}

type Column = "todo" | "doing" | "done";

const priorityColors: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive border-destructive/20",
  media: "bg-accent/15 text-accent-foreground border-accent/30",
  baixa: "bg-primary/10 text-primary border-primary/20",
};

const initialCards: Record<Column, KanbanCard[]> = {
  todo: [
    { id: 1, title: "Preparar moldes Linha A", priority: "alta", progress: 0, assignee: "Carlos" },
    { id: 2, title: "Revisar especificações", priority: "media", progress: 10, assignee: "Ana" },
  ],
  doing: [
    { id: 3, title: "Montagem do lote #42", priority: "alta", progress: 60, assignee: "Pedro" },
    { id: 4, title: "Teste de qualidade", priority: "baixa", progress: 35, assignee: "Maria" },
  ],
  done: [
    { id: 5, title: "Calibração maquinário", priority: "media", progress: 100, assignee: "João" },
  ],
};

const columnMeta: Record<Column, { label: string; color: string }> = {
  todo: { label: "A Fazer", color: "bg-muted-foreground" },
  doing: { label: "Em Progresso", color: "bg-primary" },
  done: { label: "Concluído", color: "bg-success" },
};

export default function FlowPanel() {
  const { canEdit } = useUser();
  const editable = canEdit("flow");
  const [cards, setCards] = useState(initialCards);
  const [dragging, setDragging] = useState<{ card: KanbanCard; from: Column } | null>(null);

  const allCards = [...cards.todo, ...cards.doing, ...cards.done];
  const totalProgress = allCards.length ? Math.round(allCards.reduce((a, c) => a + c.progress, 0) / allCards.length) : 0;

  const moveCard = (cardId: number, from: Column, to: Column) => {
    if (!editable || from === to) return;
    const card = cards[from].find((c) => c.id === cardId);
    if (!card) return;
    const updated = { ...card };
    if (to === "done") updated.progress = 100;
    if (to === "doing" && updated.progress === 0) updated.progress = 25;
    setCards((prev) => ({
      ...prev,
      [from]: prev[from].filter((c) => c.id !== cardId),
      [to]: [...prev[to], updated],
    }));
  };

  const handleDragStart = (card: KanbanCard, from: Column) => {
    if (!editable) return;
    setDragging({ card, from });
  };

  const handleDrop = (to: Column) => {
    if (dragging) {
      moveCard(dragging.card.id, dragging.from, to);
      setDragging(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produção Flow</h1>
          <p className="text-sm text-muted-foreground">Quadro Kanban</p>
        </div>
        {!editable && (
          <Badge variant="outline" className="border-accent text-accent-foreground bg-accent/10">
            Somente Leitura
          </Badge>
        )}
      </div>

      <ProgressBar value={totalProgress} showLabel size="lg" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(columnMeta) as Column[]).map((col) => (
          <div
            key={col}
            className={cn("bg-muted/30 rounded-2xl p-4 min-h-[400px] transition-colors", dragging && "ring-2 ring-primary/20 ring-dashed")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col)}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("w-2.5 h-2.5 rounded-full", columnMeta[col].color)} />
              <h3 className="text-sm font-semibold text-foreground">{columnMeta[col].label}</h3>
              <span className="text-xs text-muted-foreground ml-auto">{cards[col].length}</span>
            </div>

            <div className="space-y-3">
              {cards[col].map((card) => (
                <div
                  key={card.id}
                  draggable={editable}
                  onDragStart={() => handleDragStart(card, col)}
                  className={cn(
                    "bg-card rounded-xl p-4 card-shadow hover:card-shadow-hover transition-all duration-200",
                    editable && "cursor-grab active:cursor-grabbing"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{card.title}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", priorityColors[card.priority])}>
                      {card.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{card.assignee}</p>
                  <ProgressBar value={card.progress} size="sm" variant={card.progress === 100 ? "success" : "primary"} />
                  <p className="text-[10px] text-muted-foreground mt-1">{card.progress}%</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
