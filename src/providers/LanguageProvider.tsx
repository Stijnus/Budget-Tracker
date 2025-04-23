import { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "./languageUtils";

// Re-export for convenience
export { useLanguage, LANGUAGES } from "./languageUtils";

// Create the language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, t } = useTranslation();

  // Get user settings from localStorage
  useEffect(() => {
    try {
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        if (settings.language && settings.language !== i18n.language) {
          i18n.changeLanguage(settings.language);
        }
      }
    } catch (error) {
      console.error("Error parsing user settings:", error);
    }
  }, [i18n]);

  // Function to change the language
  const changeLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);

    // Update user settings in localStorage
    try {
      const userSettings = localStorage.getItem("userSettings");
      if (userSettings) {
        const settings = JSON.parse(userSettings);
        settings.language = lang;
        localStorage.setItem("userSettings", JSON.stringify(settings));
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language: i18n.language,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Hook is now imported from languageUtils.ts
