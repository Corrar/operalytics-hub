import { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Check, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, DeleteDialog, type FieldConfig } from "@/components/CrudDialog";

interface Requisicao {
  id: number;
  item: string;
  setor: string;
  status: "pendente" | "aprovada" | "entregue";
  quantidade: number;
}

interface EstoqueItem {
  id: number;
  item: string;
  atual: number;
  minimo: number;
}

let nextReqId = 6;
let nextEstId = 6;

const reqFields: FieldConfig[] = [
  { name: "item", label: "Item", type: "text", required: true },
  { name: "setor", label: "Setor", type: "select", options: [
    { value: "Esteira", label: "Esteira" },
    { value: "Lavadora", label: "Lavadora" },
    { value: "Elétrica", label: "Elétrica" },
    { value: "Flow", label: "Flow" },
  ]},
  { name: "quantidade", label: "Quantidade", type: "number", required: true },
  { name: "status", label: "Status", type: "select", options: [
    { value: "pendente", label: "Pendente" },
    { value: "aprovada", label: "Aprovada" },
    { value: "entregue", label: "Entregue" },
  ]},
];

const estFields: FieldConfig[] = [
  { name: "item", label: "Item", type: "text", required: true },
  { name: "atual", label: "Quantidade Atual", type: "number", required: true },
  { name: "minimo", label: "Quantidade Mínima", type: "number", required: true },
];

const statusColors: Record<string, string> = {
  pendente: "bg-accent/20 text-accent-foreground",
  aprovada: "bg-primary/10 text-primary",
  entregue: "bg-success/10 text-success",
};

