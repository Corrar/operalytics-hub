import { ChevronDown, User } from "lucide-react";

export function AppHeader() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <h2 className="text-lg font-semibold text-foreground ml-12 md:ml-0">Gestão Operacional</h2>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium">
        <User className="w-4 h-4 text-primary" />
        <span>Administrador</span>
      </div>
    </header>
  );
}
