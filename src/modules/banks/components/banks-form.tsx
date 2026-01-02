import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankSchema, BankFormData, Bank } from "../types/banks.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox } from "@/components/form";
import { bankService } from "../services/banks.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";

interface Props {
  initialData?: Bank;
  onSuccess?: () => void;
}

export const BankForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema) as any,
    defaultValues: initialData ? {
      name: initialData.name,
      code: initialData.code,
      category: initialData.category,
      balance: initialData.balance,
      conversionRate: initialData.conversionRate,
      totalValue: initialData.totalValue,
      isActive: initialData.isActive
    } : {
      name: "",
      code: "",
      category: undefined,
      balance: 0,
      conversionRate: 1,
      totalValue: 0,
      isActive: true
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  
  // Auto-Calculation
  const values = watch();
  
  useEffect(() => {
    
    try {
      // Safe evaluation context
      const balance = Number(values.balance || 0);
      const conversionRate = Number(values.conversionRate || 0);
      const result = balance * conversionRate;
      setValue("totalValue", result);
    } catch (e) {}
  }, [values.balance, values.conversionRate, setValue]);


  const onSubmit = async (data: BankFormData) => {
    try {
      if (initialData) {
        await bankService.update(initialData.id, data);
      } else {
        await bankService.create(data);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <FormInput
            name="name"
            label="Bank Name"
            placeholder="Bank Name"
            type="text"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="code"
            label="Bank Code"
            placeholder="Bank Code"
            type="text"
            disabled={isLoading}
            
            
          />

          <FormSelect
            name="category"
            label="Category"
            placeholder="Select Category"
            options={[
              { label: "Local", value: "Local" },
              { label: "International", value: "International" }
            ]}
            disabled={isLoading}
          />

          <FormInput
            name="balance"
            label="Default Balance"
            placeholder="Default Balance"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="conversionRate"
            label="Conversion Rate"
            placeholder="Conversion Rate"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="totalValue"
            label="Total Value (Calculated)"
            placeholder="Total Value (Calculated)"
            type="number"
            disabled={isLoading}
            readOnly
            className="bg-muted"
          />

          <FormCheckbox
            name="isActive"
            label="Active Status"
            disabled={isLoading}
          />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update" : "Create"}
            </Button>
        </div>
      </form>
    </FormProvider>
  );
};
