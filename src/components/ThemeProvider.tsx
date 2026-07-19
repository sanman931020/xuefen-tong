"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => undefined,
});

const STORAGE_KEY = "xuefen-theme";

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: string | null;
}) {
  const [theme, setThemeState] = useState<ThemeId>(() =>
    isThemeId(initialTheme) ? initialTheme : DEFAULT_THEME
  );

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isThemeId(saved)) {
      setThemeState(saved);
      applyTheme(saved);
      return;
    }
    applyTheme(theme);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
