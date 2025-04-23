import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Import translations (for now, we'll keep using the existing translations)
import { translations } from "./translations";

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: { nativeName: "English", flag: "🇬🇧" },
  nl: { nativeName: "Nederlands", flag: "🇳🇱" },
  fr: { nativeName: "Français", flag: "🇫🇷" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },
};

// Initialize i18next
i18n
  // Load translations from backend (for future use)
  // .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize
  .init({
    // For now, use the existing translations
    resources: translations,
    // Default language
    fallbackLng: "en",
    // Debug mode (set to true to see console logs)
    debug: process.env.NODE_ENV === "development",
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // Detection options
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
    // Other options
    react: {
      useSuspense: true,
    },
  });

// Export for use in components
export { i18n };

// Helper function to change language
export const changeLanguage = async (lang: string): Promise<void> => {
  await i18n.changeLanguage(lang);
  
  // Update localStorage
  try {
    const userSettings = localStorage.getItem("userSettings");
    if (userSettings) {
      const settings = JSON.parse(userSettings);
      settings.language = lang;
      localStorage.setItem("userSettings", JSON.stringify(settings));
    } else {
      localStorage.setItem("userSettings", JSON.stringify({ language: lang }));
    }
  } catch (error) {
    console.error("Error updating user settings:", error);
  }
};

// Export a type-safe translation function
export const t = (key: string, options?: Record<string, any>): string => {
  return i18n.t(key, options);
};

// Export a hook for functional components
export const useTranslation = () => {
  return {
    t,
    i18n,
    changeLanguage,
  };
};
