import { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, CheckCircle2, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CrudDialog, DeleteDialog, type FieldConfig } from "@/components/CrudDialog";

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

let nextSectionId = 5;
let nextItemId = 16;

const sectionFields: FieldConfig[] = [
  { name: "title", label: "Nome da Seção", type: "text", required: true },
];

const itemFields: FieldConfig[] = [
  { name: "label", label: "Descrição do Item", type: "text", required: true },
];

export default function EletricaPanel() {
  const [sections, setSections] = useState<CheckSection[]>([
    {
      id: "s1", title: "Fiação e Cabos",
      items: [
        { id: "1", label: "Verificar isolamento dos cabos principais", checked: true },
        { id: "2", label: "Testar continuidade de fios", checked: true },
        { id: "3", label: "Inspecionar emendas e conexões", checked: false },
        { id: "4", label: "Verificar aterramento geral", checked: false },
      ],
    },
    {
      id: "s2", title: "Painéis Elétricos",
      items: [
        { id: "5", label: "Verificar disjuntores", checked: true },
        { id: "6", label: "Testar relés de proteção", checked: false },
        { id: "7", label: "Limpar contatos do painel", checked: false },
      ],
    },
    {
      id: "s3", title: "Motores e Acionamentos",
      items: [
        { id: "8", label: "Medir corrente nominal dos motores", checked: true },
        { id: "9", label: "Verificar vibração nos mancais", checked: true },
        { id: "10", label: "Testar inversores de frequência", checked: false },
        { id: "11", label: "Inspecionar sistema de ventilação", checked: false },
        { id: "12", label: "Verificar acoplamentos", checked: false },
      ],
    },
    {
      id: "s4", title: "Iluminação e Emergência",
      items: [
        { id: "13", label: "Testar iluminação de emergência", checked: true },
        { id: "14", label: "Verificar baterias de backup", checked: false },
        { id: "15", label: "Inspecionar luminárias industriais", checked: false },
      ],
    },
  ]);

  const [sectionDialog, setSectionDialog] = useState<{ open: boolean; editing?: CheckSection }>({ open: false });
  const [itemDialog, setItemDialog] = useState<{ open: boolean; sectionId: string; editing?: CheckItem }>({ open: false, sectionId: "" });
  const [deleteTarget, setDeleteTarget] = useState<{ type: "section" | "item"; sectionId: string; itemId?: string; name: string } | null>(null);

  const allItems = sections.flatMap((s) => s.items);
  const checkedCount = allItems.filter((i) => i.checked).length;
  const totalProgress = allItems.length ? Math.round((checkedCount / allItems.length) * 100) : 0;

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => i.id === itemId ? { ...i, checked: !i.checked } : i) }
          : s
      )
    );
  };

  const getSectionProgress = (section: CheckSection) => {
    const checked = section.items.filter((i) => i.checked).length;
    return section.items.length ? Math.round((checked / section.items.length) * 100) : 0;
  };

  const handleSectionSubmit = (data: Record<string, string | number>) => {
    if (sectionDialog.editing) {
      setSections((prev) => prev.map((s) => s.id === sectionDialog.editing!.id ? { ...s, title: String(data.title) } : s));
    } else {
      setSections((prev) => [...prev, { id: `s${nextSectionId++}`, title: String(data.title), items: [] }]);
    }
  };

  const handleItemSubmit = (data: Record<string, string | number>) => {
    const sid = itemDialog.sectionId;
    if (itemDialog.editing) {
      setSections((prev) => prev.map((s) => s.id === sid ? { ...s, items: s.items.map((i) => i.id === itemDialog.editing!.id ? { ...i, label: String(data.label) } : i) } : s));
    } else {
      setSections((prev) => prev.map((s) => s.id === sid ? { ...s, items: [...s.items, { id: String(nextItemId++), label: String(data.label), checked: false }] } : s));
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "section") {
      setSections((prev) => prev.filter((s) => s.id !== deleteTarget.sectionId));
    } else {
      setSections((prev) => prev.map((s) => s.id === deleteTarget.sectionId ? { ...s, items: s.items.filter((i) => i.id !== deleteTarget.itemId) } : s));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Elétrica</h1>
          <p className="text-sm text-muted-foreground">Checklists Técnicos</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setSectionDialog({ open: true })}>
          <Plus className="w-3.5 h-3.5" /> Nova Seção
        </Button>
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
                    {sProgress === 100 && <CheckCircle2 className="w-4 h-4 text-success" />}
                    <div className="ml-auto flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setItemDialog({ open: true, sectionId: section.id })}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setSectionDialog({ open: true, editing: section })}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => setDeleteTarget({ type: "section", sectionId: section.id, name: section.title })}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item.id} className={cn("flex items-center gap-3 p-2.5 rounded-lg transition-colors", item.checked ? "bg-success/5" : "hover:bg-muted/50")}>
                        <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(section.id, item.id)} />
                        <span className={cn("text-sm flex-1", item.checked ? "text-muted-foreground line-through" : "text-foreground")}>
                          {item.label}
                        </span>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setItemDialog({ open: true, sectionId: section.id, editing: item })}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => setDeleteTarget({ type: "item", sectionId: section.id, itemId: item.id, name: item.label })}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {section.items.length === 0 && (
                      <p className="text-xs text-muted-foreground italic py-2">Nenhum item. Clique em + para adicionar.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      <CrudDialog open={sectionDialog.open} onClose={() => setSectionDialog({ open: false })} onSubmit={handleSectionSubmit} title={sectionDialog.editing ? "Editar Seção" : "Nova Seção"} fields={sectionFields} initialData={sectionDialog.editing as any} submitLabel={sectionDialog.editing ? "Atualizar" : "Criar"} />
      <CrudDialog open={itemDialog.open} onClose={() => setItemDialog({ open: false, sectionId: "" })} onSubmit={handleItemSubmit} title={itemDialog.editing ? "Editar Item" : "Novo Item"} fields={itemFields} initialData={itemDialog.editing as any} submitLabel={itemDialog.editing ? "Atualizar" : "Criar"} />
      <DeleteDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.name || ""} />
    </div>
  );
}
