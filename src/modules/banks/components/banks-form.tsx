import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankSchema, BankFormData, Bank } from "../types/banks.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect, FormGram } from "@/components/form";
import { bankService } from "../services/banks.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialData?: Bank;
  onSuccess?: () => void;
}

export const BankForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<BankFormData>({
    resolver: zodResolver(bankSchema) as any,
    defaultValues: initialData ? {
      code: initialData.code ?? undefined,
      name: initialData.name ?? undefined,
      category: initialData.category ?? undefined,
      balance: initialData.balance ?? undefined,
      conversionRate: initialData.conversionRate ?? undefined,
      totalValue: initialData.totalValue ?? undefined,
      isActive: initialData.isActive ?? undefined
    } : {
      code: "",
      name: "",
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
        toast.success("Bank updated successfully");
      } else {
        await bankService.create(data);
        toast.success("Bank created successfully");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <FormInput
            name="code"
            label="Bank Code"
            type="text"
            placeholder="Enter bank code"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormInput
            name="name"
            label="Bank Name"
            type="text"
            placeholder="Enter bank name"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormSelect
            name="category"
            label="Category"
            placeholder="Select category"
            options={["Local", "International"].map(opt => ({ label: opt, value: opt }))}
            disabled={isLoading}
          />
          <FormInput
            name="balance"
            label="Default Balance"
            type="number"
            placeholder="0"
            disabled={isLoading}
            
            
            
          />
          <FormInput
            name="conversionRate"
            label="Conversion Rate"
            type="number"
            placeholder="0"
            disabled={isLoading}
            
            
            
          />
          <FormInput
            name="totalValue"
            label="Total Value (Calculated)"
            type="number"
            placeholder="0"
            disabled={isLoading}
            readOnly
            className="bg-muted"
            
          />
          <FormCheckbox
            name="isActive"
            label="Active Status"
            disabled={isLoading}
          />
        </div>
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
