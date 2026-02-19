import { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { CrudDialog, DeleteDialog, type FieldConfig } from "@/components/CrudDialog";

interface PedidoItem {
  nome: string;
  qtdSolicitada: number;
  qtdReservada: number;
  valorUnitario: number;
}

interface Pedido {
  id: number;
  codigo: string;
  cliente: string;
  items: PedidoItem[];
}

let nextId = 4;

const pedidoFields: FieldConfig[] = [
  { name: "codigo", label: "Código do Pedido", type: "text", required: true },
  { name: "cliente", label: "Cliente / Setor", type: "text", required: true },
  { name: "item1_nome", label: "Item 1 - Nome", type: "text", required: true },
  { name: "item1_qtdSolicitada", label: "Item 1 - Qtd Solicitada", type: "number", required: true },
  { name: "item1_qtdReservada", label: "Item 1 - Qtd Reservada", type: "number" },
  { name: "item1_valorUnitario", label: "Item 1 - Valor Unitário (R$)", type: "number", required: true },
];

function parsePedidoData(data: Record<string, string | number>, existing?: Pedido): Pedido {
  const items: PedidoItem[] = existing?.items ? [...existing.items] : [];
  // Always update first item from form
  items[0] = {
    nome: String(data.item1_nome || ""),
    qtdSolicitada: Number(data.item1_qtdSolicitada) || 0,
    qtdReservada: Number(data.item1_qtdReservada) || 0,
    valorUnitario: Number(data.item1_valorUnitario) || 0,
  };
  return {
    id: existing?.id || nextId++,
    codigo: String(data.codigo),
    cliente: String(data.cliente),
    items,
  };
}

function pedidoToFormData(p: Pedido): Record<string, string | number> {
  return {
    codigo: p.codigo,
    cliente: p.cliente,
    item1_nome: p.items[0]?.nome || "",
    item1_qtdSolicitada: p.items[0]?.qtdSolicitada || 0,
    item1_qtdReservada: p.items[0]?.qtdReservada || 0,
    item1_valorUnitario: p.items[0]?.valorUnitario || 0,
  };
}

export default function AlmoxarifadoPanel() {
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: 1, codigo: "PED-001", cliente: "Esteira",
      items: [
        { nome: "Parafusos M6", qtdSolicitada: 200, qtdReservada: 150, valorUnitario: 0.50 },
        { nome: "Rolamentos", qtdSolicitada: 8, qtdReservada: 8, valorUnitario: 45.00 },
      ],
    },
    {
      id: 2, codigo: "PED-002", cliente: "Lavadora",
      items: [
        { nome: "Óleo Lubrificante", qtdSolicitada: 10, qtdReservada: 10, valorUnitario: 32.00 },
        { nome: "Detergente Industrial", qtdSolicitada: 25, qtdReservada: 12, valorUnitario: 18.50 },
      ],
    },
    {
      id: 3, codigo: "PED-003", cliente: "Elétrica",
      items: [
        { nome: "Fita Isolante", qtdSolicitada: 50, qtdReservada: 50, valorUnitario: 8.90 },
        { nome: "Disjuntores 20A", qtdSolicitada: 10, qtdReservada: 3, valorUnitario: 25.00 },
      ],
    },
  ]);

  const [dialog, setDialog] = useState<{ open: boolean; editing?: Pedido }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const handleSubmit = (data: Record<string, string | number>) => {
    if (dialog.editing) {
      setPedidos((prev) => prev.map((p) => p.id === dialog.editing!.id ? parsePedidoData(data, dialog.editing) : p));
    } else {
      setPedidos((prev) => [...prev, parsePedidoData(data)]);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setPedidos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
  };

  // Global stats
  const totalSolicitado = pedidos.reduce((s, p) => s + p.items.reduce((a, i) => a + i.qtdSolicitada * i.valorUnitario, 0), 0);
  const totalSeparado = pedidos.reduce((s, p) => s + p.items.reduce((a, i) => a + i.qtdReservada * i.valorUnitario, 0), 0);
  const globalProgress = totalSolicitado > 0 ? Math.round((totalSeparado / totalSolicitado) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Almoxarifado</h1>
          <p className="text-sm text-muted-foreground">Separações de Pedidos</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setDialog({ open: true })}>
          <Plus className="w-3.5 h-3.5" /> Novo Pedido
        </Button>
      </div>

      {/* Summary bar */}
      <div className="bg-card rounded-2xl p-5 card-shadow space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso Geral de Separação</span>
          <div className="flex gap-4 text-xs">
            <span className="text-muted-foreground">Total Pedido: <strong className="text-foreground">R$ {totalSolicitado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
            <span className="text-muted-foreground">Total Separado: <strong className="text-success">R$ {totalSeparado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
          </div>
        </div>
        <ProgressBar value={globalProgress} showLabel size="lg" variant={globalProgress === 100 ? "success" : "primary"} />
      </div>

      {/* Pedidos */}
      <div className="space-y-4">
        {pedidos.map((pedido) => {
          const valorPedido = pedido.items.reduce((a, i) => a + i.qtdSolicitada * i.valorUnitario, 0);
          const valorSeparado = pedido.items.reduce((a, i) => a + i.qtdReservada * i.valorUnitario, 0);
          const totalQtdSol = pedido.items.reduce((a, i) => a + i.qtdSolicitada, 0);
          const totalQtdRes = pedido.items.reduce((a, i) => a + i.qtdReservada, 0);
          const progress = totalQtdSol > 0 ? Math.round((totalQtdRes / totalQtdSol) * 100) : 0;

          return (
            <div key={pedido.id} className="bg-card rounded-2xl p-5 card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{pedido.codigo}</h3>
                    <p className="text-xs text-muted-foreground">{pedido.cliente}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDialog({ open: true, editing: pedido })}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteTarget({ id: pedido.id, name: pedido.codigo })}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <ProgressBar value={progress} showLabel size="md" variant={progress === 100 ? "success" : progress >= 50 ? "primary" : "warning"} />

              {/* Items table */}
              <div className="rounded-xl overflow-hidden border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground">
                      <th className="text-left py-2 px-3 font-medium">Item</th>
                      <th className="text-right py-2 px-3 font-medium">Solicitada</th>
                      <th className="text-right py-2 px-3 font-medium">Reservada</th>
                      <th className="text-right py-2 px-3 font-medium">Valor Unit.</th>
                      <th className="text-right py-2 px-3 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-border/50">
                        <td className="py-2 px-3 text-foreground font-medium">{item.nome}</td>
                        <td className="py-2 px-3 text-right text-foreground">{item.qtdSolicitada}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={item.qtdReservada >= item.qtdSolicitada ? "text-success" : "text-accent-foreground"}>
                            {item.qtdReservada}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-muted-foreground">R$ {item.valorUnitario.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-foreground">R$ {(item.qtdReservada * item.valorUnitario).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals row */}
              <div className="flex justify-between text-xs px-1">
                <span className="text-muted-foreground">Valor Total: <strong className="text-foreground">R$ {valorPedido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
                <span className="text-muted-foreground">Valor Separado: <strong className={valorSeparado >= valorPedido ? "text-success" : "text-primary"}>R$ {valorSeparado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <CrudDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        onSubmit={handleSubmit}
        title={dialog.editing ? "Editar Pedido" : "Novo Pedido"}
        fields={pedidoFields}
        initialData={dialog.editing ? pedidoToFormData(dialog.editing) : undefined}
        submitLabel={dialog.editing ? "Atualizar" : "Criar"}
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
