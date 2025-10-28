export type AppTheme = "light" | "dark";

export type ThemeDefinition = {
  value: AppTheme;
  labelKey: string;
  colorScheme: "light" | "dark";
};

export const themes: Record<AppTheme, ThemeDefinition> = {
  light: {
    value: "light",
    labelKey: "theme.themes.light",
    colorScheme: "light"
  },
  dark: {
    value: "dark",
    labelKey: "theme.themes.dark",
    colorScheme: "dark"
  }
};

export const themeList: ThemeDefinition[] = Object.values(themes);
