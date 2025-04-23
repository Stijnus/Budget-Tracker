import { useEffect, useState } from "react";
import {
  ThemeProviderProps,
  ThemeProviderContext,
  THEME_STORAGE_KEY,
  Theme,
} from "./themeUtils";

// Re-export the hook for convenience
export { useTheme } from "./themeUtils";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
  ...props
}: ThemeProviderProps) {
  // Initialize theme from localStorage or use default
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get from localStorage
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
      return storedTheme;
    }
    return defaultTheme;
  });

  // Apply theme changes to document
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove("light", "dark");

    // Apply new theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      root.style.colorScheme = systemTheme;
    } else {
      root.classList.add(theme);
      root.style.colorScheme = theme;
    }

    // Store theme in localStorage
    localStorage.setItem(storageKey, theme);

    // Also update userSettings in localStorage if it exists
    try {
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        settings.theme = theme;
        localStorage.setItem("userSettings", JSON.stringify(settings));
      }
    } catch (error) {
      console.error("Error updating theme in userSettings:", error);
    }
  }, [theme, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      const newTheme = mediaQuery.matches ? "dark" : "light";
      root.classList.add(newTheme);
      root.style.colorScheme = newTheme;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Hook is now imported from themeUtils.ts
