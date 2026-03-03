import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type ModalPosition,
  type ModalSize,
  useModalStore,
} from "@/stores/modal-store";
import { cn } from "@/lib/utils";

export function ModalProvider() {
  const { isOpen, onClose, data } = useModalStore();

  const modalSizes: Record<ModalSize, string> = {
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

  const modalPositions: Record<ModalPosition, string> = {
    center: "",
    top: "",
  };

  const sizeClass = modalSizes[data.size ?? "md"];
  const positionKey = data.position ?? "top";
  const positionClass = modalPositions[positionKey];

  const selectedClassName = cn(
    "sm:max-w-[425px]",
    sizeClass,
    data.className,
    positionClass
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={selectedClassName} overlayScrollable>
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
