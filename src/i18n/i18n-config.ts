import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: { nativeName: "English", flag: "🇬🇧" },
  nl: { nativeName: "Nederlands", flag: "🇳🇱" },
  fr: { nativeName: "Français", flag: "🇫🇷" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },
};

// Define namespaces
export const NAMESPACES = ["common", "dashboard", "settings", "groups", "nav"];

// Initialize i18next
i18n
  // Load translations from backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize
  .init({
    // Default namespace
    defaultNS: "common",
    // List of namespaces
    ns: NAMESPACES,
    // Default language
    fallbackLng: "en",
    // Debug mode (set to true to see console logs)
    debug: true,
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
    // Backend options
    backend: {
      // Path to load translations from
      loadPath: "/src/i18n/locales/{{lng}}/{{ns}}.json",
    },
    // Handle missing keys
    saveMissing: true,
    missingKeyHandler: (lng, ns, key) => {
      console.warn(
        `Missing translation key: ${key} in namespace: ${ns} for language: ${lng}`
      );
    },
    // Important: Don't use key separator since our keys already include dots
    keySeparator: false,
    // Don't use namespace separator
    nsSeparator: false,
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
export const t = (key: string, options?: Record<string, unknown>): string => {
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
