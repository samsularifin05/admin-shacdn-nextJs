import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";

interface FormCurrencyProps {
  name: string;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  onChange?: (value: number) => void;
}

export const FormCurrency = forwardRef<HTMLInputElement, FormCurrencyProps>(
  (
    {
      name,
      label,
      description,
      className,
      disabled,
      readOnly,
      placeholder,
      onChange,
    },
    ref
  ) => {
    const {
      setValue,
      watch,
      formState: { errors },
    } = useFormContext();

    const error = errors[name];
    const errorMessage = error?.message as string | undefined;
    const value = watch(name);

    // Format number to Rupiah
    const formatRupiah = (num: number | string): string => {
      if (!num && num !== 0) return "";
      const numValue =
        typeof num === "string" ? parseFloat(num.replace(/\D/g, "")) : num;
      if (isNaN(numValue)) return "";
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(numValue);
    };

    // Parse Rupiah to number
    const parseRupiah = (str: string): number => {
      const cleaned = str.replace(/\D/g, "");
      return cleaned ? parseInt(cleaned, 10) : 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const numValue = parseRupiah(rawValue);
      setValue(name, numValue);
      if (onChange) onChange(numValue);
    };

    return (
      <div className="space-y-2 p-1">
        {label && (
          <Label htmlFor={name} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <Input
          id={name}
          type="text"
          value={formatRupiah(value)}
          onChange={handleChange}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          ref={ref}
          onFocus={(e) => e.target.select()}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
        />
        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {errorMessage && (
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);

FormCurrency.displayName = "FormCurrency";
