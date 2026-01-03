import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bakiSchema, BakiFormData, Baki } from "../types/bakis.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect } from "@/components/form";
import { bakiService } from "../services/bakis.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";

interface Props {
  initialData?: Baki;
  onSuccess?: () => void;
}

export const BakiForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<BakiFormData>({
    resolver: zodResolver(bakiSchema) as any,
    defaultValues: initialData ? {
      kodeGudang: initialData.kodeGudang ?? undefined,
      kodeBaki: initialData.kodeBaki ?? undefined,
      namaBaki: initialData.namaBaki ?? undefined,
      beratBaki: initialData.beratBaki ?? undefined,
      beratBandrol: initialData.beratBandrol ?? undefined
    } : {
      kodeGudang: "",
      kodeBaki: "",
      namaBaki: "",
      beratBaki: 0,
      beratBandrol: 0
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  

  const onSubmit = async (data: BakiFormData) => {
    try {
      if (initialData) {
        await bakiService.update(initialData.id, data);
      } else {
        await bakiService.create(data);
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
            name="kodeGudang"
            label="Kode Gudang"
            type="text"
            placeholder="Enter kode gudang"
            disabled={isLoading}
            
            
          />
          <FormInput
            name="kodeBaki"
            label="Kode Baki"
            type="text"
            placeholder="Enter kode baki"
            disabled={isLoading}
            
            
          />
          <FormInput
            name="namaBaki"
            label="Nama Baki"
            type="text"
            placeholder="Enter nama baki"
            disabled={isLoading}
            
            
          />
          <FormInput
            name="beratBaki"
            label="Berat Baki"
            type="number"
            placeholder="Enter berat baki"
            disabled={isLoading}
            
            
          />
          <FormInput
            name="beratBandrol"
            label="Berat Bandrol"
            type="number"
            placeholder="Enter berat bandrol"
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
