import { Warehouse, Factory, Workflow, WashingMachine, Zap } from "lucide-react";
import { SectorCard } from "@/components/SectorCard";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const sectors = [
  { title: "Almoxarifado", value: "82%", subtitle: "Requisições atendidas", icon: Warehouse, progress: 82 },
  { title: "Produção Esteira", value: "78%", subtitle: "Lote atual", icon: Factory, progress: 78 },
  { title: "Produção Flow", value: "65%", subtitle: "Tarefas concluídas", icon: Workflow, progress: 65 },
  { title: "Lavadora", value: "91%", subtitle: "Ciclos completos", icon: WashingMachine, progress: 91 },
  { title: "Elétrica", value: "73%", subtitle: "Conformidade", icon: Zap, progress: 73 },
];

function DonutChart({ value }: { value: number }) {
  const data = [
    { name: "done", value },
    { name: "remaining", value: 100 - value },
  ];
  return (
    <ResponsiveContainer width={80} height={80}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={36} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
          <Cell fill="hsl(224, 76%, 48%)" />
          <Cell fill="hsl(220, 14%, 95%)" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function DashboardHome() {
  const avgProgress = Math.round(sectors.reduce((a, s) => a + s.progress, 0) / sectors.length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão consolidada de todos os setores</p>
      </div>

      {/* Summary bar */}
      <div className="bg-card rounded-2xl p-5 card-shadow flex items-center gap-6">
        <DonutChart value={avgProgress} />
        <div>
          <p className="text-sm text-muted-foreground">Progresso Geral</p>
          <p className="text-3xl font-bold text-foreground">{avgProgress}%</p>
        </div>
      </div>

      {/* Sector cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-0">
        {sectors.map((s, i) => (
          <SectorCard key={s.title} {...s} className={`delay-[${i * 50}ms]`} />
        ))}
      </div>

      {/* Per-sector donut charts */}
      <div className="bg-card rounded-2xl p-6 card-shadow">
        <h3 className="text-base font-semibold text-foreground mb-4">Progresso por Setor</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          {sectors.map((s) => (
            <div key={s.title} className="flex flex-col items-center gap-2">
              <DonutChart value={s.progress} />
              <span className="text-xs font-medium text-muted-foreground text-center">{s.title}</span>
              <span className="text-sm font-bold text-foreground">{s.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
