import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jenisSchema, JenisFormData, Jenis } from "../types/jenis.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect, FormGram, FormCart } from "@/components/form";
import { jenisService } from "../services/jenis.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialData?: Jenis;
  onSuccess?: () => void;
}

export const JenisForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<JenisFormData>({
    resolver: zodResolver(jenisSchema) as any,
    defaultValues: initialData ? {
      kodeJenis: initialData.kodeJenis ?? undefined,
      namaJenis: initialData.namaJenis ?? undefined,
      kodeGroup: initialData.kodeGroup ?? undefined
    } : {
      kodeJenis: "",
      namaJenis: "",
      kodeGroup: 0
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  

  

  const onSubmit = async (data: JenisFormData) => {
    try {
      let result;
      if (initialData) {
        result = await jenisService.update(initialData.id, data);
        toast.success("Jenis updated successfully");
      } else {
        result = await jenisService.create(data);
        toast.success("Jenis created successfully");
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
        <div className="space-y-4">
          <FormInput
            name="kodeJenis"
            label="Kode Jenis"
            type="text"
            placeholder="Enter kode jenis"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormInput
            name="namaJenis"
            label="Nama Jenis"
            type="text"
            placeholder="Enter nama jenis"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormAsyncSelect
            name="kodeGroup"
            label="Kode Group"
            placeholder="Search kode group..."
            endpoint="/api/kategoris"
            labelField="kodeGroup"
            valueField="id"
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
