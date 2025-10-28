import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguages, type AppLanguage } from "@/i18n";

const LANGUAGE_ORDER: AppLanguage[] = ["es", "en"];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const current = (i18n.language ?? "es").split("-")[0] as AppLanguage;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value as AppLanguage;
    void i18n.changeLanguage(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app_language", nextLanguage);
    }
  };

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
      <span>{t("app.languageLabel")}</span>
      <select
        value={current}
        onChange={handleChange}
        className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-text-primary shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {LANGUAGE_ORDER.filter((code) => supportedLanguages.includes(code)).map((code) => (
          <option key={code} value={code}>
            {t(`app.languages.${code}`)}
          </option>
        ))}
      </select>
    </label>
  );
};
