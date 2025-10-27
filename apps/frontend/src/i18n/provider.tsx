import { ReactNode, useMemo } from "react";
import type { i18n as I18nInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { initI18n, type AppLanguage } from "./index";

interface AppI18nProviderProps {
  children: ReactNode;
  language?: AppLanguage;
  instance?: I18nInstance;
}

export const AppI18nProvider = ({ children, language, instance }: AppI18nProviderProps) => {
  const i18nInstance = useMemo(() => {
    if (instance) {
      if (language) {
        void instance.changeLanguage(language);
      }
      return instance;
    }

    return initI18n({ lng: language });
  }, [instance, language]);

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
};
