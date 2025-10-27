import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/index.css";
import { AppI18nProvider } from "@/i18n/provider";
import { initI18n } from "@/i18n";

initI18n();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppI18nProvider>
      <App />
    </AppI18nProvider>
  </React.StrictMode>
);
