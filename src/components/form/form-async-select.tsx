import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { AsyncPaginate } from "react-select-async-paginate";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface FormAsyncSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  endpoint: string;
  labelField?: string;
  valueField?: string;
  className?: string;
  disabled?: boolean;
}

export const FormAsyncSelect = ({
  name,
  label,
  placeholder,
  endpoint,
  labelField = "name",
  valueField = "id",
  className,
  disabled,
}: FormAsyncSelectProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  const loadOptions = async (
    search: string,
    loadedOptions: any,
    { page }: { page: number }
  ) => {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "10",
      });
      if (search) query.append("search", search);

      const res = await apiClient.get(`${endpoint}?${query.toString()}`);
      const json = await res.json();

      // Find the data array in the response
      // Expecting { [resourceName]: [], meta: {} }
      const dataKey = Object.keys(json).find((key) => Array.isArray(json[key]));
      const data = dataKey ? json[dataKey] : [];
      const meta = json.meta;

      return {
        options: data.map((item: any) => ({
          label: item[labelField],
          value: item[valueField],
          original: item, // Keep original data if needed
        })),
        hasMore: meta ? page < meta.totalPages : false,
        additional: {
          page: page + 1,
        },
      };
    } catch (err) {
      console.error("Failed to load options", err);
      return {
        options: [],
        hasMore: false,
      };
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className={cn(error && "text-destructive")}>
          {label}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, ref } }) => (
          <AsyncPaginate
            selectRef={ref}
            value={value ? { label: value, value: value } : null}
            loadOptions={loadOptions as any}
            additional={{
              page: 1,
            }}
            onChange={(option: any) => {
              onChange(option ? option.value : null);
            }}
            menuPortalTarget={
              typeof document !== "undefined" ? document.body : null
            }
            menuPosition="fixed"
            // Custom styles to match Shadcn roughly
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 99999,
                pointerEvents: "auto", // Fix for Radix UI Dialog pointer locking
              }),
              menu: (base) => ({
                ...base,
                zIndex: 99999,
                backgroundColor: "white", // Hardcoded to ensure opacity
                border: "1px solid #e5e7eb", // Tailwind gray-200
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }),
              control: (base, state) => ({
                ...base,
                minHeight: "44px",
                height: "44px",
                borderRadius: "calc(var(--radius) - 2px)",
                borderColor: error
                  ? "hsl(var(--destructive))"
                  : "hsl(var(--input))",
                boxShadow: state.isFocused
                  ? "0 0 0 1px hsl(var(--ring))"
                  : "none",
              }),
            }}
            placeholder={placeholder || "Select..."}
            isDisabled={disabled}
            isClearable
          />
        )}
      />
      {errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};
