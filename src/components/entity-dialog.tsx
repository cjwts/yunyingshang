"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "list" | "multiselect";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  full?: boolean;
  placeholder?: string;
}

type Values = Record<string, unknown>;

interface Props<T extends object> {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  fields: FieldDef[];
  initial: T;
  onSubmit: (value: T) => void;
  onDelete?: () => void;
}

/** 通用表单弹窗：根据字段描述渲染，提交时返回合并后的对象 */
export function EntityDialog<T extends object>({ open, onOpenChange, title, fields, initial, onSubmit, onDelete }: Props<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {open && <EntityForm fields={fields} initial={initial} onSubmit={onSubmit} onDelete={onDelete} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}

function EntityForm<T extends object>({ fields, initial, onSubmit, onDelete, onOpenChange }: Omit<Props<T>, "open" | "title">) {
  const [values, setValues] = useState<Values>(initial as Values);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: unknown) => setValues((p) => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !String(values[f.key] ?? "").trim());
    if (missing) {
      setError(`请填写「${missing.label}」`);
      return;
    }
    onSubmit({ ...(initial as Values), ...values } as T);
    onOpenChange(false);
  };

  return (
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={cn("grid gap-1.5", (f.full || f.type === "textarea") && "sm:col-span-2")}>
              <Label htmlFor={`f-${f.key}`} className="text-xs text-slate-600">
                {f.label}
                {f.required && <span className="text-red-500">*</span>}
              </Label>
              <FieldInput field={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />
            </div>
          ))}
          {error && <p className="text-xs text-red-600 sm:col-span-2">{error}</p>}
          <DialogFooter className="mt-2 sm:col-span-2 sm:justify-between">
            <div>
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm("确认删除这条记录？")) {
                      onDelete();
                      onOpenChange(false);
                    }
                  }}
                >
                  删除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </div>
          </DialogFooter>
        </form>
  );
}

function ListInput({ id, value, placeholder, onChange }: { id: string; value: unknown; placeholder?: string; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(Array.isArray(value) ? value.join("，") : "");
  return (
    <Input
      id={id}
      value={text}
      placeholder={placeholder ?? "多个用逗号分隔"}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(/[,，、]/).map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const id = `f-${field.key}`;
  switch (field.type) {
    case "textarea":
      return (
        <Textarea id={id} rows={3} value={String(value ?? "")} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      );
    case "number":
      return (
        <Input id={id} type="number" step="any" value={value === undefined ? "" : String(value)} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} />
      );
    case "date":
      return <Input id={id} type="date" value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <Select value={String(value ?? "")} onValueChange={onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "list":
      return <ListInput id={id} value={value} placeholder={field.placeholder} onChange={onChange} />;
    case "multiselect": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="flex flex-wrap gap-1.5">
          {field.options?.map((o) => {
            const on = arr.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}
                className={cn(
                  "h-7 rounded border px-2 text-xs",
                  on ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      );
    }
    default:
      return <Input id={id} value={String(value ?? "")} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />;
  }
}
