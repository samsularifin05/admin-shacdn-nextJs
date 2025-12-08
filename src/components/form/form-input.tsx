import { forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label?: string;
  description?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, label, description, className, ...props }, ref) => {
    const formContext = useFormContext();

    if (!formContext) {
      // Fallback if not used within FormProvider
      return (
        <div className="space-y-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <Input
            id={name}
            name={name}
            {...props}
            ref={ref}
            className={className}
          />
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      );
    }

    const {
      register,
      formState: { errors },
    } = formContext;

    const error = errors[name];
    const errorMessage = error?.message as string | undefined;
    const registration = register(name);

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={name} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <Input
          id={name}
          {...registration}
          {...props}
          ref={(e) => {
            registration.ref(e);
            if (typeof ref === "function") {
              ref(e);
            } else if (ref) {
              ref.current = e;
            }
          }}
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

FormInput.displayName = "FormInput";
