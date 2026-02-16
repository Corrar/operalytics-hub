import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface CrudDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string | number>) => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, string | number>;
  submitLabel?: string;
}

export function CrudDialog({ open, onClose, onSubmit, title, fields, initialData, submitLabel = "Salvar" }: CrudDialogProps) {
  const [formData, setFormData] = useState<Record<string, string | number>>({});

  useEffect(() => {
    if (open) {
      setFormData(initialData || {});
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Preencha os campos abaixo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "select" ? (
                <Select
                  value={String(formData[field.name] || "")}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, [field.name]: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  value={formData[field.name] ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value,
                    }))
                  }
                  required={field.required}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

export function DeleteDialog({ open, onClose, onConfirm, itemName }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir item</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong>{itemName}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }}>Excluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
