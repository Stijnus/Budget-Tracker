import { createContext, useContext } from "react";

// Define the supported languages
export const LANGUAGES = {
  en: { nativeName: "English", flag: "🇬🇧" },
  nl: { nativeName: "Nederlands", flag: "🇳🇱" },
  fr: { nativeName: "Français", flag: "🇫🇷" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },
};

// Create a context for the language provider
export type TranslationOptions = {
  [key: string]: string | number | boolean | Date | TranslationOptions;
};

export type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  t: (key: string, options?: TranslationOptions) => string;
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
