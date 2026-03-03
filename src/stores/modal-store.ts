import { create } from "zustand";
import type { ReactNode } from "react";

type ModalType = "default" | "delete" | "form" | "confirm" | string;
export type ModalSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "full";

export type ModalPosition = "center" | "top";

export interface ModalData {
  title?: string;
  description?: string;
  content?: ReactNode | ((data: ModalData) => ReactNode);
  footer?: ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  className?: string;
}

interface ModalState {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false }),
}));
