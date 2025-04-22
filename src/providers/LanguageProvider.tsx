import { ReactNode, createContext, useContext, useEffect } from "react";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Define the supported languages
export const LANGUAGES = {
  en: { nativeName: "English", flag: "🇬🇧" },
  nl: { nativeName: "Nederlands", flag: "🇳🇱" },
  fr: { nativeName: "Français", flag: "🇫🇷" },
  de: { nativeName: "Deutsch", flag: "🇩🇪" },
};

// Create a context for the language provider
type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  t: (key: string, options?: any) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          // Common
          "app.name": "Budget Tracker",
          "common.save": "Save",
          "common.cancel": "Cancel",
          "common.delete": "Delete",
          "common.edit": "Edit",
          "common.add": "Add",
          "common.loading": "Loading...",
          "common.error": "An error occurred",
          "common.success": "Success",
          "common.search": "Search",
          "common.help": "Help",
          "common.notifications": "Notifications",
          "common.login": "Login",
          "common.logout": "Logout",
          "common.darkMode": "Dark Mode",
          "common.lightMode": "Light Mode",
          "common.systemMode": "System Mode",
          "common.quickAdd": "Quick Add",
          "common.newExpense": "New Expense",
          "common.newIncome": "New Income",
          "common.newBudget": "New Budget",
          "common.newGoal": "New Goal",
          "common.newTag": "New Tag",

          // Navigation
          "nav.dashboard": "Dashboard",
          "nav.transactions": "Transactions",
          "nav.expenses": "Expenses",
          "nav.income": "Income",
          "nav.categories": "Categories",
          "nav.bills": "Bills & Subscriptions",
          "nav.budgets": "Budgets",
          "nav.goals": "Goals",
          "nav.analytics": "Analytics",
          "nav.settings": "Settings",

          // Dashboard
          "dashboard.title": "Dashboard",
          "dashboard.welcome": "Welcome back",
          "dashboard.summary": "Financial Summary",
          "dashboard.recent": "Recent Transactions",
          "dashboard.overview": "Overview",
          "dashboard.finances": "Finances",
          "dashboard.goals": "Goals",
          "dashboard.billReminders": "Bill Reminders",
          "dashboard.budgetProgress": "Budget Progress",
          "dashboard.expenseCategories": "Expense Categories",
          "common.user": "User",
          "common.viewAll": "View All",

          // Settings
          "settings.title": "Settings",
          "settings.profile": "Profile",
          "settings.password": "Password",
          "settings.preferences": "Preferences",
          "settings.notifications": "Notifications",
          "settings.currency": "Currency",
          "settings.theme": "Theme",
          "settings.language": "Language",
          "settings.account": "Account",
        },
      },
      nl: {
        translation: {
          // Common
          "app.name": "Budget Tracker",
          "common.save": "Opslaan",
          "common.cancel": "Annuleren",
          "common.delete": "Verwijderen",
          "common.edit": "Bewerken",
          "common.add": "Toevoegen",
          "common.loading": "Laden...",
          "common.error": "Er is een fout opgetreden",
          "common.success": "Succes",
          "common.search": "Zoeken",
          "common.help": "Hulp",
          "common.notifications": "Meldingen",
          "common.login": "Inloggen",
          "common.logout": "Uitloggen",
          "common.darkMode": "Donkere Modus",
          "common.lightMode": "Lichte Modus",
          "common.systemMode": "Systeem Modus",
          "common.quickAdd": "Snel Toevoegen",
          "common.newExpense": "Nieuwe Uitgave",
          "common.newIncome": "Nieuwe Inkomst",
          "common.newBudget": "Nieuw Budget",
          "common.newGoal": "Nieuw Doel",
          "common.newTag": "Nieuwe Tag",

          // Navigation
          "nav.dashboard": "Dashboard",
          "nav.transactions": "Transacties",
          "nav.expenses": "Uitgaven",
          "nav.income": "Inkomsten",
          "nav.categories": "Categorieën",
          "nav.bills": "Rekeningen & Abonnementen",
          "nav.budgets": "Budgetten",
          "nav.goals": "Doelen",
          "nav.analytics": "Analyses",
          "nav.settings": "Instellingen",

          // Dashboard
          "dashboard.title": "Dashboard",
          "dashboard.welcome": "Welkom terug",
          "dashboard.summary": "Financieel Overzicht",
          "dashboard.recent": "Recente Transacties",
          "dashboard.overview": "Overzicht",
          "dashboard.finances": "Financiën",
          "dashboard.goals": "Doelen",
          "dashboard.billReminders": "Betalingsherinneringen",
          "dashboard.budgetProgress": "Budget Voortgang",
          "dashboard.expenseCategories": "Uitgavencategorieën",
          "common.user": "Gebruiker",
          "common.viewAll": "Bekijk Alles",

          // Settings
          "settings.title": "Instellingen",
          "settings.profile": "Profiel",
          "settings.password": "Wachtwoord",
          "settings.preferences": "Voorkeuren",
          "settings.notifications": "Notificaties",
          "settings.currency": "Valuta",
          "settings.theme": "Thema",
          "settings.language": "Taal",
          "settings.account": "Account",
        },
      },
      fr: {
        translation: {
          // Common
          "app.name": "Budget Tracker",
          "common.save": "Enregistrer",
          "common.cancel": "Annuler",
          "common.delete": "Supprimer",
          "common.edit": "Modifier",
          "common.add": "Ajouter",
          "common.loading": "Chargement...",
          "common.error": "Une erreur est survenue",
          "common.success": "Succès",
          "common.search": "Rechercher",
          "common.help": "Aide",
          "common.notifications": "Notifications",
          "common.login": "Connexion",
          "common.logout": "Déconnexion",
          "common.darkMode": "Mode Sombre",
          "common.lightMode": "Mode Clair",
          "common.systemMode": "Mode Système",
          "common.quickAdd": "Ajout Rapide",
          "common.newExpense": "Nouvelle Dépense",
          "common.newIncome": "Nouveau Revenu",
          "common.newBudget": "Nouveau Budget",
          "common.newGoal": "Nouvel Objectif",
          "common.newTag": "Nouvelle Étiquette",

          // Navigation
          "nav.dashboard": "Tableau de bord",
          "nav.transactions": "Transactions",
          "nav.expenses": "Dépenses",
          "nav.income": "Revenus",
          "nav.categories": "Catégories",
          "nav.bills": "Factures & Abonnements",
          "nav.budgets": "Budgets",
          "nav.goals": "Objectifs",
          "nav.analytics": "Analyses",
          "nav.settings": "Paramètres",

          // Dashboard
          "dashboard.title": "Tableau de bord",
          "dashboard.welcome": "Bienvenue",
          "dashboard.summary": "Résumé financier",
          "dashboard.recent": "Transactions récentes",
          "dashboard.overview": "Aperçu",
          "dashboard.finances": "Finances",
          "dashboard.goals": "Objectifs",
          "dashboard.billReminders": "Rappels de factures",
          "dashboard.budgetProgress": "Progression du budget",
          "dashboard.expenseCategories": "Catégories de dépenses",
          "common.user": "Utilisateur",
          "common.viewAll": "Voir tout",

          // Settings
          "settings.title": "Paramètres",
          "settings.profile": "Profil",
          "settings.password": "Mot de passe",
          "settings.preferences": "Préférences",
          "settings.notifications": "Notifications",
          "settings.currency": "Devise",
          "settings.theme": "Thème",
          "settings.language": "Langue",
          "settings.account": "Compte",
        },
      },
      de: {
        translation: {
          // Common
          "app.name": "Budget Tracker",
          "common.save": "Speichern",
          "common.cancel": "Abbrechen",
          "common.delete": "Löschen",
          "common.edit": "Bearbeiten",
          "common.add": "Hinzufügen",
          "common.loading": "Wird geladen...",
          "common.error": "Ein Fehler ist aufgetreten",
          "common.success": "Erfolg",
          "common.search": "Suchen",
          "common.help": "Hilfe",
          "common.notifications": "Benachrichtigungen",
          "common.login": "Anmelden",
          "common.logout": "Abmelden",
          "common.darkMode": "Dunkelmodus",
          "common.lightMode": "Hellmodus",
          "common.systemMode": "Systemmodus",
          "common.quickAdd": "Schnell Hinzufügen",
          "common.newExpense": "Neue Ausgabe",
          "common.newIncome": "Neue Einnahme",
          "common.newBudget": "Neues Budget",
          "common.newGoal": "Neues Ziel",
          "common.newTag": "Neues Schlagwort",

          // Navigation
          "nav.dashboard": "Dashboard",
          "nav.transactions": "Transaktionen",
          "nav.expenses": "Ausgaben",
          "nav.income": "Einkommen",
          "nav.categories": "Kategorien",
          "nav.bills": "Rechnungen & Abonnements",
          "nav.budgets": "Budgets",
          "nav.goals": "Ziele",
          "nav.analytics": "Analysen",
          "nav.settings": "Einstellungen",

          // Dashboard
          "dashboard.title": "Dashboard",
          "dashboard.welcome": "Willkommen zurück",
          "dashboard.summary": "Finanzübersicht",
          "dashboard.recent": "Neueste Transaktionen",
          "dashboard.overview": "Übersicht",
          "dashboard.finances": "Finanzen",
          "dashboard.goals": "Ziele",
          "dashboard.billReminders": "Rechnungserinnerungen",
          "dashboard.budgetProgress": "Budget-Fortschritt",
          "dashboard.expenseCategories": "Ausgabenkategorien",
          "common.user": "Benutzer",
          "common.viewAll": "Alle anzeigen",

          // Settings
          "settings.title": "Einstellungen",
          "settings.profile": "Profil",
          "settings.password": "Passwort",
          "settings.preferences": "Präferenzen",
          "settings.notifications": "Benachrichtigungen",
          "settings.currency": "Währung",
          "settings.theme": "Thema",
          "settings.language": "Sprache",
          "settings.account": "Konto",
        },
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
  });

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
