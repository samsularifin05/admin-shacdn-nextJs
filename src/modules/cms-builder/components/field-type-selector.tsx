"use client";

import React from "react";
import {
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Mail,
  DollarSign,
  Link2,
  FileText,
  Image,
  Lock,
  Scale,
  ShoppingCart,
  Upload,
  Calculator,
} from "lucide-react";
import { FieldType } from "../types";

const fieldTypes: {
  value: FieldType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "text",
    label: "Text",
    icon: <Type className="h-4 w-4" />,
    description: "Single line text input",
  },
  {
    value: "textarea",
    label: "Text Area",
    icon: <FileText className="h-4 w-4" />,
    description: "Multi-line text input",
  },
  {
    value: "number",
    label: "Number",
    icon: <Hash className="h-4 w-4" />,
    description: "Numeric input",
  },
  {
    value: "currency",
    label: "Currency",
    icon: <DollarSign className="h-4 w-4" />,
    description: "Currency input",
  },
  {
    value: "rupiah",
    label: "Rupiah",
    icon: <DollarSign className="h-4 w-4" />,
    description: "Indonesian currency",
  },
  {
    value: "gram",
    label: "Gram (Weight)",
    icon: <Scale className="h-4 w-4" />,
    description: "Weight in grams",
  },
  {
    value: "formula",
    label: "Formula",
    icon: <Calculator className="h-4 w-4" />,
    description: "Auto-calculated field using formula",
  },
  {
    value: "date",
    label: "Date",
    icon: <Calendar className="h-4 w-4" />,
    description: "Date picker",
  },
  {
    value: "datetime",
    label: "Date Time",
    icon: <Calendar className="h-4 w-4" />,
    description: "Date and time picker",
  },
  {
    value: "boolean",
    label: "Checkbox",
    icon: <CheckSquare className="h-4 w-4" />,
    description: "True/false checkbox",
  },
  {
    value: "select",
    label: "Select",
    icon: <List className="h-4 w-4" />,
    description: "Dropdown selection",
  },
  {
    value: "async-select",
    label: "Async Select",
    icon: <Link2 className="h-4 w-4" />,
    description: "Dynamic dropdown from API",
  },
  {
    value: "email",
    label: "Email",
    icon: <Mail className="h-4 w-4" />,
    description: "Email address input",
  },
  {
    value: "password",
    label: "Password",
    icon: <Lock className="h-4 w-4" />,
    description: "Password input",
  },
  {
    value: "url",
    label: "URL",
    icon: <Link2 className="h-4 w-4" />,
    description: "Website URL",
  },
  {
    value: "file",
    label: "File Upload",
    icon: <Upload className="h-4 w-4" />,
    description: "File upload",
  },
  {
    value: "image",
    label: "Image Upload",
    icon: <Image className="h-4 w-4" />,
    description: "Image upload with preview",
  },
  {
    value: "detail",
    label: "Detail/Cart",
    icon: <ShoppingCart className="h-4 w-4" />,
    description: "Sub-form for line items",
  },
];

interface FieldTypeSelectorProps {
  value: FieldType;
  onChange: (value: FieldType) => void;
  disabled?: boolean;
}

export function FieldTypeSelector({
  value,
  onChange,
  disabled,
}: FieldTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {fieldTypes.map((type) => (
        <button
          key={type.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(type.value)}
          className={`
            p-3 rounded-lg border-2 transition-all
            ${
              value === type.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            flex flex-col items-start gap-2
          `}
        >
          <div className="flex items-center gap-2">
            {type.icon}
            <span className="font-medium text-sm">{type.label}</span>
          </div>
          <p className="text-xs text-muted-foreground text-left">
            {type.description}
          </p>
        </button>
      ))}
    </div>
  );
}
