import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "password" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[]; // for select
};

export type GenericFormModalProps = {
  title?: string;
  description?: string;
  trigger?: React.ReactNode; // element that opens the dialog
  fields: Field[];
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
  submitLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const   AddUserModal: React.FC<GenericFormModalProps> = ({
  title = "Add",
  description,
  trigger,
  fields,
  initialValues = {},
  onSubmit,
  submitLabel = "Save",
  open,
  onOpenChange,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const base: Record<string, string> = {};
    fields.forEach((f) => {
      base[f.name] = initialValues[f.name] ?? "";
    });
    setValues(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, JSON.stringify(initialValues)]);

  const handleChange = (name: string, v: string) => {
    setValues((s) => ({ ...s, [name]: v }));
  };

  const handleSubmit = async () => {
    setError(null);
    // basic required validation
    for (const f of fields) {
      if (f.required && !values[f.name]) {
        setError(`${f.label} is required`);
        return;
      }
    }

    try {
      setLoading(true);
      await onSubmit(values);
      // close handled by parent via onOpenChange if provided
      onOpenChange?.(false);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open === undefined && (
        trigger ? (
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button variant="default">{title}</Button>
          </DialogTrigger>
        )
      )}

      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {fields.map((f) => (
            <div key={f.name} className="grid grid-cols-1 gap-1">
              <Label htmlFor={f.name}>{f.label}</Label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  className="min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm"
                />
              ) : f.type === "select" ? (
                <Select value={values[f.name] ?? ""} onValueChange={(v) => handleChange(f.name, v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={f.placeholder || "Select an option"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{f.label}</SelectLabel>
                      {f.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={f.name}
                  type={
                    (f.type ??
                      "text") as React.InputHTMLAttributes<HTMLInputElement>["type"]
                  }
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : submitLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;