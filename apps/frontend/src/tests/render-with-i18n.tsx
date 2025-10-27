import { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { AppI18nProvider } from "@/i18n/provider";
import { initI18n } from "@/i18n";

const testI18n = initI18n({ lng: "en", detection: false });

export const renderWithI18n = (ui: ReactElement, options?: RenderOptions) => {
  return render(<AppI18nProvider instance={testI18n}>{ui}</AppI18nProvider>, options);
};
