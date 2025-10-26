import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingText?: string;
  }
>;

const BASE_BUTTON_CLASS =
  "flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300";

/**
 * Reusable button component that handles loading states and shared styling.
 */
export const Button = ({
  children,
  className,
  disabled,
  loading = false,
  loadingText,
  type = "button",
  ...props
}: ButtonProps) => {
  const composedClassName = [BASE_BUTTON_CLASS, className].filter(Boolean).join(" ");
  const isDisabled = (disabled ?? false) || loading;

  return (
    <button type={type} className={composedClassName} disabled={isDisabled} {...props}>
      {loading ? loadingText ?? children : children}
    </button>
  );
};