export default function AlmoxarifadoPanel() {
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([
    { id: 1, item: "Parafusos M6", setor: "Esteira", status: "pendente", quantidade: 200 },
    { id: 2, item: "Óleo Lubrificante", setor: "Lavadora", status: "aprovada", quantidade: 10 },
    { id: 3, item: "Fita Isolante", setor: "Elétrica", status: "entregue", quantidade: 50 },
    { id: 4, item: "Rolamentos", setor: "Esteira", status: "pendente", quantidade: 8 },
    { id: 5, item: "Detergente Industrial", setor: "Lavadora", status: "pendente", quantidade: 25 },
  ]);
  const [estoque, setEstoque] = useState<EstoqueItem[]>([
    { id: 1, item: "Parafusos M6", atual: 150, minimo: 200 },
    { id: 2, item: "Óleo Lubrificante", atual: 45, minimo: 20 },
    { id: 3, item: "Fita Isolante", atual: 12, minimo: 30 },
    { id: 4, item: "Rolamentos", atual: 100, minimo: 50 },
    { id: 5, item: "Detergente Industrial", atual: 8, minimo: 15 },
  ]);
  const [checkLog, setCheckLog] = useState<string[]>([]);

  // Dialog state
  const [reqDialog, setReqDialog] = useState<{ open: boolean; editing?: Requisicao }>({ open: false });
  const [estDialog, setEstDialog] = useState<{ open: boolean; editing?: EstoqueItem }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "req" | "est"; id: number; name: string } | null>(null);

  const completedCount = requisicoes.filter((r) => r.status === "entregue").length;
  const progress = requisicoes.length ? Math.round((completedCount / requisicoes.length) * 100) : 0;

  const advanceStatus = (id: number) => {
    setRequisicoes((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status === "pendente") return { ...r, status: "aprovada" };
        if (r.status === "aprovada") return { ...r, status: "entregue" };
        return r;
      })
    );
  };

  const handleReqSubmit = (data: Record<string, string | number>) => {
    if (reqDialog.editing) {
      setRequisicoes((prev) => prev.map((r) => r.id === reqDialog.editing!.id ? { ...r, ...data } as Requisicao : r));
    } else {
      setRequisicoes((prev) => [...prev, { id: nextReqId++, status: "pendente", ...data } as Requisicao]);
    }
  };

  const handleEstSubmit = (data: Record<string, string | number>) => {
    if (estDialog.editing) {
      setEstoque((prev) => prev.map((e) => e.id === estDialog.editing!.id ? { ...e, ...data } as EstoqueItem : e));
    } else {
      setEstoque((prev) => [...prev, { id: nextEstId++, ...data } as EstoqueItem]);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "req") setRequisicoes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    else setEstoque((prev) => prev.filter((e) => e.id !== deleteTarget.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Almoxarifado</h1>
          <p className="text-sm text-muted-foreground">Estoque e Requisições</p>
        </div>
      </div>

      <ProgressBar value={progress} showLabel size="lg" variant="primary" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requisições */}
        <div className="bg-card rounded-2xl p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Requisições
            </h3>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setReqDialog({ open: true })}>
              <Plus className="w-3.5 h-3.5" /> Nova
            </Button>
          </div>
          <div className="space-y-2">
            {requisicoes.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.item}</p>
                  <p className="text-xs text-muted-foreground">{r.setor} • Qtd: {r.quantidade}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[r.status])}>
                    {r.status}
                  </span>
                  {r.status !== "entregue" && (
                    <Button size="sm" variant="ghost" onClick={() => advanceStatus(r.id)} className="h-7 w-7 p-0">
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setReqDialog({ open: true, editing: r })} className="h-7 w-7 p-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget({ type: "req", id: r.id, name: r.item })} className="h-7 w-7 p-0 text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estoque */}
        <div className="bg-card rounded-2xl p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-accent" /> Nível de Estoque
            </h3>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEstDialog({ open: true })}>
              <Plus className="w-3.5 h-3.5" /> Novo
            </Button>
          </div>
          <div className="space-y-2">
            {estoque.map((e) => {
              const critico = e.atual < e.minimo;
              return (
                <div key={e.id} className={cn("flex items-center justify-between p-3 rounded-xl transition-colors", critico ? "bg-accent/5 border border-accent/20" : "bg-muted/50")}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{e.item}</p>
                    <p className="text-xs text-muted-foreground">Mín: {e.minimo} | Atual: {e.atual}</p>
                    <ProgressBar value={Math.min((e.atual / e.minimo) * 100, 100)} size="sm" variant={critico ? "warning" : "success"} className="mt-1" />
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    {critico && <AlertTriangle className="w-4 h-4 text-accent" />}
                    <Button size="sm" variant="ghost" onClick={() => { setEstoque(prev => prev.map(x => x.id === e.id ? {...x, atual: x.atual + 10} : x)); setCheckLog(prev => [`✅ Check-in: ${e.item} (+10) — ${new Date().toLocaleTimeString()}`, ...prev]); }} className="h-7 w-7 p-0 text-success">
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEstoque(prev => prev.map(x => x.id === e.id ? {...x, atual: Math.max(x.atual - 10, 0)} : x)); setCheckLog(prev => [`📦 Check-out: ${e.item} (-10) — ${new Date().toLocaleTimeString()}`, ...prev]); }} className="h-7 w-7 p-0 text-destructive">
                      <ArrowUpFromLine className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEstDialog({ open: true, editing: e })} className="h-7 w-7 p-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteTarget({ type: "est", id: e.id, name: e.item })} className="h-7 w-7 p-0 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Check Log */}
      {checkLog.length > 0 && (
        <div className="bg-card rounded-2xl p-5 card-shadow">
          <h3 className="text-base font-semibold text-foreground mb-3">Registro de Movimentações</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {checkLog.map((log, i) => (
              <p key={i} className="text-xs text-muted-foreground font-mono">{log}</p>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CrudDialog
        open={reqDialog.open}
        onClose={() => setReqDialog({ open: false })}
        onSubmit={handleReqSubmit}
        title={reqDialog.editing ? "Editar Requisição" : "Nova Requisição"}
        fields={reqFields}
        initialData={reqDialog.editing as any}
        submitLabel={reqDialog.editing ? "Atualizar" : "Criar"}
      />
      <CrudDialog
        open={estDialog.open}
        onClose={() => setEstDialog({ open: false })}
        onSubmit={handleEstSubmit}
        title={estDialog.editing ? "Editar Item de Estoque" : "Novo Item de Estoque"}
        fields={estFields}
        initialData={estDialog.editing as any}
        submitLabel={estDialog.editing ? "Atualizar" : "Criar"}
      />
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
}
