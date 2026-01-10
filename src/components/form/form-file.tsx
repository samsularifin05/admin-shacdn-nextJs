import { forwardRef, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface FormFileProps {
  name: string;
  label?: string;
  description?: string;
  uploadDir?: string;
  className?: string;
  disabled?: boolean;
}

export const FormFile = forwardRef<HTMLInputElement, FormFileProps>(
  (
    { name, label, description, uploadDir = "uploads", className, disabled },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const formContext = useFormContext();

    if (!formContext) return null;

    const {
      register,
      setValue,
      watch,
      formState: { errors },
    } = formContext;

    const value = watch(name);
    const error = errors[name];
    const errorMessage = error?.message as string | undefined;

    // Handle preview
    useEffect(() => {
      if (typeof value === "string") {
        setPreview(value);
      } else if (value instanceof File) {
        const objectUrl = URL.createObjectURL(value);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else {
        setPreview(null);
      }
    }, [value]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setValue(name, file, { shouldValidate: true, shouldDirty: true });
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        setValue(name, file, { shouldValidate: true, shouldDirty: true });
      }
    };

    const clearFile = () => {
      setValue(name, "", { shouldValidate: true, shouldDirty: true });
    };

    return (
      <div className="space-y-2 p-1">
        {label && (
          <Label htmlFor={name} className={cn(error && "text-destructive")}>
            {label}
          </Label>
        )}

        <div className="flex flex-col gap-2">
          {value ? (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
              {preview &&
              (preview.startsWith("/") ||
                preview.startsWith("blob:") ||
                preview.startsWith("http")) ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-10 w-10 object-cover rounded shadow-sm"
                />
              ) : (
                <FileIcon className="h-4 w-4 text-primary" />
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm truncate">
                  {value instanceof File ? value.name : value}
                </span>
                {value instanceof File && (
                  <span className="text-[10px] text-muted-foreground uppercase">
                    New Upload
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="p-1 hover:bg-muted rounded-full"
                disabled={disabled}
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Input
                id={name}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
                ref={ref}
              />
              <Label
                htmlFor={name}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                    : "border-muted-foreground/25 hover:bg-muted/50",
                  error ? "border-destructive text-destructive" : "",
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                )}
              >
                <>
                  <Upload
                    className={cn(
                      "h-6 w-6 mb-1 transition-transform duration-200",
                      isDragging
                        ? "scale-110 text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isDragging ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {isDragging
                      ? "Drop here to upload"
                      : "Click to upload or drag & drop"}
                  </span>
                </>
              </Label>
            </div>
          )}
        </div>

        {description && !error && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {errorMessage && (
          <p className="text-xs font-medium text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);

FormFile.displayName = "FormFile";
