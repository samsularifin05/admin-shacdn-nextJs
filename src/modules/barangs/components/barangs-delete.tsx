import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useModalStore } from "@/stores/modal-store";
import { Barang } from "../types/barangs.schema";
import { barangService } from "../services/barangs.service";

interface BarangDeleteProps {
  barang: Barang;
  onSuccess?: () => void;
}

export function BarangDelete({ barang: row, onSuccess }: BarangDeleteProps) {
  const { onClose } = useModalStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await barangService.delete(row.id);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
        <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Confirm Deletion</p>
          <p className="text-sm opacity-90">
            Are you sure you want to delete <strong>{row.kodeBarang}</strong>? This action is permanent and cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="min-w-[100px]"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            "Delete Barang"
          )}
        </Button>
      </div>
    </div>
  );
}
