import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingText?: string;
  }
>;

const BASE_BUTTON_CLASS =
  "flex items-center justify-center rounded-md bg-accent px-4 py-2 font-medium text-accent-contrast ring-accent ring-offset-2 ring-offset-surface transition hover:ring-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-accent-muted disabled:ring-0";

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
