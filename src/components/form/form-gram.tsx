import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { useFormContext, Controller } from "react-hook-form";

interface FormGramProps {
  name: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

export const FormGram = forwardRef<HTMLInputElement, FormGramProps>(
  ({ name, label, className, disabled, readOnly, placeholder }, ref) => {
    const {
      control,
      formState: { errors },
    } = useFormContext();
    const error = errors[name];
    const errorMessage = error?.message as string | undefined;

    return (
      <div className="space-y-2 p-1">
        {label && (
          <Label htmlFor={name} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value, ...rest } }) => (
            <Input
              {...rest}
              ref={ref}
              type="text"
              inputMode="decimal"
              placeholder={placeholder || "0.0"}
              disabled={disabled}
              readOnly={readOnly}
              value={value ?? ""}
              onChange={(e) => {
                const newValue = e.target.value;
                // Allow empty, or regex match (only digits and at most one dot)
                // Also prevent starting with multiple dots or invalid formats if needed
                if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
                  onChange(newValue);
                }
              }}
              className={cn(
                error && "border-destructive focus-visible:ring-destructive",
                className
              )}
            />
          )}
        />
        {errorMessage && (
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);

FormGram.displayName = "FormGram";
