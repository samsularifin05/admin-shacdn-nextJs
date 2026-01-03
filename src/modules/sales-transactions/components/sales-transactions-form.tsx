import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salesTransactionSchema, SalesTransactionFormData, SalesTransaction } from "../types/sales-transactions.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect, FormGram, FormCart } from "@/components/form";
import { salesTransactionService } from "../services/sales-transactions.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2, Printer } from "lucide-react";
import { toast } from "sonner";

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
      transactionDate: initialData.transactionDate ?? undefined,
      customerName: initialData.customerName ?? undefined,
      items: initialData.items ?? [],
      totalAmount: initialData.totalAmount ?? undefined,
      paymentMethod: initialData.paymentMethod ?? undefined
    } : {
      transactionCode: "",
      transactionDate: "2026-01-03",
      customerName: "CASH",
      items: [],
      totalAmount: 0,
      paymentMethod: "TUNAI"
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  const [shouldPrint, setShouldPrint] = useState(true);

  

  const onSubmit = async (data: SalesTransactionFormData) => {
    try {
      let result;
      if (initialData) {
        result = await salesTransactionService.update(initialData.id, data);
        toast.success("Sales Transaction updated successfully");
      } else {
        result = await salesTransactionService.create(data);
        toast.success("Sales Transaction created successfully");
      }

      if (shouldPrint && result) {
        // Trigger print via hidden iframe
        const printUrl = `/admin/print/sales-transactions/${result.id}`;
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = printUrl;
        document.body.appendChild(iframe);
        
        // Cleanup iframe after some time
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
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
            name="transactionDate"
            label="Tanggal"
            type="text"
            placeholder="Enter tanggal"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormInput
            name="customerName"
            label="Nama Pelanggan"
            type="text"
            placeholder="Enter nama pelanggan"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormCart
            name="items"
            label="Daftar Barang"
            fields={[{"name":"barangId","label":"Barang","type":"async-select","endpoint":"/api/barangs","labelField":"namaBarang","valueField":"id","relatedTable":"tm_barang","autoFill":{"harga":"hargaJual"}},{"name":"harga","label":"Harga","type":"rupiah"},{"name":"qty","label":"Qty","type":"number"},{"name":"subtotal","label":"Subtotal","type":"rupiah","readOnly":true}]}
            totalField="totalAmount"
          />
          <FormCurrency
            name="totalAmount"
            label="Total Bayar"
            placeholder="0"
            disabled={isLoading}
            readOnly
            className="bg-muted"
          />
          <FormSelect
            name="paymentMethod"
            label="Metode Bayar"
            placeholder="Select metode bayar"
            options={["TUNAI", "TRANSFER", "QRIS"].map(opt => ({ label: opt, value: opt }))}
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center space-x-2 py-2 border-t border-dashed">
          <input 
            type="checkbox" 
            id="shouldPrint" 
            checked={shouldPrint} 
            onChange={(e) => setShouldPrint(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="shouldPrint" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Receipt after saving
          </label>
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
