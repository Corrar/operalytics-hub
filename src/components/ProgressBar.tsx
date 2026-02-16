import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "accent";
}

const variantClasses = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-accent",
  accent: "bg-accent",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({ value, className, showLabel = false, size = "md", variant = "primary" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">Progresso</span>
          <span className="text-xs font-semibold text-foreground">{clamped}%</span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", variantClasses[variant])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
