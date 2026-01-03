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
  paramName?: string;
  paramValue?: string | number | null;
  onObjectChange?: (data: any) => void;
}

// Helper to manage internal state for display vs form value for ID
export const FormAsyncSelect = ({
  name,
  label,
  placeholder,
  endpoint,
  labelField = "name",
  valueField = "id",
  className,
  disabled,
  paramName,
  paramValue,
  onObjectChange,
}: FormAsyncSelectProps) => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const value = watch(name);

  // If dependency changes, reset child value if it's no longer valid?
  // For now, let's just assume we want to clear it or let user re-select.
  // Using paramValue as key will force re-mount and cache clear, but won't clear form value automatically.
  React.useEffect(() => {
    if (paramName && (paramValue === undefined || paramValue === null)) {
      // If dependent parent is empty, maybe disable or clear?
    }
  }, [paramValue, paramName]);

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  // Local state to store the full option object for display
  const [selectedOption, setSelectedOption] = React.useState<any>(null);
  const fetchedValueRef = React.useRef<any>(undefined);

  // Fetch initial option if value exists (e.g. Edit mode)
  React.useEffect(() => {
    const fetchOption = async () => {
      if (!value) {
        if (selectedOption) setSelectedOption(null);
        fetchedValueRef.current = undefined;
        return;
      }

      // If we already have the correct option loaded, skip
      if (selectedOption?.value === value) return;
      // Prevent duplicate fetches for the same value
      if (fetchedValueRef.current === value) return;

      fetchedValueRef.current = value;

      try {
        const res = await apiClient.get(`${endpoint}/${value}`);
        const data = await res.json();
        if (data) {
          setSelectedOption({
            label: data[labelField],
            value: data[valueField],
            original: data,
          });
        }
      } catch (err) {
        console.error("Failed to fetch initial option", err);
        fetchedValueRef.current = undefined; // Allow retry on failure
      }
    };

    fetchOption();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, endpoint, labelField, valueField]);

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

      // Filter by dependency if present
      if (paramName && paramValue) {
        query.append(paramName, String(paramValue));
      }

      const res = await apiClient.get(`${endpoint}?${query.toString()}`);
      const json = await res.json();

      // Find the data array in the response
      const dataKey = Object.keys(json).find((key) => Array.isArray(json[key]));
      const data = dataKey ? json[dataKey] : [];
      const meta = json.meta;

      return {
        options: data.map((item: any) => ({
          label: item[labelField],
          value: item[valueField],
          original: item,
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
    <div className={cn("space-y-2 p-1", className)}>
      {label && (
        <Label htmlFor={name} className={cn(error && "text-destructive")}>
          {label}
        </Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, ref } }) => {
          return (
            <AsyncPaginate
              key={paramValue ? String(paramValue) : "no-dep"}
              selectRef={ref}
              // Prefer local selectedOption (with label), fallback to constructing object from value (shows ID)
              value={
                selectedOption ||
                (value ? { label: value, value: value } : null)
              }
              loadOptions={loadOptions as any}
              additional={{
                page: 1,
              }}
              onChange={(option: any) => {
                setSelectedOption(option);
                onChange(option ? option.value : null);
                if (onObjectChange && option?.original) {
                  onObjectChange(option.original);
                }
              }}
              menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 99999,
                  pointerEvents: "auto",
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 99999,
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
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
          );
        }}
      />
      {errorMessage && (
        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};
