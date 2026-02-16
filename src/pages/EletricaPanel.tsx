import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckItem {
  id: string;
  label: string;
  checked: boolean;
}

interface CheckSection {
  id: string;
  title: string;
  items: CheckItem[];
}

const initialSections: CheckSection[] = [
  {
    id: "s1",
    title: "Fiação e Cabos",
    items: [
      { id: "1", label: "Verificar isolamento dos cabos principais", checked: true },
      { id: "2", label: "Testar continuidade de fios", checked: true },
      { id: "3", label: "Inspecionar emendas e conexões", checked: false },
      { id: "4", label: "Verificar aterramento geral", checked: false },
    ],
  },
  {
    id: "s2",
    title: "Painéis Elétricos",
    items: [
      { id: "5", label: "Verificar disjuntores", checked: true },
      { id: "6", label: "Testar relés de proteção", checked: false },
      { id: "7", label: "Limpar contatos do painel", checked: false },
    ],
  },
  {
    id: "s3",
    title: "Motores e Acionamentos",
    items: [
      { id: "8", label: "Medir corrente nominal dos motores", checked: true },
      { id: "9", label: "Verificar vibração nos mancais", checked: true },
      { id: "10", label: "Testar inversores de frequência", checked: false },
      { id: "11", label: "Inspecionar sistema de ventilação", checked: false },
      { id: "12", label: "Verificar acoplamentos", checked: false },
    ],
  },
  {
    id: "s4",
    title: "Iluminação e Emergência",
    items: [
      { id: "13", label: "Testar iluminação de emergência", checked: true },
      { id: "14", label: "Verificar baterias de backup", checked: false },
      { id: "15", label: "Inspecionar luminárias industriais", checked: false },
    ],
  },
];

export default function EletricaPanel() {
  const { canEdit } = useUser();
  const editable = canEdit("eletrica");
  const [sections, setSections] = useState(initialSections);

  const allItems = sections.flatMap((s) => s.items);
  const checkedCount = allItems.filter((i) => i.checked).length;
  const totalProgress = Math.round((checkedCount / allItems.length) * 100);

  const toggleItem = (sectionId: string, itemId: string) => {
    if (!editable) return;
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((i) =>
                i.id === itemId ? { ...i, checked: !i.checked } : i
              ),
            }
          : s
      )
    );
  };

  const getSectionProgress = (section: CheckSection) => {
    const checked = section.items.filter((i) => i.checked).length;
    return Math.round((checked / section.items.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Elétrica</h1>
          <p className="text-sm text-muted-foreground">Checklists Técnicos</p>
        </div>
        {!editable && (
          <Badge variant="outline" className="border-accent text-accent-foreground bg-accent/10">
            Somente Leitura
          </Badge>
        )}
      </div>

      <div className="bg-card rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Conformidade Elétrica</p>
            <p className="text-2xl font-bold text-foreground">{totalProgress}%</p>
          </div>
        </div>
        <ProgressBar
          value={totalProgress}
          size="lg"
          variant={totalProgress >= 80 ? "success" : totalProgress >= 50 ? "warning" : "primary"}
        />
      </div>

      <div className="bg-card rounded-2xl p-5 card-shadow">
        <Accordion type="multiple" defaultValue={sections.map((s) => s.id)} className="space-y-2">
          {sections.map((section) => {
            const sProgress = getSectionProgress(section);
            return (
              <AccordionItem key={section.id} value={section.id} className="border rounded-xl px-4 bg-muted/20">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 flex-1 mr-3">
                    <span className="text-sm font-semibold text-foreground">{section.title}</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium",
                      sProgress === 100 ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                    )}>
                      {sProgress}%
                    </span>
                    {sProgress === 100 && <CheckCircle2 className="w-4 h-4 text-success ml-auto" />}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <label
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer",
                          item.checked ? "bg-success/5" : "hover:bg-muted/50",
                          !editable && "cursor-default"
                        )}
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(section.id, item.id)}
                          disabled={!editable}
                        />
                        <span className={cn(
                          "text-sm",
                          item.checked ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
