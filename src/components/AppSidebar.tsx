import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Warehouse,
  Factory,
  Workflow,
  WashingMachine,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Almoxarifado", path: "/almoxarifado", icon: Warehouse },
  { title: "Esteira", path: "/esteira", icon: Factory },
  { title: "Flow", path: "/flow", icon: Workflow },
  { title: "Lavadora", path: "/lavadora", icon: WashingMachine },
  { title: "Elétrica", path: "/eletrica", icon: Zap },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-primary text-primary-foreground transition-all duration-300 z-30",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-sidebar-border", collapsed && "justify-center")}>
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="font-bold text-accent-foreground text-sm">GO</span>
        </div>
        {!collapsed && <span className="font-semibold text-lg tracking-tight">GestãoOps</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
