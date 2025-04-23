import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CategoryPage } from "./pages/CategoryPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { TransactionPage } from "./pages/TransactionPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { IncomePage } from "./pages/IncomePage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { TagsPage } from "./pages/TagsPage";
import { TagPage } from "./pages/TagPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { BillsPage } from "./pages/BillsPage";
import { BillPage } from "./pages/BillPage";
import { GoalsPage } from "./pages/GoalsPage";
import { GoalPage } from "./pages/GoalPage";
import { BudgetPage } from "./pages/BudgetPage";
import { BankAccountsPage } from "./pages/BankAccountsPage";
import { BankAccountPage } from "./pages/BankAccountPage";
import { GroupsPage } from "./pages/GroupsPage";
import { GroupPage } from "./pages/GroupPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AuthProvider } from "./state/auth"; // Using the AuthProvider from auth.tsx
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DatabaseCheck } from "./components/DatabaseCheck";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { ToastProvider } from "./shared/components/Toast";
import { WelcomeModal } from "./shared/components/WelcomeModal";
// Translation debugger removed
import { KeyboardShortcutsProvider } from "./shared/components/KeyboardShortcutsProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
// Language provider removed
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userName] = useState("");

  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem("hasVisitedBefore");
    if (!hasVisitedBefore) {
      // Wait a bit before showing the welcome modal
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
        localStorage.setItem("hasVisitedBefore", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle welcome modal close
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>
              <Router>
                <KeyboardShortcutsProvider>
                  <Routes>
                    {/*
                      PAGE NAMING CONVENTION:
                      - List/Index Pages (Plural): Pages that show a list of items use plural names (e.g., GoalsPage, BudgetsPage)
                      - Detail/Form Pages (Singular): Pages for creating or editing a single item use singular names (e.g., GoalPage, BudgetPage)
                      - Other Pages: Pages that don't follow the list/detail pattern have descriptive names (e.g., DashboardPage, SettingsPage)
                      */}

                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LandingPage />} />
                    <Route path="/register" element={<LandingPage />} />
                    <Route path="/forgot-password" element={<LandingPage />} />
                    <Route path="/reset-password" element={<LandingPage />} />

                    {/* Protected routes */}
                    {/* Dashboard route */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <DashboardPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Settings routes */}
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <SettingsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings/:tab"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <SettingsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Categories routes */}
                    <Route
                      path="/categories"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <CategoriesPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/categories/new"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <CategoryPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/categories/:categoryId"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <CategoryPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Transactions routes */}
                    <Route
                      path="/transactions"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <TransactionsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transactions/new"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <TransactionPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transactions/:transactionId"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <TransactionPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Expenses routes */}
                    <Route
                      path="/expenses"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <ExpensesPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/expenses/new"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <TransactionPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Income routes */}
                    <Route
                      path="/income"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <IncomePage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Budgets routes */}
                    <Route
                      path="/budgets"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <BudgetsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Tags routes */}
                    <Route
                      path="/tags"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <TagsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tags/:tagId"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <TagPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Analytics routes */}
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <AnalyticsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Bills routes */}
                    <Route
                      path="/bills"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <BillsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bills/:billId"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <BillPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Goals routes */}
                    <Route
                      path="/goals"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <GoalsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/goals/:goalId"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <GoalPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/budgets/:budgetId"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <BudgetPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Bank Accounts routes */}
                    <Route
                      path="/accounts"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <BankAccountsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/accounts/:id"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <BankAccountPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    {/* Groups routes */}
                    <Route
                      path="/groups"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <GroupsPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/groups/:id"
                      element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <GroupPage />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }
                    />

                    {/* Redirects */}
                    <Route
                      path="/home"
                      element={<Navigate to="/dashboard" replace />}
                    />

                    {/* Database check route */}
                    <Route path="/db-check" element={<DatabaseCheck />} />

                    {/* 404 route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>

                  {/* Welcome Modal for new users */}
                  <WelcomeModal
                    isOpen={showWelcomeModal}
                    onClose={handleWelcomeModalClose}
                    userName={userName}
                  />

                  {/* Translation Debugger removed */}
                </KeyboardShortcutsProvider>
              </Router>
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
