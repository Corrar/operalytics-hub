import React, { createContext, useContext, useState } from "react";

export type UserRole = "Visitante" | "Gestor Almoxarifado" | "Gestor Esteira" | "Gestor Flow" | "Gestor Lavadora" | "Gestor Elétrica";

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canEdit: (sector: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const roleToSector: Record<UserRole, string | null> = {
  "Visitante": null,
  "Gestor Almoxarifado": "almoxarifado",
  "Gestor Esteira": "esteira",
  "Gestor Flow": "flow",
  "Gestor Lavadora": "lavadora",
  "Gestor Elétrica": "eletrica",
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("Visitante");

  const canEdit = (sector: string) => roleToSector[role] === sector;

  return (
    <UserContext.Provider value={{ role, setRole, canEdit }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
