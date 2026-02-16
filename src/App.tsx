import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import DashboardHome from "@/pages/DashboardHome";
import AlmoxarifadoPanel from "@/pages/AlmoxarifadoPanel";
import EsteiraPanel from "@/pages/EsteiraPanel";
import FlowPanel from "@/pages/FlowPanel";
import LavadoraPanel from "@/pages/LavadoraPanel";
import EletricaPanel from "@/pages/EletricaPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/almoxarifado" element={<AlmoxarifadoPanel />} />
              <Route path="/esteira" element={<EsteiraPanel />} />
              <Route path="/flow" element={<FlowPanel />} />
              <Route path="/lavadora" element={<LavadoraPanel />} />
              <Route path="/eletrica" element={<EletricaPanel />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
