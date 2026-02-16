import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Requisicao {
  id: number;
  item: string;
  setor: string;
  status: "pendente" | "aprovada" | "entregue";
  quantidade: number;
}

const initialRequisicoes: Requisicao[] = [
  { id: 1, item: "Parafusos M6", setor: "Esteira", status: "pendente", quantidade: 200 },
  { id: 2, item: "Óleo Lubrificante", setor: "Lavadora", status: "aprovada", quantidade: 10 },
  { id: 3, item: "Fita Isolante", setor: "Elétrica", status: "entregue", quantidade: 50 },
  { id: 4, item: "Rolamentos", setor: "Esteira", status: "pendente", quantidade: 8 },
  { id: 5, item: "Detergente Industrial", setor: "Lavadora", status: "pendente", quantidade: 25 },
];

const estoqueData = [
  { item: "Parafusos M6", atual: 150, minimo: 200, critico: true },
  { item: "Óleo Lubrificante", atual: 45, minimo: 20, critico: false },
  { item: "Fita Isolante", atual: 12, minimo: 30, critico: true },
  { item: "Rolamentos", atual: 100, minimo: 50, critico: false },
  { item: "Detergente Industrial", atual: 8, minimo: 15, critico: true },
];

const statusColors: Record<string, string> = {
  pendente: "bg-accent/20 text-accent-foreground",
  aprovada: "bg-primary/10 text-primary",
  entregue: "bg-success/10 text-success",
};

export default function AlmoxarifadoPanel() {
  const { canEdit } = useUser();
  const editable = canEdit("almoxarifado");
  const [requisicoes, setRequisicoes] = useState(initialRequisicoes);
  const [checkLog, setCheckLog] = useState<string[]>([]);

  const completedCount = requisicoes.filter((r) => r.status === "entregue").length;
  const progress = Math.round((completedCount / requisicoes.length) * 100);

  const advanceStatus = (id: number) => {
    if (!editable) return;
    setRequisicoes((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status === "pendente") return { ...r, status: "aprovada" };
        if (r.status === "aprovada") return { ...r, status: "entregue" };
        return r;
      })
    );
  };

  const handleCheckIn = (item: string) => {
    if (!editable) return;
    setCheckLog((prev) => [`✅ Check-in: ${item} — ${new Date().toLocaleTimeString()}`, ...prev]);
  };

  const handleCheckOut = (item: string) => {
    if (!editable) return;
    setCheckLog((prev) => [`📦 Check-out: ${item} — ${new Date().toLocaleTimeString()}`, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Almoxarifado</h1>
          <p className="text-sm text-muted-foreground">Estoque e Requisições</p>
        </div>
        {!editable && (
          <Badge variant="outline" className="border-accent text-accent-foreground bg-accent/10">
            Somente Leitura
          </Badge>
        )}
      </div>

      <ProgressBar value={progress} showLabel size="lg" variant="primary" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requisições */}
        <div className="bg-card rounded-2xl p-5 card-shadow space-y-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" /> Requisições
          </h3>
          <div className="space-y-2">
            {requisicoes.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.item}</p>
                  <p className="text-xs text-muted-foreground">{r.setor} • Qtd: {r.quantidade}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[r.status])}>
                    {r.status}
                  </span>
                  {editable && r.status !== "entregue" && (
                    <Button size="sm" variant="ghost" onClick={() => advanceStatus(r.id)} className="h-7 w-7 p-0">
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estoque Crítico */}
        <div className="bg-card rounded-2xl p-5 card-shadow space-y-3">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-accent" /> Nível de Estoque
          </h3>
          <div className="space-y-2">
            {estoqueData.map((e) => (
              <div key={e.item} className={cn("flex items-center justify-between p-3 rounded-xl transition-colors", e.critico ? "bg-accent/5 border border-accent/20" : "bg-muted/50")}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{e.item}</p>
                  <p className="text-xs text-muted-foreground">Mín: {e.minimo} | Atual: {e.atual}</p>
                </div>
                <div className="flex items-center gap-2">
                  {e.critico && <AlertTriangle className="w-4 h-4 text-accent" />}
                  {editable && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleCheckIn(e.item)} className="h-7 w-7 p-0 text-success">
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleCheckOut(e.item)} className="h-7 w-7 p-0 text-destructive">
                        <ArrowUpFromLine className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
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
    </div>
  );
}
