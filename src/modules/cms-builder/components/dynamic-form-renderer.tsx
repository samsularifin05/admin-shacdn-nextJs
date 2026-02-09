"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { ModuleConfig } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCurrency,
  FormGram,
  FormAsyncSelect,
  FormCheckbox,
  FormFile,
  FormFormula,
} from "@/components/form";

interface DynamicFormRendererProps {
  config: ModuleConfig;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export function DynamicFormRenderer({
  config,
  initialData,
  onSubmit,
  onCancel,
}: DynamicFormRendererProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {},
  });

  const renderField = (field: any) => {
    // Check if field has autoCode - make it readonly
    const isAutoCode = field.autoCode && field.autoCode.trim() !== "";

    const commonProps = {
      label: field.label,
      placeholder: isAutoCode
        ? `Will be auto-generated: ${field.autoCode}`
        : field.placeholder,
      required: field.required,
      helpText: field.helpText,
      readOnly:
        isAutoCode || field.readOnly || (initialData && field.readOnlyOnEdit),
      ...register(field.name),
    };

    // Jika field punya formula, gunakan FormFormula
    const hasFormula = field.formula && field.formula.trim() !== "";

    switch (field.type) {
      case "text":
        if (hasFormula) {
          return (
            <Controller
              name={field.name}
              control={control}
              render={({ field: { ref, ...fieldProps } }) => (
                <FormFormula
                  {...commonProps}
                  {...fieldProps}
                  formula={field.formula}
                  watchValues={watch()}
                  decimals={field.validation?.decimals || 0}
                  prefix={field.validation?.prefix}
                  suffix={field.validation?.suffix}
                />
              )}
            />
          );
        }
        return <FormInput {...commonProps} type="text" />;

      case "email":
      case "password":
      case "url":
        return <FormInput {...commonProps} type={field.type} />;

      case "textarea":
        return <FormTextarea {...commonProps} />;

      case "number":
        if (hasFormula) {
          return (
            <Controller
              name={field.name}
              control={control}
              render={({ field: { ref, ...fieldProps } }) => (
                <FormFormula
                  {...commonProps}
                  {...fieldProps}
                  formula={field.formula}
                  watchValues={watch()}
                  decimals={field.validation?.decimals || 2}
                  prefix={field.validation?.prefix}
                  suffix={field.validation?.suffix}
                />
              )}
            />
          );
        }
        return <FormInput {...commonProps} type="number" />;

      case "date":
        return <FormInput {...commonProps} type="date" />;

      case "datetime":
        return <FormInput {...commonProps} type="datetime-local" />;

      case "boolean":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <FormCheckbox {...commonProps} {...fieldProps} />
            )}
          />
        );

      case "select":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <FormSelect
                {...commonProps}
                {...fieldProps}
                options={field.options || []}
              />
            )}
          />
        );

      case "async-select":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: fieldProps }) => (
              <FormAsyncSelect
                {...commonProps}
                {...fieldProps}
                endpoint={field.endpoint}
                labelField={field.labelField || "name"}
                valueField={field.valueField || "id"}
              />
            )}
          />
        );

      case "currency":
      case "rupiah":
        if (hasFormula) {
          return (
            <Controller
              name={field.name}
              control={control}
              render={({ field: { ref, ...fieldProps } }) => (
                <FormFormula
                  {...commonProps}
                  {...fieldProps}
                  formula={field.formula}
                  watchValues={watch()}
                  decimals={field.validation?.decimals || 2}
                  prefix={field.validation?.prefix || "Rp"}
                  suffix={field.validation?.suffix}
                />
              )}
            />
          );
        }
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { ref, ...fieldProps } }) => (
              <FormCurrency {...commonProps} {...fieldProps} />
            )}
          />
        );

      case "gram":
        if (hasFormula) {
          return (
            <Controller
              name={field.name}
              control={control}
              render={({ field: { ref, ...fieldProps } }) => (
                <FormFormula
                  {...commonProps}
                  {...fieldProps}
                  formula={field.formula}
                  watchValues={watch()}
                  decimals={field.validation?.decimals || 2}
                  prefix={field.validation?.prefix}
                  suffix={field.validation?.suffix || "gr"}
                />
              )}
            />
          );
        }
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { ref, ...fieldProps } }) => (
              <FormGram {...commonProps} {...fieldProps} />
            )}
          />
        );

      case "formula":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { ref, ...fieldProps } }) => (
              <FormFormula
                {...commonProps}
                {...fieldProps}
                formula={field.formula || ""}
                watchValues={watch()}
                decimals={field.validation?.decimals || 2}
                prefix={field.validation?.prefix}
                suffix={field.validation?.suffix}
              />
            )}
          />
        );

      case "file":
      case "image":
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { ref, ...fieldProps } }) => (
              <FormFile {...commonProps} {...fieldProps} />
            )}
          />
        );

      default:
        return (
          <div>
            <Label>{field.label}</Label>
            <p className="text-sm text-muted-foreground">
              Field type "{field.type}" not supported yet
            </p>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className={config.classForm || "grid grid-cols-1 gap-4"}>
            {config.fields.map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
