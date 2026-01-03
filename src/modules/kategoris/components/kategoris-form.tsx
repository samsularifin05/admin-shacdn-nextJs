import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { kategoriSchema, KategoriFormData, Kategori } from "../types/kategoris.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect, FormGram } from "@/components/form";
import { kategoriService } from "../services/kategoris.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";

interface Props {
  initialData?: Kategori;
  onSuccess?: () => void;
}

export const KategoriForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<KategoriFormData>({
    resolver: zodResolver(kategoriSchema) as any,
    defaultValues: initialData ? {
      kodeGroup: initialData.kodeGroup ?? undefined,
      namaGroup: initialData.namaGroup ?? undefined,
      jenisGroup: initialData.jenisGroup ?? undefined,
      harga: initialData.harga ?? undefined,
      hargaModal: initialData.hargaModal ?? undefined,
      kodeWarnaNota: initialData.kodeWarnaNota ?? undefined
    } : {
      kodeGroup: "",
      namaGroup: "",
      jenisGroup: "",
      harga: "",
      hargaModal: "",
      kodeWarnaNota: ""
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  

  const onSubmit = async (data: KategoriFormData) => {
    try {
      if (initialData) {
        await kategoriService.update(initialData.id, data);
      } else {
        await kategoriService.create(data);
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
        <div className="space-y-4">
          <FormInput
            name="kodeGroup"
            label="Kode Group"
            type="text"
            placeholder="Enter kode group"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormInput
            name="namaGroup"
            label="Nama Group"
            type="text"
            placeholder="Enter nama group"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormInput
            name="jenisGroup"
            label="Jenis Group"
            type="text"
            placeholder="Enter jenis group"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormCurrency
            name="harga"
            label="Harga"
            placeholder="0"
            disabled={isLoading}
            
            
          />
          <FormCurrency
            name="hargaModal"
            label="Harga Modal"
            placeholder="0"
            disabled={isLoading}
            
            
          />
          <FormInput
            name="kodeWarnaNota"
            label="Kode Warna Nota"
            type="text"
            placeholder="Enter kode warna nota"
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
