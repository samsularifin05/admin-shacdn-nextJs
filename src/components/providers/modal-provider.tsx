import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/stores/modal-store";
import { useEffect, useState } from "react";

export function ModalProvider() {
  const { isOpen, onClose, type, data } = useModalStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // You can add logic here to render different modal contents based on 'type'
  // For now, this is a generic implementation
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data.title || "Modal Title"}</DialogTitle>
          {data.description && (
            <DialogDescription>{data.description}</DialogDescription>
          )}
        </DialogHeader>

        {/* Modal body based on type or passed custom content */}
        <div className="py-4 text-sm">
          {typeof data.content === "function"
            ? data.content(data)
            : data.content || "Modal Content"}
        </div>

        {/* Optional footer actions passed via data */}
        {data.footer && (
          <div className="flex justify-end gap-2 pt-4">{data.footer}</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
