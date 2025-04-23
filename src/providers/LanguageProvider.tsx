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
          "common.create": "Create",
          "common.creating": "Creating...",
          "common.loading": "Loading...",
          "common.error": "An error occurred",
          "common.success": "Success",
          "common.somethingWentWrong": "Something went wrong",
          "common.itemCreated": "{{item}} created successfully",
          "common.itemUpdated": "{{item}} updated successfully",
          "common.itemDeleted": "{{item}} deleted successfully",
          "common.transaction": "Transaction",
          "common.budget": "Budget",
          "common.category": "Category",
          "common.goal": "Goal",
          "common.bill": "Bill",
          "common.subscription": "Subscription",
          "common.tag": "Tag",
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
          "nav.accounts": "Bank Accounts",
          "nav.groups": "Budget Groups",
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

          // Groups
          "groups.title": "Budget Groups",
          "groups.description":
            "Manage shared budgets with family, friends, or team members",
          "groups.myGroups": "My Groups",
          "groups.invitations": "Invitations",
          "groups.createGroup": "Create Group",
          "groups.createGroupDescription":
            "Create a new budget group to collaborate with others",
          "groups.groupName": "Group Name",
          "groups.groupNamePlaceholder": "Enter group name",
          "groups.groupDescription": "Description",
          "groups.groupDescriptionPlaceholder": "Enter group description",
          "groups.noGroups": "No Groups",
          "groups.noGroupsDescription": "You don't have any budget groups yet",
          "groups.createGroupPrompt":
            "Create a group to start collaborating on budgets with others",
          "groups.noInvitations": "No Invitations",
          "groups.noInvitationsDescription":
            "You don't have any pending invitations",
          "groups.invitationPrompt":
            "When someone invites you to a group, it will appear here",
          "groups.viewGroup": "View Group",
          "groups.inactive": "Inactive",
          "groups.noDescription": "No description",
          "groups.membersCount": "{{count}} members",
          "groups.invitedBy": "Invited by",
          "groups.expiresOn": "Expires on",
          "groups.accept": "Accept",
          "groups.decline": "Decline",
          "groups.roleAdmin": "Admin",
          "groups.roleMember": "Member",
          "groups.roleViewer": "Viewer",
          "groups.roleOwner": "Owner",
          "groups.inviteMember": "Invite Member",
          "groups.inviteMemberDescription":
            "Invite someone to join this budget group",
          "groups.email": "Email Address",
          "groups.emailPlaceholder": "Enter email address",
          "groups.role": "Role",
          "groups.selectRole": "Select a role",
          "groups.roleAdminDescription":
            "Can manage group settings, members, and all financial data",
          "groups.roleMemberDescription":
            "Can add and edit transactions and budgets",
          "groups.roleViewerDescription":
            "Can only view data, cannot make changes",
          "groups.sendInvitation": "Send Invitation",
          "groups.invitationSent": "Invitation sent successfully",
          "groups.members": "Members",
          "groups.membersDescription": "Manage members of this budget group",
          "groups.you": "You",
          "groups.changeRole": "Change Role",
          "groups.changeRoleDescription": "Change role for {{name}}",
          "groups.removeMember": "Remove Member",
          "groups.removeMemberConfirmation":
            "Are you sure you want to remove {{name}} from this group?",
          "groups.generalSettings": "General Settings",
          "groups.generalSettingsDescription":
            "Manage group name, description, and status",
          "groups.activeStatus": "Active Status",
          "groups.activeStatusDescription":
            "When inactive, group members cannot add or edit data",
          "groups.dangerZone": "Danger Zone",
          "groups.dangerZoneDescription": "Destructive actions for this group",
          "groups.deleteGroup": "Delete Group",
          "groups.deleteGroupWarning":
            "This action cannot be undone. All group data will be permanently deleted.",
          "groups.deleteGroupConfirmation":
            "Are you sure you want to delete the group '{{name}}'?",
          "groups.deleteGroupWarningDetailed":
            "This will permanently delete all group transactions, budgets, and other data. Members will lose access to this group.",
          "groups.confirmDelete": "Yes, Delete Group",
          "groups.activityFeed": "Activity Feed",
          "groups.activityFeedDescription": "Recent activity in this group",
          "groups.noActivity": "No activity yet",
          "groups.activityTransactionCreated":
            "{{user}} added a {{type}} transaction for ${{amount}}",
          "groups.activityTransactionUpdated":
            "{{user}} updated a {{type}} transaction for ${{amount}}",
          "groups.activityTransactionDeleted":
            "{{user}} deleted a {{type}} transaction for ${{amount}}",
          "groups.activityBudgetCreated":
            "{{user}} created budget '{{name}}' for ${{amount}}",
          "groups.activityBudgetUpdated":
            "{{user}} updated budget '{{name}}' to ${{amount}}",
          "groups.activityBudgetDeleted": "{{user}} deleted budget '{{name}}'",
          "groups.activityMemberAdded": "{{user}} added {{member}} as {{role}}",
          "groups.activityMemberUpdated":
            "{{user}} changed {{member}}'s role to {{role}}",
          "groups.activityMemberRemoved":
            "{{user}} removed {{member}} from the group",
          "groups.activityGeneric": "{{user}} {{action}} a {{type}}",
          "groups.transactions": "Transactions",
          "groups.transactionsShort": "Transactions",
          "groups.budgets": "Budgets",
          "groups.budgetsShort": "Budgets",
          "groups.membersShort": "Members",
          "groups.activity": "Activity",
          "groups.activityShort": "Activity",
          "groups.settings": "Settings",
          "groups.settingsShort": "Settings",
          "groups.totalIncome": "Total Income",
          "groups.totalExpenses": "Total Expenses",
          "groups.balance": "Balance",
          "groups.addTransaction": "Add Transaction",
          "groups.noTransactions": "No transactions yet",
          "groups.date": "Date",
          "groups.descriptionField": "Description",
          "groups.category": "Category",
          "groups.amount": "Amount",
          "groups.createdBy": "Created By",
          "groups.uncategorized": "Uncategorized",
          "groups.editTransaction": "Edit Transaction",
          "groups.deleteTransaction": "Delete Transaction",
          "groups.deleteTransactionConfirmation":
            "Are you sure you want to delete this transaction?",
          "groups.transactionType": "Transaction Type",
          "groups.expense": "Expense",
          "groups.income": "Income",
          "groups.descriptionPlaceholder": "Enter description",
          "groups.selectCategory": "Select a category",
          "groups.paymentMethod": "Payment Method",
          "groups.selectPaymentMethod": "Select payment method",
          "groups.none": "None",
          "groups.cash": "Cash",
          "groups.creditCard": "Credit Card",
          "groups.debitCard": "Debit Card",
          "groups.bankTransfer": "Bank Transfer",
          "groups.mobilePayment": "Mobile Payment",
          "groups.other": "Other",
          "groups.status": "Status",
          "groups.selectStatus": "Select status",
          "groups.completed": "Completed",
          "groups.pending": "Pending",
          "groups.cancelled": "Cancelled",
          "groups.notes": "Notes",
          "groups.notesPlaceholder": "Enter additional notes",
          "groups.addBudget": "Add Budget",
          "groups.noBudgets": "No budgets yet",
          "groups.editBudget": "Edit Budget",
          "groups.deleteBudget": "Delete Budget",
          "groups.deleteBudgetConfirmation":
            "Are you sure you want to delete the budget '{{name}}'?",
          "groups.budgetName": "Budget Name",
          "groups.budgetNamePlaceholder": "Enter budget name",
          "groups.period": "Period",
          "groups.selectPeriod": "Select period",
          "groups.daily": "Daily",
          "groups.weekly": "Weekly",
          "groups.monthly": "Monthly",
          "groups.yearly": "Yearly",
          "groups.startDate": "Start Date",
          "groups.endDate": "End Date",
          "groups.noEndDate": "No end date",
          "groups.settingsSaved": "Group settings saved successfully",
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
          "common.create": "Aanmaken",
          "common.creating": "Aanmaken...",
          "common.loading": "Laden...",
          "common.error": "Er is een fout opgetreden",
          "common.success": "Succes",
          "common.somethingWentWrong": "Er is iets misgegaan",
          "common.itemCreated": "{{item}} succesvol aangemaakt",
          "common.itemUpdated": "{{item}} succesvol bijgewerkt",
          "common.itemDeleted": "{{item}} succesvol verwijderd",
          "common.transaction": "Transactie",
          "common.budget": "Budget",
          "common.category": "Categorie",
          "common.goal": "Doel",
          "common.bill": "Rekening",
          "common.subscription": "Abonnement",
          "common.tag": "Label",
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
          "nav.accounts": "Bankrekeningen",
          "nav.groups": "Budgetgroepen",
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
          "common.create": "Créer",
          "common.creating": "Création...",
          "common.loading": "Chargement...",
          "common.error": "Une erreur est survenue",
          "common.success": "Succès",
          "common.somethingWentWrong": "Quelque chose s'est mal passé",
          "common.itemCreated": "{{item}} créé avec succès",
          "common.itemUpdated": "{{item}} mis à jour avec succès",
          "common.itemDeleted": "{{item}} supprimé avec succès",
          "common.transaction": "Transaction",
          "common.budget": "Budget",
          "common.category": "Catégorie",
          "common.goal": "Objectif",
          "common.bill": "Facture",
          "common.subscription": "Abonnement",
          "common.tag": "Étiquette",
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
          "nav.accounts": "Comptes Bancaires",
          "nav.groups": "Groupes de Budget",
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
          "common.create": "Erstellen",
          "common.creating": "Erstellen...",
          "common.loading": "Wird geladen...",
          "common.error": "Ein Fehler ist aufgetreten",
          "common.success": "Erfolg",
          "common.somethingWentWrong": "Etwas ist schief gelaufen",
          "common.itemCreated": "{{item}} erfolgreich erstellt",
          "common.itemUpdated": "{{item}} erfolgreich aktualisiert",
          "common.itemDeleted": "{{item}} erfolgreich gelöscht",
          "common.transaction": "Transaktion",
          "common.budget": "Budget",
          "common.category": "Kategorie",
          "common.goal": "Ziel",
          "common.bill": "Rechnung",
          "common.subscription": "Abonnement",
          "common.tag": "Etikett",
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
          "nav.accounts": "Bankkonten",
          "nav.groups": "Budgetgruppen",
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
