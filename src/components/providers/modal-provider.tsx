import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "@/stores/modal-store";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ModalProvider() {
  const { isOpen, onClose, type, data } = useModalStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const modalSizes = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    full: "sm:max-w-[95vw]",
  };

  const modalPositions = {
    center: "top-[50%] translate-y-[-50%]",
    top: "top-[10%] translate-y-0",
  };

  const sizeClass = modalSizes[data.size as keyof typeof modalSizes] || "";
  const positionKey = (data.position as keyof typeof modalPositions) || "top";
  const positionClass = modalPositions[positionKey];

  const selectedClassName = cn(
    sizeClass || data.className || "sm:max-w-[425px]",
    "left-[50%] translate-x-[-50%]",
    positionClass
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={selectedClassName}>
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
