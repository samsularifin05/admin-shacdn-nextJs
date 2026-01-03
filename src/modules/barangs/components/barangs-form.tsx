import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { barangSchema, BarangFormData, Barang } from "../types/barangs.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect, FormGram } from "@/components/form";
import { barangService } from "../services/barangs.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialData?: Barang;
  onSuccess?: () => void;
}

export const BarangForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<BarangFormData>({
    resolver: zodResolver(barangSchema) as any,
    defaultValues: initialData ? {
      kodeBarang: initialData.kodeBarang ?? undefined,
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
      kodeBarang: "",
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
      let result;
      if (initialData) {
        result = await barangService.update(initialData.id, data);
        toast.success("Barang updated successfully");
      } else {
        result = await barangService.create(data);
        toast.success("Barang created successfully");
      }

      if (result) {
        
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <FormAsyncSelect
            name="kategori"
            label="Kategori"
            placeholder="Search kategori..."
            endpoint="/api/kategoris"
            labelField="kodeGroup"
            valueField="id"
            disabled={isLoading}
            
            
          />
          <FormAsyncSelect
            name="jenis"
            label="Jenis"
            placeholder="Search jenis..."
            endpoint="/api/jenis"
            labelField="kodeJenis"
            valueField="id"
            disabled={isLoading}
            paramName="kodeGroup" paramValue={watch("kategori")}
            
          />
          <FormAsyncSelect
            name="kodeBaki"
            label="Kode Baki"
            placeholder="Search kode baki..."
            endpoint="/api/bakis"
            labelField="kodeBaki"
            valueField="id"
            disabled={isLoading}
            
            
          />
          <FormSelect
            name="barangSepuhan"
            label="Barang Sepuhan"
            placeholder="Select barang sepuhan"
            options={["TIDAK", "YA"].map(opt => ({ label: opt, value: opt }))}
            disabled={isLoading}
          />
          <FormGram
            name="stockSepuh"
            label="Stock Sepuh"
            placeholder="0.0"
            disabled={isLoading}
            readOnly
            className="bg-muted"
          />
          <FormGram
            name="beratSepuh"
            label="Berat Sepuh"
            placeholder="0.0"
            disabled={isLoading}
            readOnly
            className="bg-muted"
          />
          <FormInput
            name="kodeIntern"
            label="Kode Intern"
            type="text"
            placeholder="Enter kode intern"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormSelect
            name="markis"
            label="Markis"
            placeholder="Select markis"
            options={["TIDAK", "YA"].map(opt => ({ label: opt, value: opt }))}
            disabled={isLoading}
          />
          <FormInput
            name="namaBarang"
            label="Nama Barang"
            type="text"
            placeholder="Enter nama barang"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormGram
            name="beratAsli"
            label="Berat Asli"
            placeholder="0.0"
            disabled={isLoading}
            
            
          />
          <FormGram
            name="berat"
            label="Berat"
            placeholder="0.0"
            disabled={isLoading}
            
            
          />
          <FormInput
            name="kadarCetak"
            label="Kadar Cetak"
            type="text"
            placeholder="Enter kadar cetak"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormInput
            name="attributeName"
            label="Attribute Name"
            type="text"
            placeholder="Enter attribute name"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormGram
            name="beratAtribut"
            label="Berat Atribut"
            placeholder="0.0"
            disabled={isLoading}
            
            
          />
          <FormCurrency
            name="hargaAtribut"
            label="Harga Atribut"
            placeholder="0"
            disabled={isLoading}
            
            
          />
          <FormGram
            name="beratPlastik"
            label="Berat Plastik"
            placeholder="0.0"
            disabled={isLoading}
            
            
          />
          <FormInput
            name="size"
            label="Size"
            type="text"
            placeholder="Enter size"
            disabled={isLoading}
            
            className="uppercase"
            
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
