import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { barangSchema, BarangFormData, Barang } from "../types/barangs.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect } from "@/components/form";
import { barangService } from "../services/barangs.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";

interface Props {
  initialData?: Barang;
  onSuccess?: () => void;
}

export const BarangForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<BarangFormData>({
    resolver: zodResolver(barangSchema) as any,
    defaultValues: initialData ? {
      kategori: initialData.kategori ?? undefined,
      jenis: initialData.jenis ?? undefined,
      kodeBaki: initialData.kodeBaki ?? undefined,
      barangSepuhan: initialData.barangSepuhan ?? undefined,
      stockSepuh: initialData.stockSepuh ?? undefined,
      beratSepuh: initialData.beratSepuh ?? undefined,
      kodeIntern: initialData.kodeIntern ?? undefined,
      markis: initialData.markis ?? undefined,
      namaBarang: initialData.namaBarang ?? undefined,
      beratAsli: initialData.beratAsli ?? undefined,
      berat: initialData.berat ?? undefined,
      kadarCetak: initialData.kadarCetak ?? undefined,
      attributeName: initialData.attributeName ?? undefined,
      beratAtribut: initialData.beratAtribut ?? undefined,
      hargaAtribut: initialData.hargaAtribut ?? undefined,
      beratPlastik: initialData.beratPlastik ?? undefined,
      size: initialData.size ?? undefined
    } : {
      kategori: "",
      jenis: "",
      kodeBaki: "",
      barangSepuhan: "TIDAK",
      stockSepuh: 0,
      beratSepuh: 0,
      kodeIntern: "",
      markis: "TIDAK",
      namaBarang: "",
      beratAsli: 0,
      berat: 0,
      kadarCetak: "",
      attributeName: "",
      beratAtribut: 0,
      hargaAtribut: 0,
      beratPlastik: 0,
      size: ""
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  

  const onSubmit = async (data: BarangFormData) => {
    try {
      if (initialData) {
        await barangService.update(initialData.id, data);
      } else {
        await barangService.create(data);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <FormAsyncSelect
            name="kategori"
            label="Kategori"
            placeholder="Select Kategori"
            endpoint="/api/kategoris"
            labelField="kodeGroup"
            valueField="id"
            disabled={isLoading}
          />

          <FormAsyncSelect
            name="jenis"
            label="Jenis"
            placeholder="Select Jenis"
            endpoint="/api/jenis"
            labelField="kodeJenis"
            valueField="id"
            disabled={isLoading}
          />

          <FormAsyncSelect
            name="kodeBaki"
            label="Kode Baki"
            placeholder="Select Kode Baki"
            endpoint="/api/bakis"
            labelField="kodeBaki"
            valueField="id"
            disabled={isLoading}
          />

          <FormSelect
            name="barangSepuhan"
            label="Barang Sepuhan"
            placeholder="Select Barang Sepuhan"
            options={[
              { label: "TIDAK", value: "TIDAK" },
              { label: "YA", value: "YA" }
            ]}
            disabled={isLoading}
          />

          <FormInput
            name="stockSepuh"
            label="Stock Sepuh"
            placeholder="Stock Sepuh"
            type="number"
            disabled={isLoading}
            readOnly
            className="bg-muted"
          />

          <FormInput
            name="beratSepuh"
            label="Berat Sepuh"
            placeholder="Berat Sepuh"
            type="number"
            disabled={isLoading}
            readOnly
            className="bg-muted"
          />

          <FormInput
            name="kodeIntern"
            label="Kode Intern"
            placeholder="Kode Intern"
            type="text"
            disabled={isLoading}
            
            
          />

          <FormSelect
            name="markis"
            label="Markis"
            placeholder="Select Markis"
            options={[
              { label: "TIDAK", value: "TIDAK" },
              { label: "YA", value: "YA" }
            ]}
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
            name="beratAsli"
            label="Berat Asli"
            placeholder="Berat Asli"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="berat"
            label="Berat"
            placeholder="Berat"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="kadarCetak"
            label="Kadar Cetak"
            placeholder="Kadar Cetak"
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
            name="beratAtribut"
            label="Berat Atribut"
            placeholder="Berat Atribut"
            type="number"
            disabled={isLoading}
            
            
          />

          <FormCurrency
            name="hargaAtribut"
            label="Harga Atribut"
            placeholder="Harga Atribut"
            disabled={isLoading}
            
            
          />

          <FormInput
            name="beratPlastik"
            label="Berat Plastik"
            placeholder="Berat Plastik"
            type="number"
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
