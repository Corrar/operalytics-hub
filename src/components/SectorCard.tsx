import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectorCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  progress: number;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function SectorCard({ title, value, subtitle, icon: Icon, progress, className }: SectorCardProps) {
  return (
    <div className={cn("bg-card rounded-2xl p-5 card-shadow hover:card-shadow-hover transition-shadow duration-300 animate-fade-up", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">{progress}% concluído</p>
    </div>
  );
}
