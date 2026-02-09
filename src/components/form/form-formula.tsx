"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { evaluate } from "mathjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFormulaProps {
  label?: string;
  formula: string;
  watchValues?: Record<string, any>;
  value?: number | string;
  onChange?: (value: number | string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export const FormFormula = React.forwardRef<HTMLInputElement, FormFormulaProps>(
  (
    {
      label,
      formula,
      watchValues = {},
      value,
      onChange,
      onBlur,
      name,
      placeholder,
      helpText,
      required,
      readOnly = true,
      className,
      decimals = 2,
      prefix,
      suffix,
    },
    ref,
  ) => {
    const [calculatedValue, setCalculatedValue] = useState<number | string>("");
    const [error, setError] = useState<string>("");
    const onChangeRef = useRef(onChange);
    const previousValueRef = useRef<number | string>("");

    // Update ref when onChange changes
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Serialize watchValues to prevent object reference changes causing re-renders
    const watchValuesString = useMemo(
      () => JSON.stringify(watchValues),
      [watchValues],
    );

    useEffect(() => {
      if (!formula) {
        setCalculatedValue("");
        if (previousValueRef.current !== "") {
          previousValueRef.current = "";
          if (onChangeRef.current) {
            onChangeRef.current("");
          }
        }
        return;
      }

      try {
        // Parse back the serialized watchValues
        const values = JSON.parse(watchValuesString);

        // Replace field names in formula with their values
        let processedFormula = formula;

        // Replace variables like {fieldName} or fieldName with actual values
        Object.keys(values).forEach((key) => {
          const fieldValue = values[key] || 0;
          // Support both {fieldName} and fieldName syntax
          processedFormula = processedFormula.replace(
            new RegExp(`\\{${key}\\}`, "g"),
            String(fieldValue),
          );
          processedFormula = processedFormula.replace(
            new RegExp(`\\b${key}\\b`, "g"),
            String(fieldValue),
          );
        });

        // Evaluate the formula using mathjs
        const result = evaluate(processedFormula);

        // Format the result based on decimals
        const formattedResult =
          typeof result === "number"
            ? Number(result.toFixed(decimals))
            : result;

        setCalculatedValue(formattedResult);
        setError("");

        // Call onChange only if value actually changed
        if (previousValueRef.current !== formattedResult) {
          previousValueRef.current = formattedResult;
          if (onChangeRef.current) {
            onChangeRef.current(formattedResult);
          }
        }
      } catch (err: any) {
        setError(err.message || "Invalid formula");
        setCalculatedValue("");
        if (previousValueRef.current !== "") {
          previousValueRef.current = "";
          if (onChangeRef.current) {
            onChangeRef.current("");
          }
        }
      }
    }, [formula, watchValuesString, decimals]);

    const formatNumber = (num: number | string): string => {
      if (typeof num !== "number") return String(num);

      // Format number dengan thousand separator
      const formatted = num.toLocaleString("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      return formatted;
    };

    const displayValue = () => {
      if (error) return error;
      if (calculatedValue === "") return "";

      let display =
        typeof calculatedValue === "number"
          ? formatNumber(calculatedValue)
          : String(calculatedValue);

      if (prefix) display = `${prefix} ${display}`;
      if (suffix) display = `${display} ${suffix}`;

      return display;
    };

    return (
      <div className={cn("space-y-1", className)}>
        {label && (
          <Label htmlFor={name}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}

        <Input
          ref={ref}
          id={name}
          name={name}
          value={displayValue()}
          readOnly={readOnly}
          placeholder={placeholder}
          onBlur={onBlur}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
          )}
        />

        {helpText && !error && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        {formula && !error && (
          <p className="text-xs text-muted-foreground">
            Formula:{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">
              {formula}
            </code>
          </p>
        )}
      </div>
    );
  },
);

FormFormula.displayName = "FormFormula";
