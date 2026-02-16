import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  size?: number;
  color?: string;
}

export function Gauge({ value, max, label, unit = "", size = 120, color }: GaugeProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const offset = circumference - percentage * circumference;

  const getColor = () => {
    if (color) return color;
    if (percentage > 0.8) return "hsl(var(--destructive))";
    if (percentage > 0.6) return "hsl(var(--accent))";
    return "hsl(var(--primary))";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{value}</span>
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center">{label}</span>
    </div>
  );
}
