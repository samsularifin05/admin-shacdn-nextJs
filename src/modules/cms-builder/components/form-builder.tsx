"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  GripVertical,
  X,
  Plus,
  Settings,
  Save,
  Download,
  Upload as UploadIcon,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldConfig, ModuleConfig, FieldType } from "../types";
import { FieldTypeSelector } from "./field-type-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormBuilderProps {
  initialConfig?: ModuleConfig;
  onSave?: (config: ModuleConfig) => void;
  onPreview?: (config: ModuleConfig) => void;
}

export function FormBuilder({
  initialConfig,
  onSave,
  onPreview,
}: FormBuilderProps) {
  const [fields, setFields] = useState<FieldConfig[]>(
    initialConfig?.fields || [],
  );
  const [selectedField, setSelectedField] = useState<FieldConfig | null>(null);
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<ModuleConfig>({
    defaultValues: initialConfig || {
      name: "",
      resourceName: "",
      tableName: "",
      title: "",
      moduleType: "master",
      classForm: "grid grid-cols-1 md:grid-cols-2 gap-4",
      printable: false,
      published: false,
      fields: [],
    },
  });

  const moduleType = watch("moduleType");

  const addField = () => {
    const newField: FieldConfig = {
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: "text",
      required: false,
      sortOrder: fields.length,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
    setShowFieldEditor(true);
  };

  const updateField = (index: number, updatedField: FieldConfig) => {
    const newFields = [...fields];
    newFields[index] = updatedField;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    if (selectedField === fields[index]) {
      setSelectedField(null);
      setShowFieldEditor(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);

    setFields(newFields);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Update sortOrder
    setFields(fields.map((field, index) => ({ ...field, sortOrder: index })));
  };

  const handleSave = (data: ModuleConfig) => {
    const config: ModuleConfig = {
      ...data,
      fields,
    };
    onSave?.(config);
  };

  const handleExport = () => {
    const data = {
      ...watch(),
      fields,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.resourceName || "module"}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Map formJson format to ModuleConfig
        setValue("name", json.moduleName);
        setValue("resourceName", json.resourceName);
        setValue("tableName", json.tableName);
        setValue("title", json.title);
        setValue("route", json.route);
        setValue("classForm", json.classForm);
        setValue("printable", json.printable || false);
        setFields(json.fields || []);
      } catch (error) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Form Builder</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label>
              <Button variant="outline" size="sm" asChild>
                <span>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview?.({ ...watch(), fields })}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" onClick={handleSubmit(handleSave)}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="name">Module Name</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="e.g., Barang"
            />
          </div>
          <div>
            <Label htmlFor="resourceName">Resource Name</Label>
            <Input
              id="resourceName"
              {...register("resourceName", { required: true })}
              placeholder="e.g., barangs"
            />
          </div>
          <div>
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              {...register("tableName", { required: true })}
              placeholder="e.g., tm_barang"
            />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: true })}
              placeholder="Display title"
            />
          </div>
          <div>
            <Label htmlFor="moduleType">Module Type</Label>
            <Select
              value={moduleType}
              onValueChange={(value) => setValue("moduleType", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="master">Master Data</SelectItem>
                <SelectItem value="transaction">Transaction</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="route">Route</Label>
            <Input
              id="route"
              {...register("route")}
              placeholder="e.g., /admin/barang"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Fields List */}
        <div className="w-1/2 border-r overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Fields ({fields.length})</h3>
            <Button size="sm" onClick={addField}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>

          <div className="space-y-2">
            {fields.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No fields yet. Click "Add Field" to start.</p>
              </div>
            ) : (
              fields.map((field, index) => (
                <Card
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move hover:shadow-md transition-shadow ${
                    draggedIndex === index ? "opacity-50" : ""
                  }`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{field.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {field.name} • {field.type}
                        {field.required && " • Required"}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedField(field);
                        setShowFieldEditor(true);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Field Editor */}
        <div className="w-1/2 overflow-y-auto p-4">
          {selectedField ? (
            <FieldEditor
              field={selectedField}
              onUpdate={(updatedField) => {
                const index = fields.findIndex(
                  (f) => f.name === selectedField.name,
                );
                if (index !== -1) {
                  updateField(index, updatedField);
                  setSelectedField(updatedField);
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Select a field to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Field Editor Component
function FieldEditor({
  field,
  onUpdate,
}: {
  field: FieldConfig;
  onUpdate: (field: FieldConfig) => void;
}) {
  const [localField, setLocalField] = useState<FieldConfig>(field);

  React.useEffect(() => {
    setLocalField(field);
  }, [field]);

  const updateField = (updates: Partial<FieldConfig>) => {
    const updated = { ...localField, ...updates };
    setLocalField(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Field Properties</h3>

      <div>
        <Label htmlFor="field-name">Field Name</Label>
        <Input
          id="field-name"
          value={localField.name}
          onChange={(e) => updateField({ name: e.target.value })}
          placeholder="e.g., productName"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Database column name (camelCase)
        </p>
      </div>

      <div>
        <Label htmlFor="field-label">Label</Label>
        <Input
          id="field-label"
          value={localField.label}
          onChange={(e) => updateField({ label: e.target.value })}
          placeholder="e.g., Product Name"
        />
      </div>

      <div>
        <Label>Field Type</Label>
        <FieldTypeSelector
          value={localField.type}
          onChange={(type) => updateField({ type })}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={localField.required}
            onCheckedChange={(checked) =>
              updateField({ required: checked as boolean })
            }
          />
          <Label htmlFor="required">Required</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="readOnly"
            checked={localField.readOnly}
            onCheckedChange={(checked) =>
              updateField({ readOnly: checked as boolean })
            }
          />
          <Label htmlFor="readOnly">Read Only</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="field-default">Default Value</Label>
        <Input
          id="field-default"
          value={localField.defaultValue || ""}
          onChange={(e) => updateField({ defaultValue: e.target.value })}
          placeholder="Optional default value"
        />
      </div>

      <div>
        <Label htmlFor="field-placeholder">Placeholder</Label>
        <Input
          id="field-placeholder"
          value={localField.placeholder || ""}
          onChange={(e) => updateField({ placeholder: e.target.value })}
          placeholder="Placeholder text"
        />
      </div>

      <div>
        <Label htmlFor="field-help">Help Text</Label>
        <Input
          id="field-help"
          value={localField.helpText || ""}
          onChange={(e) => updateField({ helpText: e.target.value })}
          placeholder="Helper text for users"
        />
      </div>

      {/* Type-specific options */}
      {(localField.type === "select" || localField.type === "async-select") && (
        <div>
          <Label htmlFor="field-options">Options (comma-separated)</Label>
          <Input
            id="field-options"
            value={
              Array.isArray(localField.options)
                ? localField.options.join(", ")
                : ""
            }
            onChange={(e) =>
              updateField({
                options: e.target.value.split(",").map((s) => s.trim()),
              })
            }
            placeholder="e.g., Option 1, Option 2, Option 3"
          />
        </div>
      )}

      {localField.type === "async-select" && (
        <>
          <div>
            <Label htmlFor="field-endpoint">API Endpoint</Label>
            <Input
              id="field-endpoint"
              value={localField.endpoint || ""}
              onChange={(e) => updateField({ endpoint: e.target.value })}
              placeholder="e.g., /api/kategoris"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="field-label-field">Label Field</Label>
              <Input
                id="field-label-field"
                value={localField.labelField || ""}
                onChange={(e) => updateField({ labelField: e.target.value })}
                placeholder="e.g., name"
              />
            </div>
            <div>
              <Label htmlFor="field-value-field">Value Field</Label>
              <Input
                id="field-value-field"
                value={localField.valueField || ""}
                onChange={(e) => updateField({ valueField: e.target.value })}
                placeholder="e.g., id"
              />
            </div>
          </div>
        </>
      )}

      {localField.type === "text" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="field-autocode">Auto Code Pattern</Label>
            <Input
              id="field-autocode"
              value={localField.autoCode || ""}
              onChange={(e) => updateField({ autoCode: e.target.value })}
              placeholder="e.g., SLS-{YYYYMMDD}-{0001}"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{YYYY}"}, {"{MM}"}, {"{DD}"}, {"{0001}"} for auto-generation
            </p>
          </div>
          <div>
            <Label htmlFor="field-formula">Formula Expression (Optional)</Label>
            <Input
              id="field-formula"
              value={localField.formula || ""}
              onChange={(e) => updateField({ formula: e.target.value })}
              placeholder="e.g., qty * price"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for manual input. Use field names for auto-calculation
            </p>
          </div>
        </div>
      )}

      {(localField.type === "number" ||
        localField.type === "currency" ||
        localField.type === "rupiah" ||
        localField.type === "gram") && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="field-formula">Formula Expression (Optional)</Label>
            <Input
              id="field-formula"
              value={localField.formula || ""}
              onChange={(e) => updateField({ formula: e.target.value })}
              placeholder="e.g., qty * price or {qty} * {price}"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for manual input. Use field names or {"{fieldName}"}{" "}
              syntax for auto-calculation
            </p>
          </div>
          {localField.formula && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="field-decimals">Decimal Places</Label>
                <Input
                  id="field-decimals"
                  type="number"
                  min="0"
                  max="10"
                  value={localField.validation?.decimals || 2}
                  onChange={(e) =>
                    updateField({
                      validation: {
                        ...localField.validation,
                        decimals: parseInt(e.target.value) || 2,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="field-prefix">Prefix/Suffix</Label>
                <div className="flex gap-2">
                  <Input
                    id="field-prefix"
                    value={localField.validation?.prefix || ""}
                    onChange={(e) =>
                      updateField({
                        validation: {
                          ...localField.validation,
                          prefix: e.target.value,
                        },
                      })
                    }
                    placeholder="Rp"
                    className="w-20"
                  />
                  <Input
                    value={localField.validation?.suffix || ""}
                    onChange={(e) =>
                      updateField({
                        validation: {
                          ...localField.validation,
                          suffix: e.target.value,
                        },
                      })
                    }
                    placeholder="kg"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {localField.type === "formula" && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="field-formula">Formula Expression</Label>
            <Input
              id="field-formula"
              value={localField.formula || ""}
              onChange={(e) => updateField({ formula: e.target.value })}
              placeholder="e.g., qty * price or {qty} * {price}"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use field names or {"{fieldName}"} syntax. Example: qty * price,
              (qty * price) - discount
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="field-decimals">Decimal Places</Label>
              <Input
                id="field-decimals"
                type="number"
                min="0"
                max="10"
                value={localField.validation?.decimals || 2}
                onChange={(e) =>
                  updateField({
                    validation: {
                      ...localField.validation,
                      decimals: parseInt(e.target.value) || 2,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="field-prefix">Prefix/Suffix</Label>
              <div className="flex gap-2">
                <Input
                  id="field-prefix"
                  value={localField.validation?.prefix || ""}
                  onChange={(e) =>
                    updateField({
                      validation: {
                        ...localField.validation,
                        prefix: e.target.value,
                      },
                    })
                  }
                  placeholder="Rp"
                  className="w-20"
                />
                <Input
                  value={localField.validation?.suffix || ""}
                  onChange={(e) =>
                    updateField({
                      validation: {
                        ...localField.validation,
                        suffix: e.target.value,
                      },
                    })
                  }
                  placeholder="kg"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
