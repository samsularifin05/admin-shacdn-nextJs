import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salesTransactionSchema, SalesTransactionFormData, SalesTransaction } from "../types/sales-transactions.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency } from "@/components/form";
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
      kodeBarcode: initialData.kodeBarcode,
      namaBarang: initialData.namaBarang,
      attributeName: initialData.attributeName,
      kadar: initialData.kadar,
      hargaSkrg: initialData.hargaSkrg,
      hargaAtribut: initialData.hargaAtribut,
      beratAtribut: initialData.beratAtribut,
      berat: initialData.berat,
      hargaJual: initialData.hargaJual,
      hargaPerGram: initialData.hargaPerGram,
      ongkos: initialData.ongkos,
      tipeDiskon: initialData.tipeDiskon,
      discountRp: initialData.discountRp,
      total: initialData.total,
      keterangan: initialData.keterangan,
      size: initialData.size
    } : {
      kodeBarcode: "",
      namaBarang: "",
      attributeName: "",
      kadar: 0,
      hargaSkrg: 0,
      hargaAtribut: 0,
      beratAtribut: 0,
      berat: 0,
      hargaJual: 0,
      hargaPerGram: 0,
      ongkos: 0,
      tipeDiskon: "None",
      discountRp: 0,
      total: 0,
      keterangan: "",
      size: ""
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  
  // Auto-Calculation
  const values = watch();
  
  useEffect(() => {
    
    try {
      // Safe evaluation context
      const kadar = Number(values.kadar || 0);
      const hargaSkrg = Number(values.hargaSkrg || 0);
      const berat = Number(values.berat || 0);
      const result = (kadar / 100) * hargaSkrg * berat;
      setValue("hargaJual", result);
    } catch (e) {}

    try {
      // Safe evaluation context
      const hargaJual = Number(values.hargaJual || 0);
      const ongkos = Number(values.ongkos || 0);
      const discountRp = Number(values.discountRp || 0);
      const result = hargaJual + ongkos - discountRp;
      setValue("total", result);
    } catch (e) {}
  }, [values.kadar, values.hargaSkrg, values.berat, values.hargaJual, values.ongkos, values.discountRp, setValue]);


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
        <div className="grid grid-cols-2 gap-4">

          <FormInput
            name="kodeBarcode"
            label="Kode Barcode"
            placeholder="Kode Barcode"
            type="text"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="namaBarang"
            label="Nama Barang"
            placeholder="Nama Barang"
            type="text"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="attributeName"
            label="Attribute Name"
            placeholder="Attribute Name"
            type="text"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="kadar"
            label="Kadar (%)"
            placeholder="Kadar (%)"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormCurrency
            name="hargaSkrg"
            label="Harga Sekarang"
            placeholder="Harga Sekarang"
            disabled={isLoading}
            
            
          />

          <FormCurrency
            name="hargaAtribut"
            label="Harga Atribut"
            placeholder="Harga Atribut"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="beratAtribut"
            label="Berat Atribut (gram)"
            placeholder="Berat Atribut (gram)"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="berat"
            label="Berat Jual (gram)"
            placeholder="Berat Jual (gram)"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="hargaJual"
            label="Harga Jual (Calculated)"
            placeholder="Harga Jual (Calculated)"
            type="number"
            disabled={isLoading}
            readOnly
            className="bg-muted"
          />

          <FormInput
            name="hargaPerGram"
            label="Harga / Gram"
            placeholder="Harga / Gram"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="ongkos"
            label="Ongkos"
            placeholder="Ongkos"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormSelect
            name="tipeDiskon"
            label="Pilih Tipe Diskon"
            placeholder="Select Pilih Tipe Diskon"
            options={[
              { label: "Percentage", value: "Percentage" },
              { label: "Fixed Amount", value: "Fixed Amount" },
              { label: "None", value: "None" }
            ]}
            disabled={isLoading}
          />

          <FormInput
            name="discountRp"
            label="Discount Rp"
            placeholder="Discount Rp"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="total"
            label="Total"
            placeholder="Total"
            type="number"
            disabled={isLoading}
            readOnly
            className="bg-muted"
          />

          <FormInput
            name="keterangan"
            label="Keterangan"
            placeholder="Keterangan"
            type="text"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="size"
            label="Size"
            placeholder="Size"
            type="text"
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
