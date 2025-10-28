import { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { AppI18nProvider } from "@/i18n/provider";
import { initI18n } from "@/i18n";
import { ThemeProvider } from "@/theme";

const testI18n = initI18n({ lng: "en", detection: false });

export const renderWithI18n = (ui: ReactElement, options?: RenderOptions) => {
  return render(
    <ThemeProvider initialTheme="light">
      <AppI18nProvider instance={testI18n}>{ui}</AppI18nProvider>
    </ThemeProvider>,
    options
  );
};
