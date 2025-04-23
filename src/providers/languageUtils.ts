import { createContext, useContext } from "react";
import { SUPPORTED_LANGUAGES } from "../i18n/translations-loader";

// Re-export the supported languages
export const LANGUAGES = SUPPORTED_LANGUAGES;

// Create a context for the language provider
export type TranslationOptions = {
  [key: string]: string | number | boolean | Date | TranslationOptions;
};

export type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  t: (key: string, options?: TranslationOptions) => string;
  // Add namespace support
  i18n: {
    language: string;
    changeLanguage: (lang: string) => Promise<void>;
  };
};

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Create a hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
