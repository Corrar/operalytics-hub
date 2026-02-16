import { useUser, type UserRole } from "@/contexts/UserContext";
import { ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roles: UserRole[] = [
  "Visitante",
  "Gestor Almoxarifado",
  "Gestor Esteira",
  "Gestor Flow",
  "Gestor Lavadora",
  "Gestor Elétrica",
];

export function AppHeader() {
  const { role, setRole } = useUser();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-20">
      <h2 className="text-lg font-semibold text-foreground">Gestão Operacional</h2>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium">
          <User className="w-4 h-4 text-primary" />
          <span>{role}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-card z-50">
          {roles.map((r) => (
            <DropdownMenuItem
              key={r}
              onClick={() => setRole(r)}
              className={r === role ? "bg-primary/10 text-primary font-medium" : ""}
            >
              {r}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
