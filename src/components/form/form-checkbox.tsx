import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormCheckboxProps {
  name: string;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function FormCheckbox({
  name,
  label,
  description,
  className,
  disabled,
}: FormCheckboxProps) {
  const {
    // register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;
  const value = watch(name);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          checked={value}
          onCheckedChange={(checked) => setValue(name, checked)}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
        {label && (
          <Label
            htmlFor={name}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error && "text-destructive"
            )}
          >
            {label}
          </Label>
        )}
      </div>
      {description && !error && (
        <p className="text-sm text-muted-foreground pl-6">{description}</p>
      )}
      {errorMessage && (
        <p className="text-sm font-medium text-destructive pl-6">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
