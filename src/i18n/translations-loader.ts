import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import intervalPlural from "i18next-intervalplural-postprocessor";
import Backend from "i18next-http-backend";

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: { nativeName: "English", flag: "🇬🇧" },
  nl: { nativeName: "Nederlands", flag: "🇳🇱" },
  fr: { nativeName: "Français", flag: "🇫🇷" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },
};

// Define namespaces
export const NAMESPACES = [
  "common",
  "dashboard",
  "settings",
  "groups",
  "nav",
  "welcome",
  "footer",
];

const isDevelopment = process.env.NODE_ENV === "development";

i18n
  .use(Backend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(intervalPlural)
  .init({
    // Lazy load translations
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
      addPath: isDevelopment ? "/locales/add/{{lng}}/{{ns}}" : undefined,
    },

    // Default namespace
    defaultNS: "common",

    // List of namespaces
    ns: NAMESPACES,

    // Language configuration
    lng: undefined, // Let the language detector figure it out
    fallbackLng: "en",
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),

    // Development features
    debug: isDevelopment,
    saveMissing: isDevelopment,

    // Performance options
    load: "languageOnly", // Only load language code, not region (e.g., 'en' instead of 'en-US')
    preload: ["en"], // Preload English as fallback

    interpolation: {
      escapeValue: false,
      format: function (value, format, lng) {
        if (!value) return "";

        if (format === "uppercase") return value.toUpperCase();
        if (format === "lowercase") return value.toLowerCase();

        if (value instanceof Date) {
          return new Intl.DateTimeFormat(lng).format(value);
        }

        if (format === "number") {
          return new Intl.NumberFormat(lng).format(value);
        }

        if (format === "currency") {
          return new Intl.NumberFormat(lng, {
            style: "currency",
            currency: "EUR",
          }).format(value);
        }

        return value;
      },
    },

    // Detection configuration
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "userSettings",
      caches: ["localStorage"],
    },

    // Missing translation handling
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      if (isDevelopment) {
        console.warn(
          `Missing translation - Language: ${lng}, Namespace: ${ns}, Key: ${key}, Fallback: ${fallbackValue}`
        );
      }
    },

    // Separator configuration
    keySeparator: false,
    nsSeparator: false,
    pluralSeparator: "_",
    contextSeparator: "_",
  });

// Export for use in components
export { i18n };

// Helper function to change language
export const changeLanguage = async (lang: string): Promise<void> => {
  if (!Object.keys(SUPPORTED_LANGUAGES).includes(lang)) {
    console.error(`Language ${lang} is not supported`);
    return;
  }

  await i18n.changeLanguage(lang);

  try {
    const userSettings = localStorage.getItem("userSettings");
    const settings = userSettings ? JSON.parse(userSettings) : {};
    settings.language = lang;
    localStorage.setItem("userSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error updating user settings:", error);
  }
};

// Export a type-safe translation function
export const t = (key: string, options?: Record<string, unknown>): string => {
  return i18n.t(key, options);
};

// Export a hook for functional components with loading state
export const useTranslation = () => {
  return {
    t,
    i18n,
    changeLanguage,
    isLoading: !i18n.isInitialized,
  };
};

// Export loading check utility
export const isI18nInitialized = () => i18n.isInitialized;
