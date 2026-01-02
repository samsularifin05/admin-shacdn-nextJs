export interface ButtonConfig<TData> {
  label?: string;
  icon?: React.ReactNode;
  onClick?: (row?: TData) => void;
  show?: boolean;
  isAdd?: boolean;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean | ((row?: TData) => boolean);
}
