import { forwardRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // Added Loader2
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client"; // Added import

interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  label?: string;
  description?: string;
  lookupEndpoint?: string;
  onObjectChange?: (data: any) => void;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      name,
      label,
      description,
      className,
      type,
      lookupEndpoint,
      onObjectChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const formContext = useFormContext();

    const isPasswordField = type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;

    // Lookup Handler
    const handleLookup = async (value: string) => {
      if (!lookupEndpoint || !onObjectChange || !value) return;
      setIsThinking(true);
      try {
        const query = new URLSearchParams({
          page: "1",
          limit: "1",
          search: value,
        });

        const res = await apiClient.get(
          `${lookupEndpoint}?${query.toString()}`
        );
        const json = await res.json();

        const dataKey = Object.keys(json).find((key) =>
          Array.isArray(json[key])
        );
        const data = dataKey ? json[dataKey] : [];

        if (data.length > 0) {
          onObjectChange(data[0]);
        } else {
          onObjectChange(null);
        }
      } catch (e) {
        console.error("Lookup failed", e);
      } finally {
        setIsThinking(false);
      }
    };

    if (!formContext) {
      // Fallback if not used within FormProvider
      return (
        <div className="space-y-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <div className="relative">
            <Input
              id={name}
              name={name}
              type={inputType}
              {...props}
              ref={ref}
              className={cn(isPasswordField && "pr-10", className)}
            />
            {/* Password toggle ... */}
          </div>
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
      <div className="space-y-2 p-1">
        {label && (
          <Label htmlFor={name} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}
        <div className="relative">
          <Input
            id={name}
            type={inputType}
            min={type === "number" ? 0 : undefined}
            {...registration}
            {...props}
            onBlur={(e) => {
              registration.onBlur(e);
              props.onBlur?.(e);
              if (lookupEndpoint) handleLookup(e.target.value);
            }}
            ref={(e) => {
              registration.ref(e);
              if (typeof ref === "function") {
                ref(e);
              } else if (ref) {
                ref.current = e;
              }
            }}
            onKeyDown={(e) => {
              if (type === "number" && e.key === "-") {
                e.preventDefault();
              }
              if (e.key === "Enter" && lookupEndpoint) {
                e.preventDefault(); // Prevent submit
                handleLookup((e.target as HTMLInputElement).value);
              }
              props.onKeyDown?.(e);
            }}
            onFocus={(e) => e.target.select()}
            className={cn(
              error && "border-destructive focus-visible:ring-destructive",
              isPasswordField && "pr-10",
              className
            )}
          />
          {isPasswordField && (
            <span
              className="absolute z-30 cursor-pointer right-0 top-0 h-full px-3 py-2 hover:bg-transparent flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </span>
          )}
          {isThinking && (
            <span className="absolute z-30 right-2 top-0 h-full flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </span>
          )}
        </div>
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
