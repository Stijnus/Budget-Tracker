import { ReactNode, createContext, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Define the supported languages
export const LANGUAGES = {
  en: { nativeName: "English", flag: "🇬🇧" },
  nl: { nativeName: "Nederlands", flag: "🇳🇱" },
  fr: { nativeName: "Français", flag: "🇫🇷" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },
};

// Create a context for the language provider
type TranslationOptions = {
  [key: string]: string | number | boolean | Date | TranslationOptions;
};

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  t: (key: string, options?: TranslationOptions) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

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

// Create a hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
