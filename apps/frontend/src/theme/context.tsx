import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { themeList, themes, type AppTheme, type ThemeDefinition } from "./themes";

const STORAGE_KEY = "app_theme";

type ThemeContextValue = {
  theme: AppTheme;
  themes: ThemeDefinition[];
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const FALLBACK_THEME: AppTheme = "light";

const getStoredTheme = (): AppTheme | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  return stored === "light" || stored === "dark" ? stored : null;
};

const getSystemTheme = (): AppTheme => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return FALLBACK_THEME;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: AppTheme): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = themes[theme].colorScheme;
};

const resolveInitialTheme = (explicit?: AppTheme | null): AppTheme => {
  if (explicit) {
    return explicit;
  }

  const stored = getStoredTheme();
  if (stored) {
    return stored;
  }

  return getSystemTheme();
};

export type ThemeProviderProps = PropsWithChildren<{
  initialTheme?: AppTheme | null;
}>;

export const ThemeProvider = ({ children, initialTheme }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const resolved = resolveInitialTheme(initialTheme);
    applyTheme(resolved);
    return resolved;
  });

  useEffect(() => {
    applyTheme(theme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);


  const setTheme = (next: AppTheme) => {
    setThemeState(next);
  };

  const toggleTheme = () => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === "dark",
      themes: themeList
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return ctx;
};

export const initializeTheme = (): AppTheme => {
  if (typeof document === "undefined") {
    return FALLBACK_THEME;
  }

  const resolved = resolveInitialTheme();
  applyTheme(resolved);
  return resolved;
};

export { themes, themeList };
