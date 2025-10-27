import i18n, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resources, { type AppLanguage } from "./resources";

const DEFAULT_NAMESPACE = "common";
const FALLBACK_LANGUAGE: AppLanguage = "es";

type InitI18nOptions = {
  lng?: AppLanguage;
  detection?: boolean;
};

let initialized = false;

const createInstance = (options: InitI18nOptions = {}): I18nInstance => {
  const detectorsEnabled = options.detection ?? true;

  if (!initialized) {
    const instance = i18n;

    if (detectorsEnabled) {
      instance.use(LanguageDetector);
    }

    instance.use(initReactI18next).init({
      resources,
      fallbackLng: FALLBACK_LANGUAGE,
      defaultNS: DEFAULT_NAMESPACE,
      interpolation: {
        escapeValue: false
      },
      detection: detectorsEnabled
        ? {
            order: ["localStorage", "navigator", "htmlTag"],
            lookupLocalStorage: "app_language"
          }
        : undefined
    });

    initialized = true;
  }

  if (options.lng) {
    void i18n.changeLanguage(options.lng);
  }

  return i18n;
};

export const initI18n = (options?: InitI18nOptions): I18nInstance => {
  return createInstance(options);
};

export const supportedLanguages = Object.keys(resources) as AppLanguage[];
export type { AppLanguage };

export { resources };
