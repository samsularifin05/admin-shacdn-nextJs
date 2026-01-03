import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { FormInput } from "./form-input";
import { FormAsyncSelect } from "./form-async-select";
import { FormCurrency } from "./form-currency";
import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";

interface CartField {
  name: string;
  label: string;
  type: "string" | "number" | "currency" | "rupiah" | "async-select" | "gram";
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  relatedTable?: string;
  autoFill?: Record<string, string>;
  readOnly?: boolean;
}

interface FormCartProps {
  name: string;
  label: string;
  fields: CartField[];
  totalField?: string;
}

export function FormCart({ name, label, fields, totalField }: FormCartProps) {
  const { control, setValue, getValues } = useFormContext();
  const {
    fields: items,
    append,
    remove,
  } = useFieldArray({
    control,
    name,
  });

  // Watch items to calculate total if totalField is provided
  const watchItems = useWatch({
    control,
    name,
  });

  useEffect(() => {
    if (totalField && watchItems) {
      const total = (watchItems as any[]).reduce((sum, item) => {
        const subtotal = Number(item.subtotal) || 0;
        return sum + subtotal;
      }, 0);
      setValue(totalField, total);
    }
  }, [watchItems, totalField, setValue]);

  const handleAddItem = () => {
    const newItem: any = {};
    fields.forEach((f) => {
      newItem[f.name] =
        f.type === "number" ||
        f.type === "rupiah" ||
        f.type === "currency" ||
        f.type === "async-select" ||
        f.type === "gram"
          ? 0
          : "";
    });
    append(newItem);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <ShoppingCart className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Tambah Baris
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              {fields.map((f) => (
                <th key={f.name} className="py-2 px-2 text-left font-medium">
                  {f.label}
                </th>
              ))}
              <th className="py-2 px-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, index) => (
              <tr key={item.id} className="group">
                {fields.map((f) => (
                  <td key={f.name} className="py-2 px-1 align-top">
                    {f.type === "async-select" ? (
                      <FormAsyncSelect
                        name={`${name}.${index}.${f.name}`}
                        label=""
                        endpoint={f.endpoint || ""}
                        labelField={f.labelField || "name"}
                        valueField={f.valueField || "id"}
                        onObjectChange={(data) => {
                          if (data && f.autoFill) {
                            Object.entries(f.autoFill).forEach(
                              ([target, source]) => {
                                setValue(
                                  `${name}.${index}.${target}`,
                                  data[source] || 0
                                );
                              }
                            );

                            // Trigger subtotal calculation if needed
                            const harga =
                              data.harga ||
                              getValues(`${name}.${index}.harga`) ||
                              0;
                            const qty = getValues(`${name}.${index}.qty`) || 1;
                            if (getValues(`${name}.${index}.qty`) === 0)
                              setValue(`${name}.${index}.qty`, 1);
                            setValue(
                              `${name}.${index}.subtotal`,
                              harga * (qty || 1)
                            );
                          }
                        }}
                      />
                    ) : f.type === "rupiah" || f.type === "currency" ? (
                      <FormCurrency
                        name={`${name}.${index}.${f.name}`}
                        label=""
                        readOnly={f.readOnly}
                        onChange={(val) => {
                          // Example: if price change, redo subtotal
                          const qty = getValues(`${name}.${index}.qty`) || 0;
                          setValue(`${name}.${index}.subtotal`, val * qty);
                        }}
                      />
                    ) : (
                      <FormInput
                        name={`${name}.${index}.${f.name}`}
                        label=""
                        type={
                          f.type === "number" || f.type === "gram"
                            ? "number"
                            : "text"
                        }
                        readOnly={f.readOnly}
                        onChange={(e) => {
                          if (f.name === "qty") {
                            const qty = Number(e.target.value) || 0;
                            const harga =
                              getValues(`${name}.${index}.harga`) || 0;
                            setValue(`${name}.${index}.subtotal`, qty * harga);
                          }
                        }}
                      />
                    )}
                  </td>
                ))}
                <td className="py-2 px-1 align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          Belum ada item ditambahkan
        </div>
      )}

      {totalField && (
        <div className="flex justify-end p-2 border-t font-bold text-lg bg-muted/50 rounded-b-lg">
          <div className="flex gap-4">
            <span>TOTAL:</span>
            <span className="text-primary">
              {formatRupiah(getValues(totalField) || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
