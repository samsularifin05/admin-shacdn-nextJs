import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salesTransactionSchema, SalesTransactionFormData, SalesTransaction } from "../types/sales-transactions.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect, FormGram } from "@/components/form";
import { salesTransactionService } from "../services/sales-transactions.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";

interface Props {
  initialData?: SalesTransaction;
  onSuccess?: () => void;
}

export const SalesTransactionForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<SalesTransactionFormData>({
    resolver: zodResolver(salesTransactionSchema) as any,
    defaultValues: initialData ? {
      transactionCode: initialData.transactionCode ?? undefined,
      barcode: initialData.barcode ?? undefined,
      customerName: initialData.customerName ?? undefined,
      totalAmount: initialData.totalAmount ?? undefined
    } : {
      transactionCode: "",
      barcode: "",
      customerName: "",
      totalAmount: 0
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  

  const onSubmit = async (data: SalesTransactionFormData) => {
    try {
      if (initialData) {
        await salesTransactionService.update(initialData.id, data);
      } else {
        await salesTransactionService.create(data);
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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">


          <FormInput
            name="customerName"
            label="Customer Name"
            type="text"
            placeholder="Enter customer name"
            disabled={isLoading}
            
            className="uppercase"
          />
          <FormCurrency
            name="totalAmount"
            label="Total Amount"
            placeholder="0"
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
