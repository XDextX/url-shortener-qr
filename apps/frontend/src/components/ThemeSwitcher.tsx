import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useTheme, themeList, type AppTheme } from "@/theme";

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as AppTheme);
  };

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
      <span>{t("theme.label")}</span>
      <select
        value={theme}
        onChange={handleChange}
        className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-text-primary shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        {themeList.map((entry) => (
          <option key={entry.value} value={entry.value}>
            {t(entry.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
};
