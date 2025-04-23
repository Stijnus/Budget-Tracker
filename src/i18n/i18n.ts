import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import { translations } from "./translations.fixed";

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: translations,
  lng: "en", // Force English language
  fallbackLng: "en",
  debug: true, // Enable debug mode to help diagnose issues
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  // Important: Don't use key separator since our keys already include dots
  keySeparator: false,
  // Don't use namespace separator
  nsSeparator: false,
});

export default i18n;
