import enCommon from "./en/common.json";
import esCommon from "./es/common.json";

export const resources = {
  en: {
    common: enCommon
  },
  es: {
    common: esCommon
  }
} as const;

export type AppLanguage = keyof typeof resources;
export type AppNamespaces = keyof (typeof resources)[AppLanguage];

export default resources;
