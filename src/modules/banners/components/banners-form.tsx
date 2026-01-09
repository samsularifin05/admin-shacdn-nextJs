import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema, BannerFormData, Banner } from "../types/banners.schema";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormCheckbox, FormCurrency, FormAsyncSelect, FormGram, FormCart, FormFile, FormTextarea } from "@/components/form";
import { bannerService } from "../services/banners.service";
import { useModalStore } from "@/stores/modal-store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialData?: Banner;
  onSuccess?: () => void;
}

export const BannerForm = ({ initialData, onSuccess }: Props) => {
  const { onClose } = useModalStore();
  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: initialData ? {
      name: initialData.name ?? undefined,
      image: initialData.image ?? undefined,
      link: initialData.link ?? undefined,
      sequence: initialData.sequence ?? undefined,
      isActive: initialData.isActive ?? undefined,
      description: initialData.description ?? undefined
    } : {
      name: "",
      image: "",
      link: "",
      sequence: 1,
      isActive: true,
      description: ""
    },
  });

  const { watch, setValue, handleSubmit, formState: { isSubmitting: isLoading } } = form;

  

  

  const onSubmit = async (data: BannerFormData) => {
    try {
      let result;
      if (initialData) {
        result = await bannerService.update(initialData.id, data);
        toast.success("Banner Promo updated successfully");
      } else {
        result = await bannerService.create(data);
        toast.success("Banner Promo created successfully");
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
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormInput
            name="name"
            label="Nama Banner"
            type="text"
            placeholder="Enter nama banner"
            disabled={isLoading}
            
            className="uppercase"
            
          />
          <FormFile
            name="image"
            label="Gambar Banner"
            uploadDir="assets/banners"
            disabled={isLoading}
          />
          <FormInput
            name="link"
            label="Link Tujuan (URL)"
            type="text"
            placeholder="Enter link tujuan (url)"
            disabled={isLoading}
            
            
            
          />
          <FormInput
            name="sequence"
            label="Urutan Tampil"
            type="number"
            placeholder="0"
            disabled={isLoading}
            
            
            
          />
          <FormCheckbox
            name="isActive"
            label="Aktif"
            disabled={isLoading}
          />
          <FormTextarea
            name="description"
            label="Keterangan"
            placeholder="Enter keterangan"
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
