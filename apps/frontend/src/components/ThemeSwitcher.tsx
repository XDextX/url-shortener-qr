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
        className="field mt-0 w-auto px-2 py-1 text-sm"
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
