import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { AppI18nProvider } from "@/i18n/provider";
import { initI18n } from "@/i18n";
import { ThemeProvider, initializeTheme } from "@/theme";

initI18n();
const initialTheme = initializeTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider initialTheme={initialTheme}>
      <AppI18nProvider>
        <App />
      </AppI18nProvider>
    </ThemeProvider>
  </React.StrictMode>
);
